import React, { useState, useCallback } from "react";
import Select from "react-select";
import StyledSelect from "../ui/StyledSelect";

const MovieRow = ({ movie, onUpdate, onDelete, ...props }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMovie, setEditedMovie] = useState({
    ...movie,
    genreIds: movie.Genres ? movie.Genres.map((g) => g.id) : [],
    directorIds: movie.Directors ? movie.Directors.map((d) => d.id) : [],
    actorIds: movie.Actors ? movie.Actors.map((a) => a.id) : [],
    countryIds: movie.Countries ? movie.Countries.map((c) => c.id) : [],
  });

  const handleInputChange = (field, value) => {
    setEditedMovie((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field, selected) => {
    const ids = selected ? selected.map((s) => s.value) : [];
    setEditedMovie((prev) => ({ ...prev, [field]: ids }));
    onUpdate(movie.id, field, ids);
  };

  const handleKeyDown = (e, field) => {
    if (e.key === "Enter") {
      onUpdate(movie.id, field, editedMovie[field]);
      setIsEditing(false);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const stopEditing = () => {
    onUpdate(movie.id, "title", editedMovie.title);
    onUpdate(movie.id, "alternativeTitle", editedMovie.alternativeTitle);
    onUpdate(movie.id, "releaseYear", editedMovie.releaseYear);
    onUpdate(movie.id, "rating", editedMovie.rating);
    onUpdate(movie.id, "watchedDate", editedMovie.watchedDate);
    setIsEditing(false);
  };

  const getInlineSelectStyles = useCallback(
    (isEditing) => ({
      control: (base) => ({
        ...base,
        background: "rgba(255, 255, 255, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        borderRadius: "4px",
        minHeight: "25px",
        fontSize: "0.8rem",
      }),
      container: (base) => ({
        ...base,
        display: isEditing ? "block" : "none",
      }),
      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    }),
    []
  );

  return (
    <tr className="movies-table-row">
      <td
        style={{
          padding: "0.5rem",
          textShadow: "0 1px 3px rgba(0, 0, 0, 1)",
        }}
      >
        <div style={{ position: "relative" }}>
          {isEditing ? (
            <input
              type="text"
              value={editedMovie.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, "title")}
              className="movie-table-input"
              style={{ width: "100%" }}
              autoFocus
            />
          ) : (
            <span onClick={startEditing} style={{ cursor: "pointer" }}>
              {movie.title}
            </span>
          )}
        </div>
      </td>
      <td
        style={{
          padding: "0.5rem",
          textShadow: "0 1px 3px rgba(0, 0, 0, 1)",
        }}
      >
        <div style={{ position: "relative" }}>
          {isEditing ? (
            <input
              type="text"
              value={editedMovie.alternativeTitle || ""}
              onChange={(e) =>
                handleInputChange("alternativeTitle", e.target.value)
              }
              onKeyDown={(e) => handleKeyDown(e, "alternativeTitle")}
              className="movie-table-input"
              style={{ width: "100%" }}
            />
          ) : (
            <span onClick={startEditing} style={{ cursor: "pointer" }}>
              {movie.alternativeTitle || "-"}
            </span>
          )}
        </div>
      </td>
      <td
        style={{
          padding: "0.5rem",
          textShadow: "0 1px 3px rgba(0, 0, 0, 1)",
          textAlign: "center",
        }}
      >
        <div style={{ position: "relative" }}>
          {isEditing ? (
            <input
              type="number"
              value={editedMovie.releaseYear}
              onChange={(e) =>
                handleInputChange("releaseYear", parseInt(e.target.value) || "")
              }
              onKeyDown={(e) => handleKeyDown(e, "releaseYear")}
              className="movie-table-input"
              style={{ width: "80px" }}
            />
          ) : (
            <span onClick={startEditing} style={{ cursor: "pointer" }}>
              {movie.releaseYear}
            </span>
          )}
        </div>
      </td>
      <td
        style={{
          padding: "0.5rem",
          textShadow: "0 1px 3px rgba(0, 0, 0, 1)",
          maxWidth: "100px",
          width: "100px",
          textAlign: "center",
        }}
      >
        <div style={{ position: "relative" }}>
          {isEditing ? (
            <input
              type="text"
              value={editedMovie.rating || ""}
              onChange={(e) => handleInputChange("rating", e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, "rating")}
              className="movie-table-input"
              style={{ width: "100%" }}
            />
          ) : (
            <span onClick={startEditing} style={{ cursor: "pointer" }}>
              {movie.rating || "-"}
            </span>
          )}
        </div>
      </td>
      <td
        style={{
          padding: "0.5rem",
          textShadow: "0 1px 3px rgba(0, 0, 0, 1)",
          maxWidth: "100px",
          width: "100px",
        }}
      >
        <div style={{ position: "relative" }}>
          {isEditing ? (
            <input
              type="text"
              value={editedMovie.watchedDate || ""}
              onChange={(e) => handleInputChange("watchedDate", e.target.value)}
              className="movie-table-input"
              style={{ width: "100%" }}
            />
          ) : (
            <span onClick={startEditing} style={{ cursor: "pointer" }}>
              {props.formatDate(movie.watchedDate)}
            </span>
          )}
        </div>
      </td>
      <td
        style={{
          padding: "0.5rem",
          textShadow: "0 1px 3px rgba(0, 0, 0, 1)",
          fontSize: "0.8rem",
        }}
      >
        <StyledSelect
          isMulti
          isInline
          options={props.genres.map((g) => ({ value: g.id, label: g.name }))}
          value={props.genres
            .filter((g) => editedMovie.genreIds.includes(g.id))
            .map((g) => ({ value: g.id, label: g.name }))}
          onChange={(selected) => handleSelectChange("genreIds", selected)}
          menuPortalTarget={document.body}
          styles={getInlineSelectStyles(isEditing)}
        />
        {!isEditing && (
          <span onClick={startEditing} style={{ cursor: "pointer" }}>
            {movie.Genres?.map((g) => g.name).join(", ") || "-"}
          </span>
        )}
      </td>
      <td
        style={{
          padding: "0.5rem",
          textShadow: "0 1px 3px rgba(0, 0, 0, 1)",
          fontSize: "0.8rem",
        }}
      >
        <Select
          isMulti
          options={props.directors.map((d) => ({ value: d.id, label: d.name }))}
          value={props.directors
            .filter((d) => editedMovie.directorIds.includes(d.id))
            .map((d) => ({ value: d.id, label: d.name }))}
          onChange={(selected) => handleSelectChange("directorIds", selected)}
          styles={getInlineSelectStyles(isEditing)}
          menuPortalTarget={document.body}
        />
        {!isEditing && (
          <span onClick={startEditing} style={{ cursor: "pointer" }}>
            {movie.Directors?.map((d) => d.name).join(", ") || "-"}
          </span>
        )}
      </td>
      <td
        style={{
          padding: "0.5rem",
          textShadow: "0 1px 3px rgba(0, 0, 0, 1)",
          fontSize: "0.8rem",
        }}
      >
        <Select
          isMulti
          options={props.actors.map((a) => ({ value: a.id, label: a.name }))}
          value={props.actors
            .filter((a) => editedMovie.actorIds.includes(a.id))
            .map((a) => ({ value: a.id, label: a.name }))}
          onChange={(selected) => handleSelectChange("actorIds", selected)}
          styles={getInlineSelectStyles(isEditing)}
          menuPortalTarget={document.body}
        />
        {!isEditing && (
          <span onClick={startEditing} style={{ cursor: "pointer" }}>
            {movie.Actors?.map((a) => a.name).join(", ") || "-"}
          </span>
        )}
      </td>
      <td
        style={{
          padding: "0.5rem",
          textShadow: "0 1px 3px rgba(0, 0, 0, 1)",
          fontSize: "0.8rem",
          textAlign: "center",
        }}
      >
        <Select
          isMulti
          options={props.countries.map((c) => ({
            value: c.id,
            label: `${c.flagEmoji} ${c.name}`,
          }))}
          value={props.countries
            .filter((c) => editedMovie.countryIds.includes(c.id))
            .map((c) => ({ value: c.id, label: `${c.flagEmoji} ${c.name}` }))}
          onChange={(selected) => handleSelectChange("countryIds", selected)}
          styles={getInlineSelectStyles(isEditing)}
          menuPortalTarget={document.body}
        />
        {!isEditing && (
          <span
            onClick={startEditing}
            style={{ cursor: "pointer" }}
            title={movie.Countries?.map((c) => c.name).join(", ") || ""}
          >
            {movie.Countries?.map((c) => c.flagEmoji).join(" ") || "-"}
          </span>
        )}
      </td>
      <td
        style={{
          padding: "0.5rem",
          maxWidth: "120px",
          width: "120px",
        }}
      >
        <div style={{ display: "flex", gap: "0.25rem" }}>
          {isEditing ? (
            <button onClick={stopEditing} className="movies-table-btn">
              ✅
            </button>
          ) : (
            <button onClick={startEditing} className="movies-table-btn">
              📝
            </button>
          )}
          <button
            onClick={() => onDelete(movie.id)}
            className="movies-table-btn"
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  );
};

export default React.memo(MovieRow);
