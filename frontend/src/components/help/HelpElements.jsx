import { useContext } from "react";
import PropTypes from "prop-types";
import { HelpContext } from "./helpContext";
import { WINDOW_MAP } from "../../config/windowRegistry";
import WindowIcon from "../ui/WindowIcon";

// Building blocks for help topic bodies (see helpContent.jsx)

/** Inline link to another help topic */
export const TopicLink = ({ to, children }) => {
  const { navigate } = useContext(HelpContext);
  return (
    <button type="button" className="help-link" onClick={() => navigate(to)}>
      {children}
    </button>
  );
};

TopicLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

/** WinHelp-style shortcut button that opens an app window */
export const OpenWindow = ({ id }) => {
  const { openWindow } = useContext(HelpContext);
  const target = WINDOW_MAP[id];
  return (
    <button
      type="button"
      className="help-launch"
      onClick={(e) => {
        // Otherwise the click bubbles to the Help window's focus handler,
        // which raises Help straight back over the window just opened
        e.stopPropagation();
        openWindow(id);
      }}
    >
      <WindowIcon icon={target.icon} alt="" />
      Open {target.title}
    </button>
  );
};

OpenWindow.propTypes = {
  id: PropTypes.string.isRequired,
};

/** Keyboard key */
export const Kbd = ({ children }) => <kbd className="help-kbd">{children}</kbd>;

Kbd.propTypes = {
  children: PropTypes.node.isRequired,
};

const CALLOUTS = {
  tip: { icon: "💡", label: "Tip" },
  note: { icon: "ℹ️", label: "Note" },
  caution: { icon: "⚠️", label: "Caution" },
};

/** Tip / Note / Caution box */
export const Callout = ({ type = "note", children }) => (
  <div className={`help-callout help-callout--${type}`}>
    <span className="help-callout-icon" aria-hidden="true">
      {CALLOUTS[type].icon}
    </span>
    <div>
      <strong>{CALLOUTS[type].label}: </strong>
      {children}
    </div>
  </div>
);

Callout.propTypes = {
  type: PropTypes.oneOf(Object.keys(CALLOUTS)),
  children: PropTypes.node.isRequired,
};
