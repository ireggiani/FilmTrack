import PropTypes from 'prop-types';

const Taskbar = ({ openWindows, onWindowFocus }) => {
  return (
    <div className="taskbar">
      <div className="taskbar-content">
        {openWindows.map(window => (
          <button
            key={window.id}
            className="taskbar-item"
            onClick={() => onWindowFocus(window.id)}
            title={window.title}
          >
            <span className="taskbar-icon">{window.icon}</span>
            <span className="taskbar-title">{window.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

Taskbar.propTypes = {
  openWindows: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired
  })).isRequired,
  onWindowFocus: PropTypes.func.isRequired
};

export default Taskbar;