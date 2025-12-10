import { useState, useRef, useEffect, memo } from "react";
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
  const [formId] = useState(() => Math.random().toString(36).substr(2, 9));
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
        setError("🚫 Error: Country with that name already exists.");
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
    <form className="country-form" onSubmit={handleSubmit}>
      <h2 className="heading-centre--paper">
        {isEditing ? "Edit Country" : "Add New Country"}
      </h2>

      <div className="inputs">
        <div className="form-group">
          <label htmlFor={`countryName-${formId}`} className="paper">
            Country Name
          </label>
          <input
            ref={inputRef}
            id={`countryName-${formId}`}
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="Enter country name"
            disabled={loading}
            className="text-field"
          />
        </div>
        <div className="form-group">
          <label htmlFor={`flagEmoji-${formId}`} className="paper">
            Flag Emoji
          </label>
          <input
            id={`flagEmoji-${formId}`}
            type="text"
            value={flagEmoji}
            onChange={(e) => {
              const value = e.target.value;
              // Limit to 4 characters (max for complex emoji like flags)
              if (value.length <= 4) {
                setFlagEmoji(value);
                setError("");
              }
            }}
            placeholder="🇺🇸"
            disabled={loading}
            className="text-field"
            maxLength={4}
          />
        </div>
      </div>

      <div className="buttons">
        {isEditing && (
          <button
            type="button"
            onClick={() => onEditComplete?.()}
            className="btn--cork"
          >
            ← Cancel Edit
          </button>
        )}
        {error && <p className="error--paper">{error}</p>}
        <button
          type="submit"
          className="btn--cork submit"
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
      </div>
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

export default memo(CountryForm);
