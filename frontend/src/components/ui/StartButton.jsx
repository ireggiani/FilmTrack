import React from 'react';
import startButtonImage from '../../assets/orb-normal.png';

const StartButton = ({ onClick }) => {
  return (
    <button onClick={onClick} className="start-button-wrapper" aria-label="Start menu">
      <img
        src={startButtonImage}
        alt="Start"
        className="start-button"
      />
    </button>
  );
};

export default StartButton;