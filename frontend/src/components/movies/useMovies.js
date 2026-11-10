import { useState, useEffect, useCallback, useMemo } from "react";
import api from '../../services/api.js';

// Sort order with no view applied
export const DEFAULT_SORT = { key: "title", direction: "ascending" };

export const useMovies = (refresh, onMoviesLoaded) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  // Loading failed: the table can't be shown at all
  const [error, setError] = useState(null);
  // A save, delete or poster change was refused: shown in a dialog over the table
  const [saveError, setSaveError] = useState(null);
  const [sortConfig, setSortConfig] = useState(DEFAULT_SORT);
  const [searchTerm, setSearchTerm] = useState("");
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");
  const [genreTerm, setGenreTerm] = useState([]);
  const [directorTerm, setDirectorTerm] = useState([]);
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
      setError(null);
      const data = await api.get('/movies', 'Failed to fetch movies');
      setMovies(data);
      onMoviesLoaded?.(data);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [onMoviesLoaded]);

  const fetchReferenceData = useCallback(async () => {
    try {
      const [genres, countries, directors, actors] = await Promise.all([
        api.get('/genres'),
        api.get('/countries'),
        api.get('/directors'),
        api.get('/actors'),
      ]);

      setGenres(genres);
      setCountries(countries);
      setDirectors(directors);
      setActors(actors);
    } catch (error) {
      console.error("Error fetching reference data:", error);
      setError('Failed to load reference data');
    }
  }, []);

  useEffect(() => {
    fetchMovies();
    fetchReferenceData();
  }, [refresh, fetchMovies, fetchReferenceData]);

  const handleAddMovie = useCallback(async (newMovie) => {
    if (!newMovie.title.trim() || !newMovie.releaseYear) return;

    try {
      const addedMovie = await api.post('/movies', newMovie, 'Failed to add movie');
      setMovies((prevMovies) => [...prevMovies, addedMovie]);
      return addedMovie;
    } catch (error) {
      console.error("Error adding movie:", error);
      setSaveError(error.message);
      throw error;
    }
  }, []);

  const handleUpdateMovie = useCallback(async (movieId, movieData) => {
    try {
      const updatedMovieFromServer = await api.put(`/movies/${movieId}`, movieData, 'Failed to update movie');
      setMovies((prevMovies) =>
        prevMovies.map((m) =>
          m.id === movieId ? updatedMovieFromServer : m
        )
      );
    } catch (error) {
      console.error("Error updating movie:", error);
      setSaveError(error.message);
      throw error;
    }
  }, []);

  const handleDeleteMovie = useCallback(async (movieId) => {
    try {
      await api.del(`/movies/${movieId}`, 'Failed to delete movie');
      setMovies((prevMovies) => prevMovies.filter((m) => m.id !== movieId));
    } catch (error) {
      console.error("Error deleting movie:", error);
      setSaveError(error.message);
      throw error;
    }
  }, []);

  const handleUploadPoster = useCallback(async (movieId, file) => {
    try {
      const formData = new FormData();
      formData.append("poster", file);
      const updatedMovieFromServer = await api.post(`/movies/${movieId}/poster`, formData, 'Failed to upload poster');
      setMovies((prevMovies) =>
        prevMovies.map((m) => (m.id === movieId ? updatedMovieFromServer : m))
      );
    } catch (error) {
      console.error("Error uploading poster:", error);
      setSaveError(error.message);
      throw error;
    }
  }, []);

  const handleSetPosterFromTmdb = useCallback(async (movieId, posterPath) => {
    try {
      const updatedMovieFromServer = await api.post(`/movies/${movieId}/poster/tmdb`, { posterPath }, 'Failed to set poster from TMDB');
      setMovies((prevMovies) =>
        prevMovies.map((m) => (m.id === movieId ? updatedMovieFromServer : m))
      );
    } catch (error) {
      console.error("Error setting poster from TMDB:", error);
      setSaveError(error.message);
      throw error;
    }
  }, []);

  const handleDeletePoster = useCallback(async (movieId) => {
    try {
      await api.del(`/movies/${movieId}/poster`, 'Failed to delete poster');
      setMovies((prevMovies) =>
        prevMovies.map((m) => (m.id === movieId ? { ...m, posterUrl: null } : m))
      );
    } catch (error) {
      console.error("Error deleting poster:", error);
      setSaveError(error.message);
      throw error;
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
        directorTerm.length > 0 &&
        !movie.Directors.some((d) => directorTerm.includes(d.id))
      ) {
        return false;
      }

      if (
        countryTerm.length > 0 &&
        !movie.Countries.some((c) => countryTerm.includes(c.id))
      ) {
        return false;
      }

      if (minRating && movie.rating < Number(minRating)) {
        return false;
      }
      if (maxRating && movie.rating > Number(maxRating)) {
        return false;
      }

      return true;
    });
  }, [movies, searchTerm, minYear, maxYear, minRating, maxRating, genreTerm, directorTerm, countryTerm]);

  const sortedMovies = useMemo(() => {
    let sortableMovies = [...filteredMovies];
    if (sortConfig.key !== null) {
      sortableMovies.sort((a, b) => {
        // Undated movies always go to the bottom, in either direction
        if (sortConfig.key === "watchedDate" && !a.watchedDate !== !b.watchedDate) {
          return a.watchedDate ? -1 : 1;
        }

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

        let comparison;
        if (typeof aValue === "number" || typeof bValue === "number") {
          // A blank (a movie with no rating) sorts before any number
          const aNum = aValue === "" ? -Infinity : aValue;
          const bNum = bValue === "" ? -Infinity : bValue;
          comparison = aNum === bNum ? 0 : aNum - bNum;
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }

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
    error,
    saveError,
    clearSaveError: () => setSaveError(null),
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
    fetchMovies,
    fetchReferenceData,
    handleAddMovie,
    handleUpdateMovie,
    handleDeleteMovie,
    handleUploadPoster,
    handleDeletePoster,
    handleSetPosterFromTmdb,
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
    setDirectorTerm,
    setCountryTerm,
    setSortConfig,
  };
};