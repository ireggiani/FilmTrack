import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import GlassCheckbox from "../ui/GlassCheckbox";
import PillItem from "../ui/PillItem";

const GenreList = ({ refresh, onGenresLoaded, onGenreEdit, onGenreDelete }) => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alphabetical, setAlphabetical] = useState(true);

  const fetchGenres = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/genres");
      const data = await response.json();
      setGenres(data);
      onGenresLoaded?.(data);
    } catch (error) {
      console.error("Error fetching genres:", error);
    } finally {
      setLoading(false);
    }
  }, [onGenresLoaded]);

  useEffect(() => {
    fetchGenres();
  }, [refresh, fetchGenres]);

  const sortedGenres = alphabetical
    ? [...genres].sort((a, b) => a.name.localeCompare(b.name))
    : genres;

  if (loading) return <div className="glass">Loading genres...</div>;

  return (
    <div className="genre-list">
      <div className="list-header">
        <h3 className="heading-left">Existing Genres</h3>
        <GlassCheckbox
          checked={alphabetical}
          onChange={(e) => setAlphabetical(e.target.checked)}
          label="Alphabetical"
        />
      </div>
      {genres.length === 0 ? (
        <p style={{ color: "rgba(255, 255, 255, 0.8)" }}>No genres added yet</p>
      ) : (
        <div className="list">
          {sortedGenres.map((genre) => (
            <PillItem
              key={genre.id}
              id={genre.id}
              name={genre.name}
              onEdit={() => {
                onGenreEdit?.(genre);
                setTimeout(() => {
                  const input = document.querySelector("#genreName");
                  input?.focus();
                }, 10);
              }}
              onDelete={onGenreDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

GenreList.propTypes = {
  refresh: PropTypes.number,
  onGenresLoaded: PropTypes.func,
  onGenreEdit: PropTypes.func,
  onGenreDelete: PropTypes.func,
};

export default GenreList;
