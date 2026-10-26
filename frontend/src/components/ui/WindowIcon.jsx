import PropTypes from "prop-types";
import { iconSrcSet } from "../../config/icons";

// size: the width the icon is drawn at (CSS px), so the browser can pick the
// smallest resized copy that stays sharp
const WindowIcon = ({ icon, alt = "", className, size = 32 }) => {
  if (!icon) return null;
  const srcSet = iconSrcSet(icon);
  return (
    <img
      src={icon}
      srcSet={srcSet}
      sizes={srcSet ? `${size}px` : undefined}
      alt={alt}
      className={className}
    />
  );
};

WindowIcon.propTypes = {
  icon: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.number,
};

export default WindowIcon;
