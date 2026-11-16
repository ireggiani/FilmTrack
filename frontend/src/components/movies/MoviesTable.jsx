import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import AddMovieForm from "./AddMovieForm";
import MovieFilters from "./MovieFilters";
import MoviesList from "./MoviesList";
import PosterSearchOverlay from "./PosterSearchOverlay";
import ViewsManager from "./ViewsManager";
import TitleSearch from "./TitleSearch";
import ConfirmDialog from "../ui/ConfirmDialog";
import { useMovies } from "./useMovies";
import { MOVIE_KIND } from "./kinds";

const MoviesTable = ({
  hideAddForm,
  focusTitle,
  onTitleFocused,
  onViewPoster,
  kind = MOVIE_KIND,
}) => {
  const {
    movies,
    loading,
    error,
    saveError,
    clearSaveError,
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
  } = useMovies(kind);

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
        <span className="loading-text">🎞️ Loading {kind.plural}... 📽️</span>
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
      <AddMovieForm
        {...addMovieFormProps}
        kind={kind}
        hideAddForm={hideAddForm}
        focusTitle={focusTitle}
        onTitleFocused={onTitleFocused}
      />
      {/* One bordered row: the views button, then the filters */}
      <div className="filter-bar">
        {kind.savedViews && (
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
        )}
        {kind.filters === "full" ? (
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
        ) : (
          <TitleSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            shown={sortedMovies.length}
            total={movies.length}
            plural={kind.plural}
          />
        )}
      </div>
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
        popupClass={kind.popupClass}
      />
      {posterSearchMovie && (
        <PosterSearchOverlay
          movie={posterSearchMovie}
          tmdbType={kind.tmdbType}
          onPick={handleSetPosterFromTmdb}
          onClose={() => setPosterSearchMovie(null)}
        />
      )}
      {saveError && (
        <ConfirmDialog
          title={kind.listTitle}
          heading="The change couldn't be saved"
          icon="info"
          cancelLabel={null}
          onConfirm={clearSaveError}
          onCancel={clearSaveError}
        >
          {saveError}
        </ConfirmDialog>
      )}
      {pendingDeleteMovie && (
        <ConfirmDialog
          title={`Delete ${kind.label}`}
          heading={`Delete “${pendingDeleteMovie.title}”?`}
          confirmLabel="Delete"
          onConfirm={() => {
            handleDeleteMovie(pendingDeleteMovie.id).catch(() => {
              // error is shown in the window's error dialog
            });
            setPendingDeleteId(null);
          }}
          onCancel={() => setPendingDeleteId(null)}
        >
          The {kind.noun}{pendingDeleteMovie.posterUrl ? " and its poster" : ""} will
          be permanently removed. This can&apos;t be undone.
        </ConfirmDialog>
      )}
      {movies.length === 0 && (
        <p className="empty-list-message">
          No {kind.plural} added yet. Use the form above to add your first{" "}
          {kind.noun}!
        </p>
      )}
    </>
  );
};

MoviesTable.propTypes = {
  hideAddForm: PropTypes.bool,
  focusTitle: PropTypes.bool,
  onTitleFocused: PropTypes.func,
  onViewPoster: PropTypes.func,
  kind: PropTypes.object,
};

export default MoviesTable;
