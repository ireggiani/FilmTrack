import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import StyledSelect from "../ui/StyledSelect";

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
  const [selectedView, setSelectedView] = useState(null);

  useEffect(() => {
    const savedViews = JSON.parse(localStorage.getItem("movieViews")) || [];
    setViews(savedViews);
  }, []);

  const viewOptions = views.map((view) => ({
    value: view.name,
    label: view.name,
  }));

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

  const handleLoadView = (selectedOption) => {
    if (!selectedOption) {
      setSearchTerm("");
      setMinYear("");
      setMaxYear("");
      setMinRating("");
      setMaxRating("");
      setGenreTerm([]);
      setSortConfig({ key: "id", direction: "asc" });
      setSelectedView(null);
      return;
    }

    const viewName = selectedOption.value;
    const view = views.find((v) => v.name === viewName);

    if (view) {
      const { filters, sorting } = view;
      setSearchTerm(filters.searchTerm || "");
      setMinYear(filters.minYear || "");
      setMaxYear(filters.maxYear || "");
      setMinRating(filters.minRating || "");
      setMaxRating(filters.maxRating || "");
      setGenreTerm(filters.genreTerm || []);
      setSortConfig(sorting);
      setSelectedView(selectedOption);
    }
  };

  const handleDeleteView = () => {
    if (!selectedView) return;

    const viewName = selectedView.value;
    const updatedViews = views.filter((v) => v.name !== viewName);
    setViews(updatedViews);
    localStorage.setItem("movieViews", JSON.stringify(updatedViews));
    setSelectedView(null);
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
        <button onClick={handleSaveView} className="btn save-view-button">
          Save Current View
        </button>
      </div>
      <div className="load-view-section">
        <StyledSelect
          value={selectedView}
          onChange={handleLoadView}
          options={viewOptions}
          placeholder="Load a View"
          isClearable
        />
        {selectedView && (
          <button onClick={handleDeleteView} className="btn delete-view-button">
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
  genreTerm: PropTypes.array.isRequired,
  setSortConfig: PropTypes.func.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  setMinYear: PropTypes.func.isRequired,
  setMaxYear: PropTypes.func.isRequired,
  setMinRating: PropTypes.func.isRequired,
  setMaxRating: PropTypes.func.isRequired,
  setGenreTerm: PropTypes.func.isRequired,
};

export default ViewsManager;
