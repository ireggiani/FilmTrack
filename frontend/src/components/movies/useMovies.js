import { useState, useEffect, useCallback, useMemo } from "react";
import API_BASE_URL from '../../config/api.js';

export const useMovies = (refresh, onMoviesLoaded) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    key: "title",
    direction: "ascending",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");
  const [genreTerm, setGenreTerm] = useState([]);
  const [countryTerm, setCountryTerm] = useState([]);

  // Reference data
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [actors, setActors] = useState([]);

  const formatDate = useCallback((dateString) => {
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
  }, []);

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

  const memoizedCountryOptions = useMemo(() => {
    const sortedCountries = [...countries].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    return sortedCountries.map((c) => ({
      value: c.id,
      label: `${c.flagEmoji} ${c.name}`,
    }));
  }, [countries]);

  const fetchMovies = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/movies`);
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
          fetch(`${API_BASE_URL}/genres`),
          fetch(`${API_BASE_URL}/countries`),
          fetch(`${API_BASE_URL}/directors`),
          fetch(`${API_BASE_URL}/actors`),
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

  const handleAddMovie = useCallback(async (newMovie) => {
    if (!newMovie.title.trim() || !newMovie.releaseYear) return;

    try {
      const response = await fetch(`${API_BASE_URL}/movies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMovie),
      });

      if (response.ok) {
        const addedMovie = await response.json();
        setMovies((prevMovies) => [...prevMovies, addedMovie]);
      }
    } catch (error) {
      console.error("Error adding movie:", error);
    }
  }, []);

  const handleUpdateMovie = useCallback(async (movieId, movieData) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/movies/${movieId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(movieData),
        }
      );

      if (response.ok) {
        const updatedMovieFromServer = await response.json();
        setMovies((prevMovies) =>
          prevMovies.map((m) =>
            m.id === movieId ? updatedMovieFromServer : m
          )
        );
      }
    } catch (error) {
      console.error("Error updating movie:", error);
    }
  }, []);

  const handleDeleteMovie = useCallback(async (movieId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/movies/${movieId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setMovies((prevMovies) => prevMovies.filter((m) => m.id !== movieId));
      }
    } catch (error) {
      console.error("Error deleting movie:", error);
    }
  }, []);

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
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

      if (minYear && movie.releaseYear < parseInt(minYear)) {
        return false;
      }
      if (maxYear && movie.releaseYear > parseInt(maxYear)) {
        return false;
      }

      if (
        genreTerm.length > 0 &&
        !movie.Genres.some((g) => genreTerm.includes(g.id))
      ) {
        return false;
      }

      if (
        countryTerm.length > 0 &&
        !movie.Countries.some((c) => countryTerm.includes(c.id))
      ) {
        return false;
      }

      if (minRating && movie.rating < parseFloat(minRating)) {
        return false;
      }
      if (maxRating && movie.rating > parseFloat(maxRating)) {
        return false;
      }

      return true;
    });
  }, [movies, searchTerm, minYear, maxYear, minRating, maxRating, genreTerm, countryTerm]);

  const sortedMovies = useMemo(() => {
    let sortableMovies = [...filteredMovies];
    if (sortConfig.key !== null) {
      sortableMovies.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

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

        if (aValue === null || aValue === undefined) aValue = "";
        if (bValue === null || bValue === undefined) bValue = "";

        aValue = String(aValue);
        bValue = String(bValue);

        let comparison = aValue.localeCompare(bValue);

        return sortConfig.direction === "ascending" ? comparison : -comparison;
      });
    }
    return sortableMovies;
  }, [filteredMovies, sortConfig]);

  const requestSort = useCallback(
    (key) => {
      let direction = "ascending";
      if (sortConfig.key === key && sortConfig.direction === "ascending") {
        direction = "descending";
      }
      setSortConfig({ key, direction });
    },
    [sortConfig]
  );

  const getSortIndicator = useCallback(
    (key) => {
      if (sortConfig.key === key) {
        return sortConfig.direction === "ascending" ? " 🔼" : " 🔽";
      }
      return null;
    },
    [sortConfig]
  );

  return {
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
    fetchMovies,
    fetchReferenceData,
    handleAddMovie,
    handleUpdateMovie,
    handleDeleteMovie,
    filteredMovies,
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
  };
};