import React, { useRef } from "react";
import StyledSelect from "../ui/StyledSelect";
import "../../styles/movies/_filter-controls.scss";

const FilterControls = ({ ...props }) => {
  const searchInputRef = useRef(null);

  const clearSearch = (e) => {
    e.stopPropagation();
    props.setSearchTerm("");
    searchInputRef.current?.focus();
  };

  // Escape empties whichever text/number filter has focus
  const clearOnEscape = (setter) => (e) => {
    if (e.key === "Escape") setter("");
  };

  const hasActiveFilters = Boolean(
    props.searchTerm ||
      props.minYear ||
      props.maxYear ||
      props.minRating ||
      props.maxRating ||
      props.genreTerm?.length ||
      props.directorTerm?.length ||
      props.countryTerm?.length
  );

  const resetFilters = (e) => {
    e.stopPropagation();
    props.setSearchTerm("");
    props.setMinYear("");
    props.setMaxYear("");
    props.setMinRating("");
    props.setMaxRating("");
    props.setGenreTerm([]);
    props.setDirectorTerm?.([]);
    props.setCountryTerm?.([]);
  };

  return (
    <div className="filter-controls">
      <div className="filter-input-group">
        <label htmlFor="filter-by-name">Title:</label>
        <input
          ref={searchInputRef}
          id="filter-by-name"
          type="text"
          value={props.searchTerm}
          onChange={(e) => props.setSearchTerm(e.target.value)}
          onKeyDown={clearOnEscape(props.setSearchTerm)}
          placeholder="Search by title..."
          className="text-field"
        />
        {props.searchTerm && (
          <button
            type="button"
            className="filter-clear"
            onClick={clearSearch}
            tabIndex={-1}
            aria-label="Clear title search"
          >
            ×
          </button>
        )}
      </div>
      <input
        type="number"
        value={props.minYear}
        onChange={(e) => props.setMinYear(e.target.value)}
        onKeyDown={clearOnEscape(props.setMinYear)}
        placeholder="Min Year"
        className="text-field year-input"
        min="1888"
        max={new Date().getFullYear()}
      />
      <input
        type="number"
        value={props.maxYear}
        onChange={(e) => props.setMaxYear(e.target.value)}
        onKeyDown={clearOnEscape(props.setMaxYear)}
        placeholder="Max Year"
        className="text-field year-input"
        min="1888"
        max={new Date().getFullYear()}
      />
      <StyledSelect
        isMulti
        closeMenuOnScroll={false}
        closeMenuOnBlur={false}
        options={props.memoizedGenreOptions}
        value={props.memoizedGenreOptions.filter((opt) =>
          props.genreTerm.includes(opt.value)
        )}
        onChange={(selected) =>
          props.setGenreTerm(selected ? selected.map((s) => s.value) : [])
        }
        placeholder="Select genres"
        className="genre-select"
      />
      <StyledSelect
        isMulti
        closeMenuOnScroll={false}
        closeMenuOnBlur={false}
        options={props.memoizedDirectorOptions || []}
        value={(props.memoizedDirectorOptions || []).filter((opt) =>
          (props.directorTerm || []).includes(opt.value)
        )}
        onChange={(selected) =>
          props.setDirectorTerm?.(selected ? selected.map((s) => s.value) : [])
        }
        placeholder="Select directors"
      />
      <StyledSelect
        isMulti
        closeMenuOnScroll={false}
        closeMenuOnBlur={false}
        options={props.memoizedCountryOptions || []}
        value={(props.memoizedCountryOptions || []).filter((opt) =>
          (props.countryTerm || []).includes(opt.value)
        )}
        onChange={(selected) =>
          props.setCountryTerm?.(selected ? selected.map((s) => s.value) : [])
        }
        placeholder="Select countries"
      />
      <input
        type="number"
        value={props.minRating}
        onChange={(e) => props.setMinRating(e.target.value)}
        onKeyDown={clearOnEscape(props.setMinRating)}
        placeholder="Min Rating"
        className="text-field rating-input"
        min="0"
        max="10"
      />
      <input
        type="number"
        value={props.maxRating}
        onChange={(e) => props.setMaxRating(e.target.value)}
        onKeyDown={clearOnEscape(props.setMaxRating)}
        placeholder="Max Rating"
        className="text-field rating-input"
        min="0"
        max="10"
      />
      <button
        type="button"
        className="btn reset-filters-btn"
        onClick={resetFilters}
        disabled={!hasActiveFilters}
        title="Reset all filters"
        aria-label="Reset all filters"
      >
        🧹
      </button>
    </div>
  );
};

export default React.memo(FilterControls);
