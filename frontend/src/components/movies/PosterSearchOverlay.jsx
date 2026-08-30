import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import API_BASE_URL from "../../config/api.js";
import "../../styles/movies/_poster-search.scss";

const PosterSearchOverlay = ({ movie, onPick, onClose }) => {
  const [query, setQuery] = useState(movie.title);
  const [year, setYear] = useState(
    movie.releaseYear ? String(movie.releaseYear) : ""
  );
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const runSearch = useCallback(async (searchQuery, searchYear) => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setError(null);
    try {
      const params = new URLSearchParams({ query: searchQuery.trim() });
      if (searchYear) params.set("year", searchYear);
      const response = await fetch(`${API_BASE_URL}/tmdb/search?${params}`);
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error || "Search failed");
      setResults(body);
    } catch (err) {
      setError(err.message);
      setResults(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Search immediately with the movie's own title/year on open
  useEffect(() => {
    runSearch(movie.title, movie.releaseYear ? String(movie.releaseYear) : "");
  }, [movie, runSearch]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch(query, year);
  };

  const hasAltTitle = Boolean(movie.alternativeTitle?.trim());
  const isAltActive = hasAltTitle && query === movie.alternativeTitle;
  const toggleAltTitle = () => {
    const nextQuery = isAltActive ? movie.title : movie.alternativeTitle;
    setQuery(nextQuery);
    runSearch(nextQuery, year);
  };

  const handlePick = async (posterPath) => {
    if (isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      await onPick(movie.id, posterPath);
      onClose();
    } catch (err) {
      setError(err.message);
      setIsSaving(false);
    }
  };

  // Portalled to <body> so the modal is sized by the viewport, not by the
  // Movies window — a heavily filtered list shrinks that window to a couple of
  // rows, which used to squash the poster grid down with it.
  return createPortal(
    <div className="poster-search-backdrop" onClick={onClose}>
      <div
        className="poster-search-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="poster-search-header">
          <span className="poster-search-title">
            Find poster — {movie.title} ({movie.releaseYear})
          </span>
          <button className="btn" onClick={onClose} title="Close">
            ✖
          </button>
        </div>

        <form className="poster-search-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="text-field"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Title"
            autoFocus
          />
          {hasAltTitle && (
            <button
              type="button"
              className={`btn alt-toggle ${isAltActive ? "active" : ""}`}
              onClick={toggleAltTitle}
              disabled={isSearching}
              title={
                isAltActive
                  ? `Search with main title: ${movie.title}`
                  : `Search with alternative title: ${movie.alternativeTitle}`
              }
            >
              Alt
            </button>
          )}
          <input
            type="number"
            className="text-field poster-search-year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Year"
          />
          <button type="submit" className="btn" disabled={isSearching}>
            {isSearching ? "⏳" : "🔍"} Search
          </button>
        </form>

        <div className="poster-search-results">
          {error && <p className="poster-search-message error">❌ {error}</p>}
          {!error && isSearching && (
            <p className="poster-search-message">Searching TMDB…</p>
          )}
          {!error && !isSearching && results && results.length === 0 && (
            <p className="poster-search-message">
              No results with posters found. Try tweaking the title or clearing
              the year.
            </p>
          )}
          {!error && !isSearching && results && results.length > 0 && (
            <div className="poster-search-grid">
              {results.map((result) => (
                <button
                  key={result.tmdbId}
                  className="poster-search-candidate"
                  onClick={() => handlePick(result.posterPath)}
                  disabled={isSaving}
                  title={`Use this poster for ${movie.title}`}
                >
                  <img src={result.thumbUrl} alt={`${result.title} poster`} loading="lazy" />
                  <span className="candidate-title">{result.title}</span>
                  <span className="candidate-year">{result.year || "—"}</span>
                </button>
              ))}
            </div>
          )}
          {isSaving && (
            <p className="poster-search-message">Downloading poster…</p>
          )}
        </div>

        <p className="poster-search-attribution">
          Search results and images provided by TMDB
        </p>
      </div>
    </div>,
    document.body
  );
};

PosterSearchOverlay.propTypes = {
  movie: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    alternativeTitle: PropTypes.string,
    releaseYear: PropTypes.number,
  }).isRequired,
  onPick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PosterSearchOverlay;
