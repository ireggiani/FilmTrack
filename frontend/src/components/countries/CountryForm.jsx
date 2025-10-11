import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

const CountryForm = ({
  onCountryAdded,
  existingCountries = [],
  editingCountry,
  onEditComplete,
}) => {
  const [name, setName] = useState("");
  const [flagEmoji, setFlagEmoji] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const isEditing = !!editingCountry;

  useEffect(() => {
    if (editingCountry) {
      setName(editingCountry.name);
      setFlagEmoji(editingCountry.flagEmoji);
      setError("");
    } else {
      setName("");
      setFlagEmoji("");
    }
  }, [editingCountry]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !flagEmoji.trim()) return;

    const trimmedName = name.trim();
    const trimmedFlag = flagEmoji.trim();

    if (!isEditing) {
      const isDuplicate = existingCountries.some(
        (country) => country.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDuplicate) {
        setError("Country already exists");
        return;
      }
    }

    setError("");
    setLoading(true);
    try {
      const url = isEditing
        ? `http://localhost:5000/api/countries/${editingCountry.id}`
        : "http://localhost:5000/api/countries";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, flagEmoji: trimmedFlag }),
      });

      if (response.ok) {
        const country = await response.json();
        setName("");
        setFlagEmoji("");
        if (isEditing) {
          onEditComplete?.();
        } else {
          onCountryAdded?.(country);
          requestAnimationFrame(() => inputRef.current?.focus());
        }
      }
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "creating"} country:`,
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="glass-form" onSubmit={handleSubmit}>
      <h2>{isEditing ? "Edit Country" : "Add New Country"}</h2>
      {isEditing && (
        <button
          type="button"
          onClick={() => onEditComplete?.()}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "0.8rem",
            cursor: "pointer",
            marginBottom: "1rem",
            textShadow: "0 1px 3px rgba(0, 0, 0, 0.8)",
          }}
        >
          ← Cancel Edit
        </button>
      )}
      <div className="form-group">
        <label htmlFor="countryName">Country Name</label>
        <input
          ref={inputRef}
          id="countryName"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          placeholder="Enter country name"
          disabled={loading}
        />
      </div>
      <div className="form-group">
        <label htmlFor="flagEmoji">Flag Emoji</label>
        <input
          id="flagEmoji"
          type="text"
          value={flagEmoji}
          onChange={(e) => {
            setFlagEmoji(e.target.value);
            setError("");
          }}
          placeholder="🇺🇸"
          disabled={loading}
        />
      </div>
      {error && (
        <p
          style={{ color: "#ff6b6b", fontSize: "0.9rem", marginTop: "0.5rem" }}
        >
          {error}
        </p>
      )}
      <button
        type="submit"
        className="btn"
        disabled={loading || !name.trim() || !flagEmoji.trim()}
      >
        {loading
          ? isEditing
            ? "Updating..."
            : "Adding..."
          : isEditing
          ? "Update Country"
          : "Add Country"}
      </button>
    </form>
  );
};

CountryForm.propTypes = {
  onCountryAdded: PropTypes.func,
  existingCountries: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      flagEmoji: PropTypes.string,
    })
  ),
  editingCountry: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    flagEmoji: PropTypes.string,
  }),
  onEditComplete: PropTypes.func,
};

export default CountryForm;
