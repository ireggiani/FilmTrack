import React, { useState } from "react";
import orbDefault from "../../assets/icons/orb.png";
import orbHover from "../../assets/icons/orb-hover.png";
import orbOpen from "../../assets/icons/orb-open.png";

const StartButton = ({ onClick, isOpen }) => {
  const [isHovered, setIsHovered] = useState(false);

  // While open, .is-open also adds a glow around the orb (see _start-menu.scss)
  const getOrbIcon = () => {
    if (isOpen) return orbOpen;
    if (isHovered) return orbHover;
    return orbDefault;
  };

  return (
    <button
      onClick={onClick}
      className={`start-button-wrapper${isOpen ? " is-open" : ""}`}
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
