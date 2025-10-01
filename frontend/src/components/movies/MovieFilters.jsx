import React from "react";
import FilterControls from "./FilterControls";

const MovieFilters = ({
  searchTerm,
  setSearchTerm,
  minYear,
  setMinYear,
  maxYear,
  setMaxYear,
  genreTerm,
  setGenreTerm,
  minRating,
  setMinRating,
  maxRating,
  setMaxRating,
  memoizedGenreOptions,
}) => {
  return (
    <FilterControls
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      minYear={minYear}
      setMinYear={setMinYear}
      maxYear={maxYear}
      setMaxYear={setMaxYear}
      genreTerm={genreTerm}
      setGenreTerm={setGenreTerm}
      minRating={minRating}
      setMinRating={setMinRating}
      maxRating={maxRating}
      setMaxRating={setMaxRating}
      memoizedGenreOptions={memoizedGenreOptions}
    />
  );
};

export default MovieFilters;
