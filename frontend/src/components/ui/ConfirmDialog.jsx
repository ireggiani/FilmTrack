import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import WarningIcon from "../../assets/icons/warning.png";

// Image icons where we have artwork; emoji otherwise
const ICONS = {
  warning: <img src={WarningIcon} alt="" />,
  question: "❓",
  info: "ℹ️",
};

// Modal Aero confirmation dialog — the app's replacement for window.confirm.
// Keyboard: Enter presses the focused button (the confirm button starts
// focused), Esc cancels, Tab / Shift+Tab cycle through the buttons. Clicking
// outside doesn't dismiss it; like a real modal dialog, an answer is required.
// Passing extraLabel + onExtra adds a middle button (e.g. Save / Don't Save /
// Cancel).
const ConfirmDialog = ({
  title,
  heading,
  children,
  confirmLabel = "OK",
  extraLabel,
  cancelLabel = "Cancel",
  icon = "warning",
  onConfirm,
  onExtra,
  onCancel,
}) => {
  const confirmRef = useRef(null);
  const extraRef = useRef(null);
  const cancelRef = useRef(null);
  const hasExtra = Boolean(extraLabel && onExtra);

  useEffect(() => {
    confirmRef.current?.focus();
  }, []);

  // Capture phase, so nothing underneath (other windows' shortcuts, menus)
  // reacts to these keys while the dialog is up
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      } else if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        if (document.activeElement === cancelRef.current) onCancel();
        else if (hasExtra && document.activeElement === extraRef.current)
          onExtra();
        else onConfirm();
      } else if (e.key === "Tab") {
        e.preventDefault();
        const order = hasExtra
          ? [confirmRef, extraRef, cancelRef]
          : [confirmRef, cancelRef];
        const current = order.findIndex(
          (ref) => ref.current === document.activeElement
        );
        const step = e.shiftKey ? -1 : 1;
        const next = (current + step + order.length) % order.length;
        order[next].current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onConfirm, onExtra, onCancel, hasExtra]);

  return createPortal(
    <div
      className="aero-dialog-backdrop"
      // Clicking outside keeps focus in the dialog instead of dismissing it
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          confirmRef.current?.focus();
        }
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="aero-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="aero-dialog-heading"
      >
        <div className="aero-dialog-titlebar">
          <span className="aero-dialog-title">{title}</span>
          <button
            type="button"
            className="aero-dialog-close"
            onClick={onCancel}
            tabIndex={-1}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="aero-dialog-body">
          <span className="aero-dialog-icon" aria-hidden="true">
            {ICONS[icon]}
          </span>
          <div>
            <p id="aero-dialog-heading" className="aero-dialog-heading">
              {heading}
            </p>
            {children && <div className="aero-dialog-text">{children}</div>}
          </div>
        </div>
        <div className="aero-dialog-buttons">
          <button
            ref={confirmRef}
            type="button"
            className="aero-dialog-btn"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
          {hasExtra && (
            <button
              ref={extraRef}
              type="button"
              className="aero-dialog-btn"
              onClick={onExtra}
            >
              {extraLabel}
            </button>
          )}
          <button
            ref={cancelRef}
            type="button"
            className="aero-dialog-btn"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

ConfirmDialog.propTypes = {
  title: PropTypes.string.isRequired,
  heading: PropTypes.node.isRequired,
  children: PropTypes.node,
  confirmLabel: PropTypes.string,
  extraLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  icon: PropTypes.oneOf(Object.keys(ICONS)),
  onConfirm: PropTypes.func.isRequired,
  onExtra: PropTypes.func,
  onCancel: PropTypes.func.isRequired,
};

export default ConfirmDialog;
