import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import StyledSelect from "../ui/StyledSelect";
import { getViews, saveView, deleteView } from "../../services/views";

const ViewsManager = ({
  sortConfig,
  searchTerm,
  minYear,
  maxYear,
  minRating,
  maxRating,
  genreTerm,
  countryTerm,
  setSortConfig,
  setSearchTerm,
  setMinYear,
  setMaxYear,
  setMinRating,
  setMaxRating,
  setGenreTerm,
  setCountryTerm,
}) => {
  const [views, setViews] = useState([]);
  const [viewName, setViewName] = useState("");
  const [selectedView, setSelectedView] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchViews = async () => {
      setLoading(true);
      try {
        const fetchedViews = await getViews();
        setViews(fetchedViews);
        setError(null);
      } catch (error) {
        setError("Failed to fetch views.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchViews();
  }, []);

  const viewOptions = views
    .map((view) => ({
      value: view.id,
      label: view.name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const handleSaveView = async () => {
    if (!viewName) {
      alert("Enter a name for the view.");
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
        countryTerm,
      },
      sorting: sortConfig,
    };

    setLoading(true);
    try {
      const savedView = await saveView(newView);
      setViews([...views, savedView]);
      setSelectedView({ value: savedView.id, label: savedView.name });
      setViewName("");
      setError(null);
    } catch (error) {
      setError("Failed to save view.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadView = (selectedOption) => {
    if (!selectedOption) {
      setSearchTerm("");
      setMinYear("");
      setMaxYear("");
      setMinRating("");
      setMaxRating("");
      setGenreTerm([]);
      setCountryTerm([]);
      setSortConfig({ key: "id", direction: "asc" });
      setSelectedView(null);
      return;
    }

    const viewId = selectedOption.value;
    const view = views.find((v) => v.id === viewId);

    if (view) {
      const { filters, sorting } = view;
      setSearchTerm(filters.searchTerm || "");
      setMinYear(filters.minYear || "");
      setMaxYear(filters.maxYear || "");
      setMinRating(filters.minRating || "");
      setMaxRating(filters.maxRating || "");
      setGenreTerm(filters.genreTerm || []);
      setCountryTerm(filters.countryTerm || []);
      setSortConfig(sorting);
      setSelectedView(selectedOption);
    }
  };

  const handleDeleteView = async () => {
    if (!selectedView) return;

    const viewIdToDelete = selectedView.value;

    setLoading(true);
    try {
      await deleteView(viewIdToDelete);
      setViews(views.filter((v) => v.id !== viewIdToDelete));
      setSelectedView(null);
      setError(null);
    } catch (error) {
      setError("Failed to delete view.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="views-manager">
      {error && <div className="error-message">{error}</div>}
      <div className="save-view-section">
        <input
          type="text"
          value={viewName}
          onChange={(e) => setViewName(e.target.value)}
          placeholder="Enter view name"
          className="text-field"
          disabled={loading}
        />
        <button onClick={handleSaveView} className="btn" disabled={loading}>
          {loading ? "Saving..." : "Save Current View"}
        </button>
      </div>
      <div className="load-view-section">
        <StyledSelect
          value={selectedView}
          onChange={handleLoadView}
          options={viewOptions}
          placeholder="Load a View"
          isClearable
          isDisabled={loading}
        />
        {selectedView && (
          <button onClick={handleDeleteView} className="btn" disabled={loading}>
            {loading ? "Deleting..." : "Delete View"}
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
  countryTerm: PropTypes.array.isRequired,
  setSortConfig: PropTypes.func.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  setMinYear: PropTypes.func.isRequired,
  setMaxYear: PropTypes.func.isRequired,
  setMinRating: PropTypes.func.isRequired,
  setMaxRating: PropTypes.func.isRequired,
  setGenreTerm: PropTypes.func.isRequired,
  setCountryTerm: PropTypes.func.isRequired,
};

export default ViewsManager;
