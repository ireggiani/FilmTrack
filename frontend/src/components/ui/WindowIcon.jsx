import PropTypes from "prop-types";

const WindowIcon = ({ icon, alt = "", className }) => {
  if (!icon) return null;
  return <img src={icon} alt={alt} className={className} />;
};

WindowIcon.propTypes = {
  icon: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
};

export default WindowIcon;
