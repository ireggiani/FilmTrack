import React, { useState, useRef } from "react";
import StyledSelect from "../ui/StyledSelect";
import "../../styles/movies/_add-movie-form.scss";

const AddMovieForm = ({ handleAddMovie, ...props }) => {
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

  const titleInputRef = useRef(null);
  const addButtonRef = useRef(null);

  const handleNewMovieChange = (field, value) => {
    setNewMovie((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateBlur = (e) => {
    let value = e.target.value;
    const match = value.match(/^(\d{1,2})\/(\d{1,2})$/);

    if (match) {
      const day = match[1].padStart(2, "0");
      const month = match[2].padStart(2, "0");
      const year = new Date().getFullYear();
      const formattedDate = `${year}-${month}-${day}`;
      handleNewMovieChange("watchedDate", formattedDate);
    } else {
      handleNewMovieChange("watchedDate", value);
    }
  };

  const onAddMovie = () => {
    handleAddMovie(newMovie);
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
    <div className="add-movie-form">
      <input
        ref={titleInputRef}
        type="text"
        value={newMovie.title}
        onChange={(e) => handleNewMovieChange("title", e.target.value)}
        placeholder="Movie title"
        className="movie-table-input"
      />
      <input
        type="text"
        value={newMovie.alternativeTitle}
        onChange={(e) =>
          handleNewMovieChange("alternativeTitle", e.target.value)
        }
        placeholder="Alternative title"
        className="movie-table-input"
      />
      <input
        type="number"
        value={newMovie.releaseYear}
        onChange={(e) =>
          handleNewMovieChange("releaseYear", parseInt(e.target.value) || "")
        }
        placeholder="Release year"
        className="movie-table-input"
      />
      <input
        type="text"
        value={newMovie.rating}
        onChange={(e) => handleNewMovieChange("rating", e.target.value)}
        placeholder="Rating"
        className="movie-table-input"
      />
      <input
        type="text"
        value={newMovie.watchedDate}
        onBlur={handleDateBlur}
        onChange={(e) => handleNewMovieChange("watchedDate", e.target.value)}
        placeholder="DD/MM or DD/MM/YYYY"
        className="movie-table-input"
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
      <button
        ref={addButtonRef}
        onClick={onAddMovie}
        disabled={!newMovie.title.trim() || !newMovie.releaseYear}
        className="btn"
      >
        Add Movie
      </button>
    </div>
  );
};

export default React.memo(AddMovieForm);
