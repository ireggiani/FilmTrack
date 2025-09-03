import { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import AddMovieForm from "./AddMovieForm";
import FilterControls from "./FilterControls";
import MoviesList from "./MoviesList";

const MoviesTable = ({ refresh, onMoviesLoaded }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    key: "title",
    direction: "ascending",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [minYear, setMinYear] = useState("");
  const [debouncedMinYear, setDebouncedMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");
  const [debouncedMaxYear, setDebouncedMaxYear] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");
  const [genreTerm, setGenreTerm] = useState("");
  const [debouncedGenreTerm, setDebouncedGenreTerm] = useState("");

  // Reference data
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [actors, setActors] = useState([]);

  const formatDate = (dateString) => {
    if (!dateString || !dateString.includes("-")) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "—";
    }
    const adjustedDate = new Date(
      date.getTime() + date.getTimezoneOffset() * 60000
    );
    const day = String(adjustedDate.getDate()).padStart(2, "0");
    const month = String(adjustedDate.getMonth() + 1).padStart(2, "0");
    const year = adjustedDate.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const memoizedGenreOptions = useMemo(
    () =>
      genres
        .map((g) => ({ value: g.id, label: g.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [genres]
  );

  const memoizedDirectorOptions = useMemo(
    () =>
      directors
        .map((d) => ({ value: d.id, label: d.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [directors]
  );

  const memoizedActorOptions = useMemo(
    () =>
      actors
        .map((a) => ({ value: a.id, label: a.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [actors]
  );

  const memoizedCountryOptions = useMemo(
    () =>
      countries
        .map((c) => ({
          value: c.id,
          label: `${c.flagEmoji} ${c.name}`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [countries]
  );

  const fetchMovies = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/movies");
      const data = await response.json();
      setMovies(data);
      onMoviesLoaded?.(data);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  }, [onMoviesLoaded]);

  const fetchReferenceData = useCallback(async () => {
    try {
      const [genresRes, countriesRes, directorsRes, actorsRes] =
        await Promise.all([
          fetch("http://localhost:5000/api/genres"),
          fetch("http://localhost:5000/api/countries"),
          fetch("http://localhost:5000/api/directors"),
          fetch("http://localhost:5000/api/actors"),
        ]);

      setGenres(await genresRes.json());
      setCountries(await countriesRes.json());
      setDirectors(await directorsRes.json());
      setActors(await actorsRes.json());
    } catch (error) {
      console.error("Error fetching reference data:", error);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
    fetchReferenceData();
  }, [refresh, fetchMovies, fetchReferenceData]);

  const handleAddMovie = useCallback(
    async (newMovie) => {
      if (!newMovie.title.trim() || !newMovie.releaseYear) return;

      try {
        const response = await fetch("http://localhost:5000/api/movies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMovie),
        });

        if (response.ok) {
          fetchMovies();
        }
      } catch (error) {
        console.error("Error adding movie:", error);
      }
    },
    [fetchMovies]
  );

  const handleUpdateMovie = useCallback(
    async (movieId, field, value) => {
      try {
        const movie = movies.find((m) => m.id === movieId);
        if (!movie) return;

        const updatedData = { ...movie, [field]: value };

        const response = await fetch(
          `http://localhost:5000/api/movies/${movieId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
          }
        );

        if (response.ok) {
          fetchMovies();
        }
      } catch (error) {
        console.error("Error updating movie:", error);
      }
    },
    [movies, fetchMovies]
  );

  const handleDeleteMovie = useCallback(
    async (movieId) => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/movies/${movieId}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          fetchMovies();
        }
      } catch (error) {
        console.error("Error deleting movie:", error);
      }
    },
    [fetchMovies]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedMinYear(minYear);
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [minYear]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedMaxYear(maxYear);
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [maxYear]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedGenreTerm(genreTerm);
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [genreTerm]);

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      // Search by title or alternative title
      if (
        searchTerm &&
        !(
          movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (movie.alternativeTitle &&
            movie.alternativeTitle
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
        )
      ) {
        return false;
      }

      // Filter by year range
      if (debouncedMinYear && movie.releaseYear < parseInt(debouncedMinYear)) {
        return false;
      }
      if (debouncedMaxYear && movie.releaseYear > parseInt(debouncedMaxYear)) {
        return false;
      }

      // Filter by genre
      if (
        debouncedGenreTerm &&
        !movie.Genres.some((g) =>
          g.name.toLowerCase().includes(debouncedGenreTerm.toLowerCase())
        )
      ) {
        return false;
      }

      // Filter by rating range
      if (minRating && movie.rating < parseFloat(minRating)) {
        return false;
      }
      if (maxRating && movie.rating > parseFloat(maxRating)) {
        return false;
      }

      return true;
    });
  }, [
    movies,
    searchTerm,
    debouncedMinYear,
    debouncedMaxYear,
    minRating,
    maxRating,
    debouncedGenreTerm,
  ]);

  const sortedMovies = useMemo(() => {
    let sortableMovies = [...filteredMovies];
    if (sortConfig.key !== null) {
      sortableMovies.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle nested array sorting
        if (sortConfig.key === "Genres" && a.Genres) {
          aValue = a.Genres.map((g) => g.name).join(", ");
        } else if (sortConfig.key === "Directors" && a.Directors) {
          aValue = a.Directors.map((d) => d.name).join(", ");
        } else if (sortConfig.key === "Actors" && a.Actors) {
          aValue = a.Actors.map((a) => a.name).join(", ");
        } else if (sortConfig.key === "Countries" && a.Countries) {
          aValue = a.Countries.map((c) => c.name).join(", ");
        }

        if (sortConfig.key === "Genres" && b.Genres) {
          bValue = b.Genres.map((g) => g.name).join(", ");
        } else if (sortConfig.key === "Directors" && b.Directors) {
          bValue = b.Directors.map((d) => d.name).join(", ");
        } else if (sortConfig.key === "Actors" && b.Actors) {
          bValue = b.Actors.map((a) => a.name).join(", ");
        } else if (sortConfig.key === "Countries" && b.Countries) {
          bValue = b.Countries.map((c) => c.name).join(", ");
        }

        // Handle null or undefined values
        if (aValue === null || aValue === undefined) aValue = "";
        if (bValue === null || bValue === undefined) bValue = "";

        // Convert to string for localeCompare if not already
        aValue = String(aValue);
        bValue = String(bValue);

        let comparison = aValue.localeCompare(bValue);

        return sortConfig.direction === "ascending" ? comparison : -comparison;
      });
    }
    return sortableMovies;
  }, [filteredMovies, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? " 🔼" : " 🔽";
    }
    return null;
  };

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
        {`.spreadsheet-table td, .spreadsheet-table th { border: 1px solid rgba(255, 255, 255, 0.3) !important; padding: 0.25rem !important; }`}
        {`[class*="menu"][class*="react-select"] { z-index: 99999 !important; backdrop-filter: blur(15px) !important; }`}
        {`[class*="control"][class*="react-select"] { min-height: 38px !important; }`}
        {`[class*="dropdownIndicator"][class*="react-select"], [class*="indicatorSeparator"][class*="react-select"] { height: 24px !important; }`}
        {`.spreadsheet-table td { font-size: 12px !important; }`}
      </style>
      <AddMovieForm {...addMovieFormProps} />
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
