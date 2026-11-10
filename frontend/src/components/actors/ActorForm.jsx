import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import api from "../../services/api.js";

const ActorForm = ({
  onActorAdded,
  existingActors = [],
  editingActor,
  onEditComplete,
}) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const isEditing = !!editingActor;

  useEffect(() => {
    if (editingActor) {
      setName(editingActor.name);
      setError("");
    } else {
      setName("");
    }
  }, [editingActor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const trimmedName = name.trim();

    if (!isEditing) {
      const isDuplicate = existingActors.some(
        (actor) => actor.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDuplicate) {
        setError("Actor already exists");
        return;
      }
    }

    setError("");
    setLoading(true);
    try {
      const url = isEditing
        ? `/actors/${editingActor.id}`
        : "/actors";

      const save = isEditing ? api.put : api.post;
      const actor = await save(url, { name: trimmedName }, "Could not save the actor");
      setName("");
      if (isEditing) {
        onEditComplete?.();
      } else {
        onActorAdded?.(actor);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "creating"} actor:`,
        error
      );
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="actor-form " onSubmit={handleSubmit}>
      <h2 className="heading-centre">
        {isEditing ? "Edit Actor" : "Add New Actor"}
      </h2>

      <div className="form-group">
        <label htmlFor="actorName">Actor Name</label>
        <input
          ref={inputRef}
          id="actorName"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          placeholder="Enter actor name"
          disabled={loading}
          className="text-field"
        />
        {error && (
          <p
            style={{
              color: "#ff6b6b",
              fontSize: "0.9rem",
              marginTop: "0.5rem",
            }}
          >
            {error}
          </p>
        )}
      </div>
      <div className="buttons">
        {isEditing && (
          <button
            type="button"
            className="btn"
            onClick={() => onEditComplete?.()}
          >
            ← Cancel Edit
          </button>
        )}
        <button
          type="submit"
          className="btn submit"
          disabled={loading || !name.trim()}
        >
          {loading
            ? isEditing
              ? "Updating..."
              : "Adding..."
            : isEditing
            ? "Update Actor"
            : "Add Actor"}
        </button>
      </div>
    </form>
  );
};

ActorForm.propTypes = {
  onActorAdded: PropTypes.func,
  existingActors: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })
  ),
  editingActor: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  }),
  onEditComplete: PropTypes.func,
};

export default ActorForm;
