import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import GlassCheckbox from "../ui/GlassCheckbox";
import PillItem from "../ui/PillItem";

const DirectorList = ({
  refresh,
  onDirectorsLoaded,
  onDirectorEdit,
  onDirectorDelete,
}) => {
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alphabetical, setAlphabetical] = useState(true);

  const fetchDirectors = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/directors");
      const data = await response.json();
      setDirectors(data);
      onDirectorsLoaded?.(data);
    } catch (error) {
      console.error("Error fetching directors:", error);
    } finally {
      setLoading(false);
    }
  }, [onDirectorsLoaded]);

  useEffect(() => {
    fetchDirectors();
  }, [refresh, fetchDirectors]);

  const sortedDirectors = alphabetical
    ? [...directors].sort((a, b) => a.name.localeCompare(b.name))
    : directors;

  if (loading) return <div className="glass">Loading directors...</div>;

  return (
    <div className="glass" style={{ padding: "1.5rem", marginTop: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h3
          style={{
            color: "white",
            margin: 0,
            textShadow:
              "0 1px 3px rgba(0, 0, 0, 0.8), 0 0 10px rgba(0, 0, 0, 0.3)",
          }}
        >
          Existing Directors
        </h3>
        <GlassCheckbox
          checked={alphabetical}
          onChange={(e) => setAlphabetical(e.target.checked)}
          label="Alphabetical"
        />
      </div>
      {directors.length === 0 ? (
        <p style={{ color: "rgba(255, 255, 255, 0.8)" }}>
          No directors added yet
        </p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {sortedDirectors.map((director) => (
            <PillItem
              key={director.id}
              id={director.id}
              name={director.name}
              onEdit={() => {
                onDirectorEdit?.(director);
                setTimeout(() => {
                  const input = document.querySelector("#directorName");
                  input?.focus();
                }, 10);
              }}
              onDelete={onDirectorDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

DirectorList.propTypes = {
  refresh: PropTypes.number,
  onDirectorsLoaded: PropTypes.func,
  onDirectorEdit: PropTypes.func,
  onDirectorDelete: PropTypes.func,
};

export default DirectorList;
