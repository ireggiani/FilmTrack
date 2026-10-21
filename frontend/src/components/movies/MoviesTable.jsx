import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import AddMovieForm from "./AddMovieForm";
import MovieFilters from "./MovieFilters";
import MoviesList from "./MoviesList";
import PosterSearchOverlay from "./PosterSearchOverlay";
import ViewsManager from "./ViewsManager";
import ConfirmDialog from "../ui/ConfirmDialog";
import { useMovies } from "./useMovies";

const MoviesTable = ({ refresh, onMoviesLoaded, hideAddForm, onViewPoster }) => {
  const {
    movies,
    loading,
    error,
    sortConfig,
    searchTerm,
    minYear,
    maxYear,
    minRating,
    maxRating,
    genreTerm,
    directorTerm,
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
    handleUploadPoster,
    handleDeletePoster,
    handleSetPosterFromTmdb,
    sortedMovies,
    requestSort,
    getSortIndicator,
    setSearchTerm,
    setMinYear,
    setMaxYear,
    setMinRating,
    setMaxRating,
    setGenreTerm,
    setDirectorTerm,
    setCountryTerm,
    setSortConfig,
  } = useMovies(refresh, onMoviesLoaded);

  const [posterSearchMovie, setPosterSearchMovie] = useState(null);
  // Rows only report which movie to delete; the dialog asks before it happens
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const pendingDeleteMovie = movies.find((m) => m.id === pendingDeleteId);

  const addMovieFormProps = useMemo(
    () => ({
      handleAddMovie,
      handleUploadPoster,
      handleSetPosterFromTmdb,
      memoizedGenreOptions,
      memoizedDirectorOptions,
      memoizedActorOptions,
      memoizedCountryOptions,
    }),
    [
      handleAddMovie,
      handleUploadPoster,
      handleSetPosterFromTmdb,
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

  if (error)
    return (
      <div className="glass loading-container" style={{ padding: '2rem' }}>
        <span className="loading-text" style={{ color: '#ff6b6b' }}>❌ {error}</span>
        <button 
          className="btn" 
          onClick={() => window.location.reload()} 
          style={{ marginTop: '1rem' }}
        >
          Retry
        </button>
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
      <AddMovieForm {...addMovieFormProps} hideAddForm={hideAddForm} />
      <ViewsManager
        sortConfig={sortConfig}
        searchTerm={searchTerm}
        minYear={minYear}
        maxYear={maxYear}
        minRating={minRating}
        maxRating={maxRating}
        genreTerm={genreTerm}
        directorTerm={directorTerm}
        countryTerm={countryTerm}
        setSortConfig={setSortConfig}
        setSearchTerm={setSearchTerm}
        setMinYear={setMinYear}
        setMaxYear={setMaxYear}
        setMinRating={setMinRating}
        setMaxRating={setMaxRating}
        setGenreTerm={setGenreTerm}
        setDirectorTerm={setDirectorTerm}
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
      <MoviesList
        sortedMovies={sortedMovies}
        requestSort={requestSort}
        getSortIndicator={getSortIndicator}
        handleUpdateMovie={handleUpdateMovie}
        handleDeleteMovie={setPendingDeleteId}
        handleUploadPoster={handleUploadPoster}
        handleDeletePoster={handleDeletePoster}
        handleSearchPoster={setPosterSearchMovie}
        handleViewPoster={onViewPoster}
        formatDate={formatDate}
        genres={genres}
        directors={directors}
        actors={actors}
        countries={countries}
      />
      {posterSearchMovie && (
        <PosterSearchOverlay
          movie={posterSearchMovie}
          onPick={handleSetPosterFromTmdb}
          onClose={() => setPosterSearchMovie(null)}
        />
      )}
      {pendingDeleteMovie && (
        <ConfirmDialog
          title="Delete Movie"
          heading={`Delete “${pendingDeleteMovie.title}”?`}
          confirmLabel="Delete"
          onConfirm={() => {
            handleDeleteMovie(pendingDeleteMovie.id).catch(() => {
              // error is surfaced through the useMovies error state
            });
            setPendingDeleteId(null);
          }}
          onCancel={() => setPendingDeleteId(null)}
        >
          The movie{pendingDeleteMovie.posterUrl ? " and its poster" : ""} will
          be permanently removed. This can&apos;t be undone.
        </ConfirmDialog>
      )}
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
  hideAddForm: PropTypes.bool,
  onViewPoster: PropTypes.func,
};

export default MoviesTable;
