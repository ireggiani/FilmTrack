import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import GlassCheckbox from "../ui/GlassCheckbox";
import PillItem from "../ui/PillItem";

const ActorList = ({ refresh, onActorsLoaded, onActorEdit, onActorDelete }) => {
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alphabetical, setAlphabetical] = useState(true);

  const fetchActors = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/actors");
      const data = await response.json();
      setActors(data);
      onActorsLoaded?.(data);
    } catch (error) {
      console.error("Error fetching actors:", error);
    } finally {
      setLoading(false);
    }
  }, [onActorsLoaded]);

  useEffect(() => {
    fetchActors();
  }, [refresh, fetchActors]);

  const sortedActors = alphabetical
    ? [...actors].sort((a, b) => a.name.localeCompare(b.name))
    : actors;

  if (loading) return <div className="glass">Loading actors...</div>;

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
          Existing Actors
        </h3>
        <GlassCheckbox
          checked={alphabetical}
          onChange={(e) => setAlphabetical(e.target.checked)}
          label="Alphabetical"
        />
      </div>
      {actors.length === 0 ? (
        <p style={{ color: "rgba(255, 255, 255, 0.8)" }}>No actors added yet</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {sortedActors.map((actor) => (
            <PillItem
              key={actor.id}
              id={actor.id}
              name={actor.name}
              onEdit={() => {
                onActorEdit?.(actor);
                setTimeout(() => {
                  const input = document.querySelector("#actorName");
                  input?.focus();
                }, 10);
              }}
              onDelete={onActorDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

ActorList.propTypes = {
  refresh: PropTypes.number,
  onActorsLoaded: PropTypes.func,
  onActorEdit: PropTypes.func,
  onActorDelete: PropTypes.func,
};

export default ActorList;
