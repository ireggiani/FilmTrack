import PropTypes from 'prop-types';
import '../../styles/ui/_led-switch.scss';

// Latching metal push button with an indicator LED, for brushed-metal
// windows: pressed in with the LED lit while on. A real switch for screen
// readers (role="switch").
const LedSwitch = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    className={`led-switch${checked ? ' on' : ''}`}
    onClick={(e) => {
      e.stopPropagation();
      onChange(!checked);
    }}
  >
    <span className="led-switch__led" aria-hidden="true" />
    {label}
  </button>
);

LedSwitch.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

export default LedSwitch;
