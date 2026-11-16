import { useRef } from "react";
import PropTypes from "prop-types";
import "../../styles/movies/_filter-controls.scss";

// The filter row of a list that only filters by title (kind.filters "title"):
// the same title box as the full filters, plus how many rows it leaves
const TitleSearch = ({ searchTerm, setSearchTerm, shown, total, plural }) => {
  const inputRef = useRef(null);

  const clearSearch = (e) => {
    e.stopPropagation();
    setSearchTerm("");
    inputRef.current?.focus();
  };

  return (
    <div className="filter-controls title-search">
      <div className="filter-input-group">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSearchTerm("");
          }}
          placeholder="Search by title..."
          aria-label="Search by title"
          className="text-field"
        />
        {searchTerm && (
          <button
            type="button"
            className="filter-clear"
            onClick={clearSearch}
            tabIndex={-1}
            aria-label="Clear title search"
          >
            ×
          </button>
        )}
      </div>
      <span className="title-search-count">
        {searchTerm ? `${shown} of ${total}` : total} {plural}
      </span>
    </div>
  );
};

TitleSearch.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  shown: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  plural: PropTypes.string.isRequired,
};

export default TitleSearch;
