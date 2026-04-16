import React, { useState } from "react";
import orbDefault from "../../assets/icons/orb.png";
import orbHover from "../../assets/icons/orb-hover.png";
import orbOpen from "../../assets/icons/orb-open.png";

const StartButton = ({ onClick, isOpen }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getOrbIcon = () => {
    if (isOpen) return orbOpen;
    if (isHovered) return orbHover;
    return orbDefault;
  };

  return (
    <button
      onClick={onClick}
      className="start-button-wrapper"
      aria-label="Start menu"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <img 
        src={getOrbIcon()} 
        alt="Start" 
        className="start-button" 
      />
    </button>
  );
};

export default StartButton;
