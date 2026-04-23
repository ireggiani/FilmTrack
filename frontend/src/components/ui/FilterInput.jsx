import { useRef } from 'react';
import PropTypes from 'prop-types';

const FilterInput = ({ value, onChange, onClear, theme, placeholder = 'Filter…' }) => {
  const inputRef = useRef(null);

  const handleClear = (e) => {
    e.stopPropagation();
    onClear();
    inputRef.current?.focus();
  };

  return (
    <div className="filter-input-wrap">
      <input
        ref={inputRef}
        type="text"
        className={`filter-input${theme ? ` filter-input--${theme}` : ''}`}
        value={value}
        onChange={onChange}
        onClick={(e) => e.stopPropagation()}
        placeholder={placeholder}
      />
      {value && (
        <button
          type="button"
          className={`filter-clear${theme ? ` filter-clear--${theme}` : ''}`}
          onClick={handleClear}
          tabIndex={-1}
          aria-label="Clear filter"
        >
          ×
        </button>
      )}
    </div>
  );
};

FilterInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  theme: PropTypes.string,
  placeholder: PropTypes.string,
};

export default FilterInput;
