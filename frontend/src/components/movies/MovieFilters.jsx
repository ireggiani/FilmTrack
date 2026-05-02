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
  directorTerm,
  setDirectorTerm,
  countryTerm,
  setCountryTerm,
  minRating,
  setMinRating,
  maxRating,
  setMaxRating,
  memoizedGenreOptions,
  memoizedDirectorOptions,
  memoizedCountryOptions,
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
      directorTerm={directorTerm}
      setDirectorTerm={setDirectorTerm}
      countryTerm={countryTerm}
      setCountryTerm={setCountryTerm}
      minRating={minRating}
      setMinRating={setMinRating}
      maxRating={maxRating}
      setMaxRating={setMaxRating}
      memoizedGenreOptions={memoizedGenreOptions}
      memoizedDirectorOptions={memoizedDirectorOptions}
      memoizedCountryOptions={memoizedCountryOptions}
    />
  );
};

export default MovieFilters;
