import React, { useState } from "react";
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
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      saveChanges();
    }
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const saveChanges = () => {
    onUpdate(movie.id, editedMovie);
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setEditedMovie({
      ...movie,
      genreIds: movie.Genres ? movie.Genres.map((g) => g.id) : [],
      directorIds: movie.Directors ? movie.Directors.map((d) => d.id) : [],
      actorIds: movie.Actors ? movie.Actors.map((a) => a.id) : [],
      countryIds: movie.Countries ? movie.Countries.map((c) => c.id) : [],
    });
    setIsEditing(false);
  };

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
              className="text-field"
              style={{ width: "100%" }}
              autoFocus
            />
          ) : (
            <span
              className="value"
              onClick={startEditing}
              style={{ cursor: "pointer" }}
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
              style={{ cursor: "pointer" }}
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
              className="text-field"
              style={{ width: "80px" }}
            />
          ) : (
            <span
              className="value"
              onClick={startEditing}
              style={{ cursor: "pointer" }}
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
              style={{ cursor: "pointer" }}
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
              onChange={(e) => handleInputChange("watchedDate", e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-field"
              style={{ width: "100%" }}
            />
          ) : (
            <span
              className="value"
              onClick={startEditing}
              style={{ cursor: "pointer" }}
            >
              {props.formatDate(movie.watchedDate)}
            </span>
          )}
        </div>
      </td>
      <td className="cell cell-genre">
        {isEditing && (
          <StyledSelect
            isMulti
            isInline
            options={props.genres
              .map((g) => ({ value: g.id, label: g.name }))
              .sort((a, b) => a.label.localeCompare(b.label))}
            value={props.genres
              .filter((g) => editedMovie.genreIds.includes(g.id))
              .map((g) => ({ value: g.id, label: g.name }))}
            onChange={(selected) => handleSelectChange("genreIds", selected)}
            menuPortalTarget={document.body}
          />
        )}
        {!isEditing && (
          <span
            className="value"
            onClick={startEditing}
            style={{ cursor: "pointer" }}
          >
            {movie.Genres?.map((g) => g.name).join(", ") || "-"}
          </span>
        )}
      </td>
      <td className="cell cell-director">
        {isEditing && (
          <StyledSelect
            isMulti
            options={props.directors
              .map((d) => ({
                value: d.id,
                label: d.name,
              }))
              .sort((a, b) => a.label.localeCompare(b.label))}
            value={props.directors
              .filter((d) => editedMovie.directorIds.includes(d.id))
              .map((d) => ({ value: d.id, label: d.name }))}
            onChange={(selected) => handleSelectChange("directorIds", selected)}
            menuPortalTarget={document.body}
          />
        )}
        {!isEditing && (
          <span
            className="value"
            onClick={startEditing}
            style={{ cursor: "pointer" }}
          >
            {movie.Directors?.map((d) => d.name).join(", ") || "-"}
          </span>
        )}
      </td>
      <td className="cell cell-actor">
        {isEditing && (
          <StyledSelect
            isMulti
            options={props.actors
              .map((a) => ({ value: a.id, label: a.name }))
              .sort((a, b) => a.label.localeCompare(b.label))}
            value={props.actors
              .filter((a) => editedMovie.actorIds.includes(a.id))
              .map((a) => ({ value: a.id, label: a.name }))}
            onChange={(selected) => handleSelectChange("actorIds", selected)}
            menuPortalTarget={document.body}
          />
        )}
        {!isEditing && (
          <span
            className="value"
            onClick={startEditing}
            style={{ cursor: "pointer" }}
          >
            {movie.Actors?.map((a) => a.name).join(", ") || "-"}
          </span>
        )}
      </td>
      <td className="cell cell-country">
        {isEditing && (
          <StyledSelect
            isMulti
            options={[...props.countries]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((c) => ({
                value: c.id,
                label: `${c.flagEmoji} ${c.name}`,
              }))}
            value={props.countries
              .filter((c) => editedMovie.countryIds.includes(c.id))
              .map((c) => ({ value: c.id, label: `${c.flagEmoji} ${c.name}` }))}
            onChange={(selected) => handleSelectChange("countryIds", selected)}
            menuPortalTarget={document.body}
          />
        )}
        {!isEditing && (
          <span
            className="value"
            onClick={startEditing}
            style={{ cursor: "pointer" }}
            title={movie.Countries?.map((c) => c.name).join(", ") || ""}
          >
            {movie.Countries?.map((c) => c.flagEmoji).join(" ") || "-"}
          </span>
        )}
      </td>
      <td className="cell cell-actions">
        <div style={{ display: "flex", gap: "0.25rem" }}>
          {isEditing ? (
            <>
              <button onClick={saveChanges} className="btn editing">
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
