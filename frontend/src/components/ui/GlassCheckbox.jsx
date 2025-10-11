import PropTypes from "prop-types";

const GlassCheckbox = ({ checked, onChange, label, ...props }) => {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        color: "white",
        fontSize: "0.9rem",
        cursor: "pointer",
        textShadow: "0 1px 3px rgba(0, 0, 0, 1), 0 0 8px rgba(0, 0, 0, 0.8)",
        padding: "0.25rem 0.5rem",
        background: "rgba(255, 255, 255, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        borderRadius: "20px",
        backdropFilter: "blur(10px)",
        boxShadow:
          "0 0px 3px rgba(0, 0, 0, 0.4), 0 0px 4px 1px rgba(255, 255, 255, 0.5)",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0.1rem 0.25rem",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "2px",
          width: "100%",
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={{
            marginRight: "0.5rem",
            appearance: "none",
            width: "16px",
            height: "16px",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "50%",
            cursor: "pointer",
            position: "relative",
            backdropFilter: "blur(10px)",
            boxShadow:
              "inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3)",
          }}
          {...props}
        />
        <style>{`
          input[type="checkbox"]:checked {
            background: rgba(255, 255, 255, 0.2) !important;
          }
          input[type="checkbox"]:checked::after {
            content: "✓";
            position: absolute;
            top: 45%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 14px;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 1), 0 0 5px rgba(0, 0, 0, 0.8);
          }
        `}</style>
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
