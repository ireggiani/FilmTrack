import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const ViewsManager = ({
  sortConfig,
  searchTerm,
  minYear,
  maxYear,
  minRating,
  maxRating,
  genreTerm,
  setSortConfig,
  setSearchTerm,
  setMinYear,
  setMaxYear,
  setMinRating,
  setMaxRating,
  setGenreTerm,
}) => {
  const [views, setViews] = useState([]);
  const [viewName, setViewName] = useState("");
  const [selectedView, setSelectedView] = useState("");

  useEffect(() => {
    const savedViews = JSON.parse(localStorage.getItem("movieViews")) || [];
    setViews(savedViews);
  }, []);

  const handleSaveView = () => {
    if (!viewName) {
      alert("Please enter a name for the view.");
      return;
    }

    const newView = {
      name: viewName,
      filters: {
        searchTerm,
        minYear,
        maxYear,
        minRating,
        maxRating,
        genreTerm,
      },
      sorting: sortConfig,
    };

    const updatedViews = [...views, newView];
    setViews(updatedViews);
    localStorage.setItem("movieViews", JSON.stringify(updatedViews));
    setViewName("");
  };

  const handleLoadView = (viewName) => {
    if (!viewName) return;

    const view = views.find((v) => v.name === viewName);
    if (view) {
      const { filters, sorting } = view;
      setSearchTerm(filters.searchTerm || "");
      setMinYear(filters.minYear || "");
      setMaxYear(filters.maxYear || "");
      setMinRating(filters.minRating || "");
      setMaxRating(filters.maxRating || "");
      setGenreTerm(filters.genreTerm || "");
      setSortConfig(sorting);
      setSelectedView(viewName);
    }
  };

  const handleDeleteView = (viewName) => {
    const updatedViews = views.filter((v) => v.name !== viewName);
    setViews(updatedViews);
    localStorage.setItem("movieViews", JSON.stringify(updatedViews));
    if (selectedView === viewName) {
      setSelectedView("");
    }
  };

  return (
    <div className="views-manager">
      <div className="save-view-section">
        <input
          type="text"
          value={viewName}
          onChange={(e) => setViewName(e.target.value)}
          placeholder="Enter view name"
          className="view-name-input"
        />
        <button onClick={handleSaveView} className="save-view-button">
          Save Current View
        </button>
      </div>
      <div className="load-view-section">
        <select
          value={selectedView}
          onChange={(e) => handleLoadView(e.target.value)}
          className="load-view-select"
        >
          <option value="">Load a View</option>
          {views.map((view) => (
            <option key={view.name} value={view.name}>
              {view.name}
            </option>
          ))}
        </select>
        {selectedView && (
          <button
            onClick={() => handleDeleteView(selectedView)}
            className="delete-view-button"
          >
            Delete View
          </button>
        )}
      </div>
    </div>
  );
};

ViewsManager.propTypes = {
  sortConfig: PropTypes.object.isRequired,
  searchTerm: PropTypes.string.isRequired,
  minYear: PropTypes.string.isRequired,
  maxYear: PropTypes.string.isRequired,
  minRating: PropTypes.string.isRequired,
  maxRating: PropTypes.string.isRequired,
  genreTerm: PropTypes.string.isRequired,
  setSortConfig: PropTypes.func.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  setMinYear: PropTypes.func.isRequired,
  setMaxYear: PropTypes.func.isRequired,
  setMinRating: PropTypes.func.isRequired,
  setMaxRating: PropTypes.func.isRequired,
  setGenreTerm: PropTypes.func.isRequired,
};

export default ViewsManager;