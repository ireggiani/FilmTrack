import React, { useState } from "react";
import WindowIcon from "./WindowIcon";
import { iconSrc } from "../../config/icons";
import orbDefaultIcon from "../../assets/icons/orb.png?icon";
import orbHoverIcon from "../../assets/icons/orb-hover.png?icon";
import orbOpenIcon from "../../assets/icons/orb-open.png?icon";

const orbDefault = iconSrc(orbDefaultIcon);
const orbHover = iconSrc(orbHoverIcon);
const orbOpen = iconSrc(orbOpenIcon);

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
      <WindowIcon
        icon={getOrbIcon()}
        alt="Start"
        className="start-button"
        size={38}
      />
    </button>
  );
};

export default StartButton;
