import React from 'react';

const StartButton = ({ onClick }) => {
  return (
    <button className="start-button" onClick={onClick}>
      Start
    </button>
  );
};

export default StartButton;
