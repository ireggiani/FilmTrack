import { useMemo } from "react";
import PropTypes from "prop-types";
import AddMovieForm from "./AddMovieForm";
import MovieFilters from "./MovieFilters";
import MoviesList from "./MoviesList";
import ViewsManager from "./ViewsManager";
import { useMovies } from "./useMovies";

const MoviesTable = ({ refresh, onMoviesLoaded }) => {
  const {
    movies,
    loading,
    sortConfig,
    searchTerm,
    minYear,
    maxYear,
    minRating,
    maxRating,
    genreTerm,
    countryTerm,
    genres,
    countries,
    directors,
    actors,
    formatDate,
    memoizedGenreOptions,
    memoizedDirectorOptions,
    memoizedActorOptions,
    memoizedCountryOptions,
    handleAddMovie,
    handleUpdateMovie,
    handleDeleteMovie,
    sortedMovies,
    requestSort,
    getSortIndicator,
    setSearchTerm,
    setMinYear,
    setMaxYear,
    setMinRating,
    setMaxRating,
    setGenreTerm,
    setCountryTerm,
    setSortConfig,
  } = useMovies(refresh, onMoviesLoaded);

  const addMovieFormProps = useMemo(
    () => ({
      handleAddMovie,
      memoizedGenreOptions,
      memoizedDirectorOptions,
      memoizedActorOptions,
      memoizedCountryOptions,
    }),
    [
      handleAddMovie,
      memoizedGenreOptions,
      memoizedDirectorOptions,
      memoizedActorOptions,
      memoizedCountryOptions,
    ]
  );

  if (loading)
    return (
      <div className="glass loading-container">
        <span className="loading-text">🎞️ Loading movies... 📽️</span>
      </div>
    );

  return (
    <>
      <style>
        {`[class*="menu"][class*="react-select"] { z-index: 99999 !important; backdrop-filter: blur(15px) !important; }`}
        {`[class*="control"][class*="react-select"] { min-height: 38px !important; }`}
        {`[class*="dropdownIndicator"][class*="react-select"], [class*="indicatorSeparator"][class*="react-select"] { height: 24px !important; }`}
        {`.spreadsheet-table td { font-size: 12px !important; }`}
      </style>
      <AddMovieForm {...addMovieFormProps} />
      <ViewsManager
        sortConfig={sortConfig}
        searchTerm={searchTerm}
        minYear={minYear}
        maxYear={maxYear}
        minRating={minRating}
        maxRating={maxRating}
        genreTerm={genreTerm}
        countryTerm={countryTerm}
        setSortConfig={setSortConfig}
        setSearchTerm={setSearchTerm}
        setMinYear={setMinYear}
        setMaxYear={setMaxYear}
        setMinRating={setMinRating}
        setMaxRating={setMaxRating}
        setGenreTerm={setGenreTerm}
        setCountryTerm={setCountryTerm}
      />
      <MovieFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        minYear={minYear}
        setMinYear={setMinYear}
        maxYear={maxYear}
        setMaxYear={setMaxYear}
        genreTerm={genreTerm}
        setGenreTerm={setGenreTerm}
        countryTerm={countryTerm}
        setCountryTerm={setCountryTerm}
        minRating={minRating}
        setMinRating={setMinRating}
        maxRating={maxRating}
        setMaxRating={setMaxRating}
        memoizedGenreOptions={memoizedGenreOptions}
        memoizedCountryOptions={memoizedCountryOptions}
      />
      <MoviesList
        sortedMovies={sortedMovies}
        requestSort={requestSort}
        getSortIndicator={getSortIndicator}
        handleUpdateMovie={handleUpdateMovie}
        handleDeleteMovie={handleDeleteMovie}
        formatDate={formatDate}
        genres={genres}
        directors={directors}
        actors={actors}
        countries={countries}
      />
      {movies.length === 0 && (
        <p
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            textAlign: "center",
            marginTop: "2rem",
          }}
        >
          No movies added yet. Use the form above to add your first movie!
        </p>
      )}
    </>
  );
};

MoviesTable.propTypes = {
  refresh: PropTypes.number,
  onMoviesLoaded: PropTypes.func,
};

export default MoviesTable;
