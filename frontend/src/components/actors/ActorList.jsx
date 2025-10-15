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
    <div className="actor-list">
      <div className="list-header">
        <h3 className="heading-left">Existing Actors</h3>
        <GlassCheckbox
          checked={alphabetical}
          onChange={(e) => setAlphabetical(e.target.checked)}
          label="Alphabetical"
        />
      </div>
      {actors.length === 0 ? (
        <p style={{ color: "rgba(255, 255, 255, 0.8)" }}>No actors added yet</p>
      ) : (
        <div className="list">
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
