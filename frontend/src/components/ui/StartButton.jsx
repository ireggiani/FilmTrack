import React from 'react';
import startButtonImage from '../../assets/orb-normal.png';

const StartButton = ({ onClick }) => {
  return (
    <img
      src={startButtonImage}
      alt="Start"
      className="start-button"
      onClick={onClick}
    />
  );
};

export default StartButton;