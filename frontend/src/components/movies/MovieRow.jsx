import React, { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import StyledSelect from "../ui/StyledSelect";
import { ASSETS_BASE_URL } from "../../config/api";
import { parseWatchedDate, toDateInput, tidyDateInput, DATE_HINT } from "./watchedDate";

// Edit-mode copy of a movie: relation ids, and the date as DD/MM/YYYY text
const toEditable = (movie) => ({
  ...movie,
  watchedDate: toDateInput(movie.watchedDate),
  genreIds: movie.Genres ? movie.Genres.map((g) => g.id) : [],
  directorIds: movie.Directors ? movie.Directors.map((d) => d.id) : [],
  actorIds: movie.Actors ? movie.Actors.map((a) => a.id) : [],
  countryIds: movie.Countries ? movie.Countries.map((c) => c.id) : [],
});

const MovieRow = ({ movie, onUpdate, onDelete, onUploadPoster, onDeletePoster, onSearchPoster, onViewPoster, genres, directors, actors, countries, formatDate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [posterPreviewPos, setPosterPreviewPos] = useState(null);
  const [posterMenuPos, setPosterMenuPos] = useState(null);
  const posterInputRef = useRef(null);
  const [editedMovie, setEditedMovie] = useState(() => toEditable(movie));
  const [dateError, setDateError] = useState(false);

  const handleInputChange = (field, value) => {
    setEditedMovie((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field, selected) => {
    const ids = selected ? selected.map((s) => s.value) : [];
    setEditedMovie((prev) => ({ ...prev, [field]: ids }));
  };

  const handleDateBlur = (e) => {
    const { value } = e.target;
    setEditedMovie((prev) => ({ ...prev, watchedDate: tidyDateInput(value) }));
    setDateError(!parseWatchedDate(value).valid);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      saveChanges();
    }
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const openPosterPicker = () => {
    posterInputRef.current?.click();
  };

  const handlePosterFileChange = async (e) => {
    const file = e.target.files[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    setIsUploadingPoster(true);
    try {
      await onUploadPoster(movie.id, file);
    } catch {
      // error is surfaced through the useMovies error state
    } finally {
      setIsUploadingPoster(false);
    }
  };

  const handleRemovePoster = () => {
    onDeletePoster(movie.id).catch(() => {});
  };

  const openPosterMenu = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setPosterMenuPos({ top: rect.bottom + 4, left: rect.right });
  };

  // Close the poster menu on any outside click or Escape. The listener is
  // registered after the opening click has finished bubbling, so it won't
  // close the menu immediately.
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

  const showPosterPreview = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosterPreviewPos({
      // keep the popup inside the viewport (matches its max-height + padding)
      top: Math.min(rect.top, window.innerHeight - 320),
      left: rect.left - 8,
    });
  };

  const hidePosterPreview = () => setPosterPreviewPos(null);

  // Title and year are mandatory, as in the add form
  const missingTitle = !String(editedMovie.title ?? "").trim();
  const missingYear = !editedMovie.releaseYear;
  const canSave = !missingTitle && !missingYear;

  // Also reached by Enter in any field, so the date may not have been
  // blurred/tidied yet — parse it here rather than trusting the text
  const saveChanges = () => {
    if (!canSave) return;
    const date = parseWatchedDate(editedMovie.watchedDate);
    if (!date.valid) {
      setDateError(true);
      return;
    }
    onUpdate(movie.id, { ...editedMovie, watchedDate: date.iso });
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setEditedMovie(toEditable(movie));
    setDateError(false);
    setIsEditing(false);
  };

  const genreOptions = useMemo(
    () => genres.map((g) => ({ value: g.id, label: g.name })).sort((a, b) => a.label.localeCompare(b.label)),
    [genres],
  );
  const genreValues = useMemo(
    () => genres.filter((g) => editedMovie.genreIds.includes(g.id)).map((g) => ({ value: g.id, label: g.name })),
    [genres, editedMovie.genreIds],
  );
  const directorOptions = useMemo(
    () => directors.map((d) => ({ value: d.id, label: d.name })).sort((a, b) => a.label.localeCompare(b.label)),
    [directors],
  );
  const directorValues = useMemo(
    () => directors.filter((d) => editedMovie.directorIds.includes(d.id)).map((d) => ({ value: d.id, label: d.name })),
    [directors, editedMovie.directorIds],
  );
  const actorOptions = useMemo(
    () => actors.map((a) => ({ value: a.id, label: a.name })).sort((a, b) => a.label.localeCompare(b.label)),
    [actors],
  );
  const actorValues = useMemo(
    () => actors.filter((a) => editedMovie.actorIds.includes(a.id)).map((a) => ({ value: a.id, label: a.name })),
    [actors, editedMovie.actorIds],
  );
  const countryOptions = useMemo(
    () => [...countries].sort((a, b) => a.name.localeCompare(b.name)).map((c) => ({ value: c.id, label: `${c.flagEmoji} ${c.name}` })),
    [countries],
  );
  const countryValues = useMemo(
    () => countries.filter((c) => editedMovie.countryIds.includes(c.id)).map((c) => ({ value: c.id, label: `${c.flagEmoji} ${c.name}` })),
    [countries, editedMovie.countryIds],
  );

  return (
    <tr className={`movies-table-row ${isEditing ? "editing" : ""}`}>
      <td className="cell cell-title">
        <div style={{ position: "relative" }}>
          {isEditing ? (
            <input
              type="text"
              value={editedMovie.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              onKeyDown={handleKeyDown}
              className={`text-field${missingTitle ? " invalid" : ""}`}
              title={missingTitle ? "Required" : undefined}
              style={{ width: "100%" }}
              autoFocus
            />
          ) : (
            <span
              className="value"
              onClick={startEditing}
            >
              {movie.title}
            </span>
          )}
        </div>
      </td>
      <td className="cell cell-title">
        <div style={{ position: "relative" }}>
          {isEditing ? (
            <input
              type="text"
              value={editedMovie.alternativeTitle || ""}
              onChange={(e) =>
                handleInputChange("alternativeTitle", e.target.value)
              }
              onKeyDown={handleKeyDown}
              className="text-field"
              style={{ width: "100%" }}
            />
          ) : (
            <span
              className="value"
              onClick={startEditing}
            >
              {movie.alternativeTitle || "-"}
            </span>
          )}
        </div>
      </td>
      <td className="cell cell-year">
        <div style={{ position: "relative" }}>
          {isEditing ? (
            <input
              type="number"
              value={editedMovie.releaseYear}
              onChange={(e) =>
                handleInputChange("releaseYear", parseInt(e.target.value) || "")
              }
              onKeyDown={handleKeyDown}
              className={`text-field${missingYear ? " invalid" : ""}`}
              title={missingYear ? "Required" : undefined}
              style={{ width: "80px" }}
            />
          ) : (
            <span
              className="value"
              onClick={startEditing}
            >
              {movie.releaseYear}
            </span>
          )}
        </div>
      </td>
      <td className="cell cell-rating">
        <div style={{ position: "relative" }}>
          {isEditing ? (
            <input
              type="text"
              value={editedMovie.rating || ""}
              onChange={(e) => handleInputChange("rating", e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-field"
              style={{ width: "100%" }}
            />
          ) : (
            <span
              className="value"
              onClick={startEditing}
            >
              {movie.rating || "-"}
            </span>
          )}
        </div>
      </td>
      <td className="cell cell-watched">
        <div style={{ position: "relative" }}>
          {isEditing ? (
            <input
              type="text"
              value={editedMovie.watchedDate || ""}
              onChange={(e) => {
                handleInputChange("watchedDate", e.target.value);
                setDateError(false);
              }}
              onBlur={handleDateBlur}
              onKeyDown={handleKeyDown}
              className={`text-field${dateError ? " invalid" : ""}`}
              title={dateError ? `Not a valid date. ${DATE_HINT}` : undefined}
              style={{ width: "100%" }}
              placeholder="DD/MM or DD/MM/YYYY"
            />
          ) : (
            <span
              className="value"
              onClick={startEditing}
            >
              {formatDate(movie.watchedDate)}
            </span>
          )}
        </div>
      </td>
      <td className="cell cell-genre">
        {isEditing && (
          <StyledSelect
            isMulti
            isInline
            options={genreOptions}
            value={genreValues}
            onChange={(selected) => handleSelectChange("genreIds", selected)}
            menuPortalTarget={document.body}
          />
        )}
        {!isEditing && (
          <span
            className="value"
            onClick={startEditing}
          >
            {movie.Genres?.map((g) => g.name).join(", ") || "-"}
          </span>
        )}
      </td>
      <td className="cell cell-director">
        {isEditing && (
          <StyledSelect
            isMulti
            options={directorOptions}
            value={directorValues}
            onChange={(selected) => handleSelectChange("directorIds", selected)}
            menuPortalTarget={document.body}
          />
        )}
        {!isEditing && (
          <span
            className="value"
            onClick={startEditing}
          >
            {movie.Directors?.map((d) => d.name).join(", ") || "-"}
          </span>
        )}
      </td>
      <td className="cell cell-actor">
        {isEditing && (
          <StyledSelect
            isMulti
            options={actorOptions}
            value={actorValues}
            onChange={(selected) => handleSelectChange("actorIds", selected)}
            menuPortalTarget={document.body}
          />
        )}
        {!isEditing && (
          <span
            className="value"
            onClick={startEditing}
          >
            {movie.Actors?.map((a) => a.name).join(", ") || "-"}
          </span>
        )}
      </td>
      <td className="cell cell-country">
        {isEditing && (
          <StyledSelect
            isMulti
            options={countryOptions}
            value={countryValues}
            onChange={(selected) => handleSelectChange("countryIds", selected)}
            menuPortalTarget={document.body}
          />
        )}
        {!isEditing && (
          <span
            className="value"
            onClick={startEditing}
            title={movie.Countries?.map((c) => c.name).join(", ") || ""}
          >
            {movie.Countries?.map((c) => c.flagEmoji).join(" ") || "-"}
          </span>
        )}
      </td>
      <td className="cell cell-poster">
        <input
          ref={posterInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={handlePosterFileChange}
        />
        {isEditing && movie.posterUrl ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              alignItems: "center",
            }}
          >
            <button
              onClick={openPosterMenu}
              className="btn editing"
              disabled={isUploadingPoster}
              title="Replace poster"
            >
              {isUploadingPoster ? "⏳" : "🖼️"}
            </button>
            <button
              onClick={handleRemovePoster}
              className="btn editing"
              disabled={isUploadingPoster}
              title="Remove poster"
            >
              🚫
            </button>
          </div>
        ) : (
          <button
            onClick={
              movie.posterUrl
                ? (e) => {
                    // Don't let the click bubble to the Movies window's focus
                    // handler — it would immediately re-focus Movies over the viewer
                    e.stopPropagation();
                    hidePosterPreview();
                    onViewPoster(movie);
                  }
                : openPosterMenu
            }
            onMouseEnter={movie.posterUrl ? showPosterPreview : undefined}
            onMouseLeave={movie.posterUrl ? hidePosterPreview : undefined}
            className={`btn poster-btn ${movie.posterUrl ? "has-poster" : "no-poster"}`}
            disabled={isUploadingPoster}
            title={movie.posterUrl ? "View poster" : "Add poster"}
          >
            {isUploadingPoster ? "⏳" : "🖼️"}
          </button>
        )}
        {posterMenuPos &&
          createPortal(
            <div
              className="poster-menu"
              style={{ top: posterMenuPos.top, left: posterMenuPos.left }}
            >
              <button
                onClick={() => {
                  setPosterMenuPos(null);
                  openPosterPicker();
                }}
              >
                📁 Upload file…
              </button>
              <button
                onClick={() => {
                  setPosterMenuPos(null);
                  onSearchPoster(movie);
                }}
              >
                🔍 Search TMDB…
              </button>
            </div>,
            document.body
          )}
        {posterPreviewPos &&
          movie.posterUrl &&
          createPortal(
            <div
              className="poster-preview"
              style={{ top: posterPreviewPos.top, left: posterPreviewPos.left }}
            >
              <img
                src={`${ASSETS_BASE_URL}${movie.posterThumbUrl || movie.posterUrl}`}
                alt={`${movie.title} poster`}
              />
            </div>,
            document.body
          )}
      </td>
      <td className="cell cell-actions">
        <div style={{ display: "flex", gap: "0.25rem" }}>
          {isEditing ? (
            <>
              <button
                onClick={saveChanges}
                className="btn editing"
                disabled={!canSave}
                title={canSave ? undefined : "Title and release year are required"}
              >
                ✅
              </button>
              <button onClick={cancelEditing} className="btn editing">
                ❌
              </button>
            </>
          ) : (
            <>
              <button onClick={startEditing} className="btn">
                📝
              </button>
              <button onClick={() => onDelete(movie.id)} className="btn">
                🗑️
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default React.memo(MovieRow);
