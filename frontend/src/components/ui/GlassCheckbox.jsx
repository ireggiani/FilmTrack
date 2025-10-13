import PropTypes from "prop-types";

const GlassCheckbox = ({ checked, onChange, label, ...props }) => {
  return (
    <label className="checkbox">
      <span className="checkbox__inner">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="checkbox__inner__input"
          {...props}
        />
        {label}
      </span>
    </label>
  );
};

GlassCheckbox.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

export default GlassCheckbox;
