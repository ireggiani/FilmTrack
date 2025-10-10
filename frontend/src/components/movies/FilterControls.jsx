import React from "react";
import StyledSelect from "../ui/StyledSelect";
import "../../styles/movies/_filter-controls.scss";

const FilterControls = ({ ...props }) => {
  return (
    <div className="filter-controls">
      <div className="filter-input-group">
        <label htmlFor="filter-by-name">Title:</label>
        <input
          id="filter-by-name"
          type="text"
          value={props.searchTerm}
          onChange={(e) => props.setSearchTerm(e.target.value)}
          placeholder="Search by title..."
          className="text-field"
        />
      </div>
      <input
        type="number"
        value={props.minYear}
        onChange={(e) => props.setMinYear(e.target.value)}
        placeholder="Min Year"
        className="text-field year-input"
      />
      <input
        type="number"
        value={props.maxYear}
        onChange={(e) => props.setMaxYear(e.target.value)}
        placeholder="Max Year"
        className="text-field year-input"
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
      />
      <input
        type="number"
        value={props.minRating}
        onChange={(e) => props.setMinRating(e.target.value)}
        placeholder="Min Rating"
        className="text-field rating-input"
      />
      <input
        type="number"
        value={props.maxRating}
        onChange={(e) => props.setMaxRating(e.target.value)}
        placeholder="Max Rating"
        className="text-field rating-input"
      />
    </div>
  );
};

export default React.memo(FilterControls);
