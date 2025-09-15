import React from "react";
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
          className="movie-table-input"
        />
      </div>
      <input
        type="number"
        value={props.minYear}
        onChange={(e) => props.setMinYear(e.target.value)}
        placeholder="Min Year"
        className="movie-table-input year-input"
      />
      <input
        type="number"
        value={props.maxYear}
        onChange={(e) => props.setMaxYear(e.target.value)}
        placeholder="Max Year"
        className="movie-table-input year-input"
      />
      <input
        type="text"
        value={props.genreTerm}
        onChange={(e) => props.setGenreTerm(e.target.value)}
        placeholder="Genre"
        className="movie-table-input"
      />
      <input
        type="number"
        value={props.minRating}
        onChange={(e) => props.setMinRating(e.target.value)}
        placeholder="Min Rating"
        className="movie-table-input rating-input"
      />
      <input
        type="number"
        value={props.maxRating}
        onChange={(e) => props.setMaxRating(e.target.value)}
        placeholder="Max Rating"
        className="movie-table-input rating-input"
      />
    </div>
  );
};

export default React.memo(FilterControls);
