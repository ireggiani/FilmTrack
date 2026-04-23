import { useState, useEffect, useCallback, memo } from "react";
import PropTypes from "prop-types";
import GlassCheckbox from "../ui/GlassCheckbox";
import FilterInput from "../ui/FilterInput";
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
  const [filterText, setFilterText] = useState('');

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

  const filteredCountries = sortedCountries.filter((c) =>
    c.name.toLowerCase().includes(filterText.toLowerCase()),
  );

  if (loading) return <div className="glass">Loading countries...</div>;

  return (
    <div className="country-list">
      <div className="list-header">
        <h3 className="heading-left--paper">Existing Countries</h3>
        {countries.length > 0 && (
          <FilterInput
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            onClear={() => setFilterText('')}
            theme="paper"
            placeholder="Filter countries…"
          />
        )}
        <GlassCheckbox
          checked={alphabetical}
          onChange={(e) => setAlphabetical(e.target.checked)}
          label="Alphabetical"
          labelClassName="paper"
        />
      </div>
      {countries.length === 0 ? (
        <p style={{ color: "rgba(255, 255, 255, 0.8)" }}>
          No countries added yet
        </p>
      ) : filteredCountries.length === 0 ? (
        <p style={{ color: "darkslategray", fontStyle: "italic", fontSize: "0.8rem", padding: "0.25rem 0.5rem", opacity: 0.7 }}>
          No countries match &ldquo;{filterText}&rdquo;
        </p>
      ) : (
        <div
          className="list"
          style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
        >
          {filteredCountries.map((country) => (
            <PillItem
              key={country.id}
              id={country.id}
              name={country.name}
              icon={country.flagEmoji}
              className="paper"
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
