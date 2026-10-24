import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import StyledSelect from "../ui/StyledSelect";
import PosterSearchOverlay from "./PosterSearchOverlay";
import { parseWatchedDate, tidyDateInput, DATE_HINT } from "./watchedDate";
import "../../styles/movies/_add-movie-form.scss";

const AddMovieForm = ({
  handleAddMovie,
  handleUploadPoster,
  handleSetPosterFromTmdb,
  hideAddForm,
  focusTitle,
  onTitleFocused,
  ...props
}) => {
  const [newMovie, setNewMovie] = useState({
    title: "",
    alternativeTitle: "",
    releaseYear: "",
    rating: "",
    watchedDate: "",
    genreIds: [],
    countryIds: [],
    directorIds: [],
    actorIds: [],
  });

  // Poster chosen before the movie exists: { posterPath, previewUrl } from
  // TMDB or { file, previewUrl } from disk. Attached once the movie is created.
  const [stagedPoster, setStagedPoster] = useState(null);
  const [posterMenuPos, setPosterMenuPos] = useState(null);
  const [posterPreviewPos, setPosterPreviewPos] = useState(null);
  const [posterSearchMovie, setPosterSearchMovie] = useState(null);

  const [dateError, setDateError] = useState(false);

  const titleInputRef = useRef(null);
  const dateInputRef = useRef(null);
  const addButtonRef = useRef(null);
  const posterInputRef = useRef(null);

  // Asked to focus the title (the desktop menu's "New Movie")
  useEffect(() => {
    if (!focusTitle) return;
    titleInputRef.current?.focus();
    onTitleFocused?.();
  }, [focusTitle, onTitleFocused]);

  // Release the object URL of a replaced/cleared uploaded file
  useEffect(() => {
    if (!stagedPoster?.file) return undefined;
    return () => URL.revokeObjectURL(stagedPoster.previewUrl);
  }, [stagedPoster]);

  // Close the poster menu on any outside click or Escape (same as MovieRow)
  useEffect(() => {
    if (!posterMenuPos) return undefined;
    const close = () => setPosterMenuPos(null);
    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("click", close);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [posterMenuPos]);

  const openPosterMenu = (e) => {
    e.stopPropagation();
    setPosterPreviewPos(null);
    const rect = e.currentTarget.getBoundingClientRect();
    setPosterMenuPos({ top: rect.bottom + 4, left: rect.right });
  };

  const handlePosterFileChange = (e) => {
    const file = e.target.files[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    setStagedPoster({ file, previewUrl: URL.createObjectURL(file) });
  };

  const openPosterSearch = () => {
    // Snapshot so typing in the form doesn't re-trigger the overlay's search
    setPosterSearchMovie({
      title: newMovie.title.trim(),
      alternativeTitle: newMovie.alternativeTitle,
      releaseYear: newMovie.releaseYear || undefined,
    });
  };

  const showPosterPreview = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosterPreviewPos({
      top: Math.min(rect.top, window.innerHeight - 320),
      left: rect.left - 8,
    });
  };

  const handleNewMovieChange = (field, value) => {
    setNewMovie((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateBlur = (e) => {
    handleNewMovieChange("watchedDate", tidyDateInput(e.target.value));
    setDateError(!parseWatchedDate(e.target.value).valid);
  };

  const onAddMovie = () => {
    // Refuse to add with an unreadable date rather than storing garbage
    const date = parseWatchedDate(newMovie.watchedDate);
    if (!date.valid) {
      setDateError(true);
      dateInputRef.current?.focus();
      return;
    }

    // Filter out invalid IDs that may have been deleted
    const validGenreIds = newMovie.genreIds.filter(id => 
      props.memoizedGenreOptions.some(opt => opt.value === id)
    );
    const validDirectorIds = newMovie.directorIds.filter(id => 
      props.memoizedDirectorOptions.some(opt => opt.value === id)
    );
    const validActorIds = newMovie.actorIds.filter(id => 
      props.memoizedActorOptions.some(opt => opt.value === id)
    );
    const validCountryIds = newMovie.countryIds.filter(id => 
      props.memoizedCountryOptions.some(opt => opt.value === id)
    );
    
    const validatedMovie = {
      ...newMovie,
      watchedDate: date.iso,
      genreIds: validGenreIds,
      directorIds: validDirectorIds,
      actorIds: validActorIds,
      countryIds: validCountryIds,
    };
    
    const posterToAttach = stagedPoster;
    handleAddMovie(validatedMovie)
      .then((addedMovie) => {
        if (!addedMovie || !posterToAttach) return undefined;
        return posterToAttach.file
          ? handleUploadPoster(addedMovie.id, posterToAttach.file)
          : handleSetPosterFromTmdb(addedMovie.id, posterToAttach.posterPath);
      })
      .catch(() => {
        // error is surfaced through the useMovies error state
      });
    setStagedPoster(null);
    setNewMovie({
      title: "",
      alternativeTitle: "",
      releaseYear: "",
      rating: "",
      watchedDate: "",
      genreIds: [],
      countryIds: [],
      directorIds: [],
      actorIds: [],
    });
    titleInputRef.current.focus();
  };

  const handleCountryKeyDown = (e) => {
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      addButtonRef.current.focus();
    }
  };

  return (
    <div className={`add-movie-form${hideAddForm ? ' hide' : ''}`}>
      <input
        ref={titleInputRef}
        type="text"
        value={newMovie.title}
        onChange={(e) => handleNewMovieChange("title", e.target.value)}
        placeholder="Movie title"
        className="text-field"
      />
      <input
        type="text"
        value={newMovie.alternativeTitle}
        onChange={(e) =>
          handleNewMovieChange("alternativeTitle", e.target.value)
        }
        placeholder="Alternative title"
        className="text-field"
      />
      <input
        type="number"
        value={newMovie.releaseYear}
        onChange={(e) =>
          handleNewMovieChange("releaseYear", parseInt(e.target.value) || "")
        }
        placeholder="Release year"
        className="text-field"
      />
      <input
        type="text"
        value={newMovie.rating}
        onChange={(e) => handleNewMovieChange("rating", e.target.value)}
        placeholder="Rating"
        className="text-field"
      />
      <input
        ref={dateInputRef}
        type="text"
        value={newMovie.watchedDate}
        onBlur={handleDateBlur}
        onChange={(e) => {
          handleNewMovieChange("watchedDate", e.target.value);
          setDateError(false);
        }}
        placeholder="DD/MM or DD/MM/YYYY"
        className={`text-field${dateError ? " invalid" : ""}`}
        title={dateError ? `Not a valid date. ${DATE_HINT}` : undefined}
      />
      <StyledSelect
        isMulti
        closeMenuOnScroll={false}
        closeMenuOnBlur={false}
        options={props.memoizedGenreOptions}
        value={props.memoizedGenreOptions.filter((opt) =>
          newMovie.genreIds.includes(opt.value)
        )}
        onChange={(selected) =>
          handleNewMovieChange(
            "genreIds",
            selected ? selected.map((s) => s.value) : []
          )
        }
        placeholder="Select genres"
      />
      <StyledSelect
        isMulti
        closeMenuOnScroll={false}
        closeMenuOnBlur={false}
        options={props.memoizedDirectorOptions}
        value={props.memoizedDirectorOptions.filter((opt) =>
          newMovie.directorIds.includes(opt.value)
        )}
        onChange={(selected) =>
          handleNewMovieChange(
            "directorIds",
            selected ? selected.map((s) => s.value) : []
          )
        }
        placeholder="Select directors"
      />
      <StyledSelect
        isMulti
        closeMenuOnScroll={false}
        closeMenuOnBlur={false}
        options={props.memoizedActorOptions}
        value={props.memoizedActorOptions.filter((opt) =>
          newMovie.actorIds.includes(opt.value)
        )}
        onChange={(selected) =>
          handleNewMovieChange(
            "actorIds",
            selected ? selected.map((s) => s.value) : []
          )
        }
        placeholder="Select actors"
      />
      <StyledSelect
        isMulti
        closeMenuOnScroll={false}
        closeMenuOnBlur={false}
        options={props.memoizedCountryOptions}
        value={props.memoizedCountryOptions.filter((opt) =>
          newMovie.countryIds.includes(opt.value)
        )}
        onChange={(selected) =>
          handleNewMovieChange(
            "countryIds",
            selected ? selected.map((s) => s.value) : []
          )
        }
        onKeyDown={handleCountryKeyDown}
        placeholder="Select countries"
      />
      <div className="add-movie-actions">
        <input
          ref={posterInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={handlePosterFileChange}
        />
        <button
          onClick={openPosterMenu}
          onMouseEnter={stagedPoster ? showPosterPreview : undefined}
          onMouseLeave={() => setPosterPreviewPos(null)}
          className={`btn poster-btn ${stagedPoster ? "has-poster" : "no-poster"}`}
          title={stagedPoster ? "Change poster" : "Add poster"}
        >
          {stagedPoster ? (
            <img src={stagedPoster.previewUrl} alt="Selected poster" />
          ) : (
            "🖼️"
          )}
        </button>
        <button
          ref={addButtonRef}
          onClick={onAddMovie}
          disabled={!newMovie.title.trim() || !newMovie.releaseYear}
          className="btn add-movie-btn"
        >
          Add Movie
        </button>
      </div>
      {posterMenuPos &&
        createPortal(
          <div
            className="poster-menu"
            style={{ top: posterMenuPos.top, left: posterMenuPos.left }}
          >
            <button
              onClick={() => {
                setPosterMenuPos(null);
                posterInputRef.current?.click();
              }}
            >
              📁 Upload file…
            </button>
            <button
              onClick={() => {
                setPosterMenuPos(null);
                openPosterSearch();
              }}
              disabled={!newMovie.title.trim()}
              title={newMovie.title.trim() ? undefined : "Type a title first"}
            >
              🔍 Search TMDB…
            </button>
            {stagedPoster && (
              <button
                onClick={() => {
                  setPosterMenuPos(null);
                  setStagedPoster(null);
                }}
              >
                🚫 Remove poster
              </button>
            )}
          </div>,
          document.body
        )}
      {posterPreviewPos &&
        stagedPoster &&
        createPortal(
          <div
            className="poster-preview"
            style={{ top: posterPreviewPos.top, left: posterPreviewPos.left }}
          >
            <img src={stagedPoster.previewUrl} alt="Selected poster" />
          </div>,
          document.body
        )}
      {posterSearchMovie && (
        <PosterSearchOverlay
          movie={posterSearchMovie}
          onPick={(_movieId, posterPath, result) =>
            setStagedPoster({ posterPath, previewUrl: result.thumbUrl })
          }
          onClose={() => setPosterSearchMovie(null)}
        />
      )}
    </div>
  );
};

export default React.memo(AddMovieForm);
