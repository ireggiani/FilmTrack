import { useState, useCallback, useMemo } from "react";
import api from '../../services/api.js';
import { updateList, useList } from '../../services/lists.js';
import { MOVIE_KIND } from './kinds';

// Sort order with no view applied
export const DEFAULT_SORT = { key: "title", direction: "ascending" };

// `kind` picks the list: movies by default, or series (see kinds.js). The
// list and the dropdowns' contents are shared with the other windows
// (services/lists.js), so a genre renamed in its manager changes here too.
export const useMovies = (kind = MOVIE_KIND) => {
  const { list, path, noun } = kind;
  const { items: movies, loading, error: loadError } = useList(list);
  const setMovies = useCallback((change) => updateList(list, change), [list]);
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
  const { items: genres, error: genresError } = useList('genres');
  const { items: countries, error: countriesError } = useList('countries');
  const { items: directors, error: directorsError } = useList('directors');
  const { items: actors, error: actorsError } = useList('actors');
  // Loading failed: the table can't be shown at all
  const error =
    loadError ??
    (genresError || countriesError || directorsError || actorsError
      ? 'Failed to load reference data'
      : null);

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

  const handleAddMovie = useCallback(async (newMovie) => {
    if (!newMovie.title.trim() || !newMovie.releaseYear) return;

    try {
      const addedMovie = await api.post(path, newMovie, `Failed to add ${noun}`);
      setMovies((prevMovies) => [...prevMovies, addedMovie]);
      return addedMovie;
    } catch (error) {
      console.error("Error adding movie:", error);
      setSaveError(error.message);
      throw error;
    }
  }, [path, noun, setMovies]);

  const handleUpdateMovie = useCallback(async (movieId, movieData) => {
    try {
      const updatedMovieFromServer = await api.put(`${path}/${movieId}`, movieData, `Failed to update ${noun}`);
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
  }, [path, noun, setMovies]);

  const handleDeleteMovie = useCallback(async (movieId) => {
    try {
      await api.del(`${path}/${movieId}`, `Failed to delete ${noun}`);
      setMovies((prevMovies) => prevMovies.filter((m) => m.id !== movieId));
    } catch (error) {
      console.error("Error deleting movie:", error);
      setSaveError(error.message);
      throw error;
    }
  }, [path, noun, setMovies]);

  const handleUploadPoster = useCallback(async (movieId, file) => {
    try {
      const formData = new FormData();
      formData.append("poster", file);
      const updatedMovieFromServer = await api.post(`${path}/${movieId}/poster`, formData, 'Failed to upload poster');
      setMovies((prevMovies) =>
        prevMovies.map((m) => (m.id === movieId ? updatedMovieFromServer : m))
      );
    } catch (error) {
      console.error("Error uploading poster:", error);
      setSaveError(error.message);
      throw error;
    }
  }, [path, setMovies]);

  const handleSetPosterFromTmdb = useCallback(async (movieId, posterPath) => {
    try {
      const updatedMovieFromServer = await api.post(`${path}/${movieId}/poster/tmdb`, { posterPath }, 'Failed to set poster from TMDB');
      setMovies((prevMovies) =>
        prevMovies.map((m) => (m.id === movieId ? updatedMovieFromServer : m))
      );
    } catch (error) {
      console.error("Error setting poster from TMDB:", error);
      setSaveError(error.message);
      throw error;
    }
  }, [path, setMovies]);

  const handleDeletePoster = useCallback(async (movieId) => {
    try {
      await api.del(`${path}/${movieId}/poster`, 'Failed to delete poster');
      setMovies((prevMovies) =>
        prevMovies.map((m) =>
          m.id === movieId ? { ...m, posterUrl: null, posterThumbUrl: null } : m
        )
      );
    } catch (error) {
      console.error("Error deleting poster:", error);
      setSaveError(error.message);
      throw error;
    }
  }, [path, setMovies]);

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