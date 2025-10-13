import { useState, useEffect, useCallback, memo } from "react";
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
    <div className="country-list">
      <div className="list-header">
        <h3 className="heading-left">Existing Countries</h3>
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
        <div
          className="list"
          style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
        >
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

export default memo(CountryList);
