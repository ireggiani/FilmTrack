import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

const DirectorForm = ({
  onDirectorAdded,
  existingDirectors = [],
  editingDirector,
  onEditComplete,
  hideDirectorForm,
}) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const isEditing = !!editingDirector;

  useEffect(() => {
    if (editingDirector) {
      setName(editingDirector.name);
      setError("");
    } else {
      setName("");
    }
  }, [editingDirector]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const trimmedName = name.trim();

    if (!isEditing) {
      const isDuplicate = existingDirectors.some(
        (director) => director.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDuplicate) {
        setError("🚫 Error: That director already exists.");
        return;
      }
    }

    setError("");
    setLoading(true);
    try {
      const url = isEditing
        ? `http://localhost:5000/api/directors/${editingDirector.id}`
        : "http://localhost:5000/api/directors";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });

      if (response.ok) {
        const director = await response.json();
        setName("");
        if (isEditing) {
          onEditComplete?.();
        } else {
          onDirectorAdded?.(director);
          requestAnimationFrame(() => inputRef.current?.focus());
        }
      }
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "creating"} director:`,
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className={`director-form${hideDirectorForm ? " hide" : ""}`}
      onSubmit={handleSubmit}
    >
      <h2 className="heading-centre--metal">
        {isEditing ? "Edit Director" : "Add New Director"}
      </h2>

      <div className="form-group">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          placeholder="Enter director name"
          aria-label="Director Name"
          disabled={loading}
          className="text-field"
        />
      </div>
      <div className="buttons">
        <div className="buttons-inner">
          {isEditing && (
            <button
              type="button"
              onClick={() => onEditComplete?.()}
              className="btn"
            >
              ← Cancel Edit
            </button>
          )}
          {error && <p className="error">{error}</p>}
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
              ? "Update Director"
              : "Add Director"}
          </button>
        </div>
      </div>
    </form>
  );
};

DirectorForm.propTypes = {
  onDirectorAdded: PropTypes.func,
  existingDirectors: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })
  ),
  editingDirector: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  }),
  onEditComplete: PropTypes.func,
  hideDirectorForm: PropTypes.bool,
};

export default DirectorForm;
