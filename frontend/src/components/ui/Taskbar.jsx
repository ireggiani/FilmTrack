import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Taskbar = ({ openWindows, onWindowFocus }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

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
      <div className="taskbar-clock">
        {formatTime(time)}
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