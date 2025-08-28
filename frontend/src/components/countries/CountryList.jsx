import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import GlassCheckbox from "../ui/GlassCheckbox";
import PillItem from "../ui/PillItem";

const CountryList = ({
  refresh,
  onCountriesLoaded,
  onCountryEdit,
  onCountryDelete,
}) => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alphabetical, setAlphabetical] = useState(true);

  const fetchCountries = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/countries");
      const data = await response.json();
      setCountries(data);
      onCountriesLoaded?.(data);
    } catch (error) {
      console.error("Error fetching countries:", error);
    } finally {
      setLoading(false);
    }
  }, [onCountriesLoaded]);

  useEffect(() => {
    fetchCountries();
  }, [refresh, fetchCountries]);

  const sortedCountries = alphabetical
    ? [...countries].sort((a, b) => a.name.localeCompare(b.name))
    : countries;

  if (loading) return <div className="glass">Loading countries...</div>;

  return (
    <div className="glass" style={{ padding: "1.5rem", marginTop: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h3
          style={{
            color: "white",
            margin: 0,
            textShadow:
              "0 1px 3px rgba(0, 0, 0, 0.8), 0 0 10px rgba(0, 0, 0, 0.3)",
          }}
        >
          Existing Countries
        </h3>
        <GlassCheckbox
          checked={alphabetical}
          onChange={(e) => setAlphabetical(e.target.checked)}
          label="Alphabetical"
        />
      </div>
      {countries.length === 0 ? (
        <p style={{ color: "rgba(255, 255, 255, 0.8)" }}>
          No countries added yet
        </p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {sortedCountries.map((country) => (
            <PillItem
              key={country.id}
              id={country.id}
              name={country.name}
              icon={country.flagEmoji}
              onEdit={() => {
                onCountryEdit?.(country);
                setTimeout(() => {
                  const input = document.querySelector("#countryName");
                  input?.focus();
                }, 10);
              }}
              onDelete={onCountryDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

CountryList.propTypes = {
  refresh: PropTypes.number,
  onCountriesLoaded: PropTypes.func,
  onCountryEdit: PropTypes.func,
  onCountryDelete: PropTypes.func,
};

export default CountryList;
