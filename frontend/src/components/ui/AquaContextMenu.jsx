import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import '../../styles/ui/_aqua-menu.scss';

const EDGE = 6; // px kept clear of the viewport edges
const SUBMENU_DELAY = 150; // ms of hover before a submenu opens

// Reusable Frutiger Aero ("aqua bubble") context menu. Items are plain data:
//   { type: 'icons', items: [{ key, label, icon, onSelect, disabled, active }] }
//       a row of icon buttons (label is the tooltip); `active` lights one up
//   { type: 'swatches', label, items: [{ key, label, color, onSelect }] }
//       a row of colour swatches with a caption
//   { type: 'item', key, label, icon, shortcut, onSelect, disabled, checked, radio }
//       a normal entry; `checked` (a toggle, or one of a set with `radio`)
//       shows a gel bead in the icon slot while true
//   { type: 'submenu', key, label, icon, items: [...] }   (same item types)
//   { type: 'separator' }
// Choosing anything calls its onSelect, then onClose. Keyboard: ↑/↓ move
// between rows, ←/→ within a row of icons or swatches, → opens a submenu and
// ← or Esc leaves it, Home/End jump, Esc closes. Closes on any outside
// mousedown and on window blur/resize. A menu opened from a button passes it
// as anchorRef: mousedowns on it are left alone, so the button's own click
// can toggle the menu closed instead of closing and reopening it.
const AquaContextMenu = ({ x, y, items, onClose, label, anchorRef }) => {
  const rootRef = useRef(null);
  const [pos, setPos] = useState({ left: x, top: y });
  const [openSub, setOpenSub] = useState(null); // key of the open submenu
  const [focusSubOnOpen, setFocusSubOnOpen] = useState(false);
  const hoverTimer = useRef(null);

  // Flip left/up when the menu would run off the right/bottom edge
  useLayoutEffect(() => {
    const { width, height } = rootRef.current.getBoundingClientRect();
    setPos({
      left: x + width > window.innerWidth - EDGE ? Math.max(EDGE, x - width) : x,
      top: y + height > window.innerHeight - EDGE ? Math.max(EDGE, y - height) : y,
    });
  }, [x, y]);

  useEffect(() => {
    rootRef.current?.focus();
    const onMouseDown = (e) => {
      if (rootRef.current?.contains(e.target)) return;
      if (anchorRef?.current?.contains(e.target)) return;
      onClose();
    };
    // Capture phase, so a click that something else stops still closes the menu
    window.addEventListener('mousedown', onMouseDown, true);
    window.addEventListener('blur', onClose);
    window.addEventListener('resize', onClose);
    return () => {
      clearTimeout(hoverTimer.current);
      window.removeEventListener('mousedown', onMouseDown, true);
      window.removeEventListener('blur', onClose);
      window.removeEventListener('resize', onClose);
    };
  }, [onClose, anchorRef]);

  // Opened from the keyboard: move focus into the submenu once it renders
  useEffect(() => {
    if (!openSub || !focusSubOnOpen) return;
    setFocusSubOnOpen(false);
    rootRef.current
      ?.querySelector(`[data-sub="${openSub}"] [data-row]:not(:disabled)`)
      ?.focus();
  }, [openSub, focusSubOnOpen]);

  const choose = (onSelect) => () => {
    onSelect();
    onClose();
  };

  // Hovering a top-level entry opens its submenu (after a short delay) or
  // closes whichever one is open
  const hoverTopLevel = (subKey) => {
    clearTimeout(hoverTimer.current);
    if (subKey === openSub) return;
    hoverTimer.current = setTimeout(() => setOpenSub(subKey), SUBMENU_DELAY);
  };

  // ---- Keyboard navigation over rows of focusable controls ----------------
  const handleKeyDown = (e) => {
    const active = document.activeElement;
    const panel = active.closest('.aqua-menu') ?? rootRef.current;
    const inSub = panel !== rootRef.current;
    // This panel's own controls (not those of a submenu nested inside it)
    const controls = [...panel.querySelectorAll('[data-row]')].filter(
      (el) => el.closest('.aqua-menu') === panel && !el.disabled
    );
    const rows = [...new Set(controls.map((el) => Number(el.dataset.row)))];
    const rowOf = (r) => controls.filter((el) => Number(el.dataset.row) === r);
    const current = controls.indexOf(active);
    const row = current === -1 ? -1 : Number(active.dataset.row);
    const rowIndex = rows.indexOf(row);
    const col = current === -1 ? 0 : rowOf(row).indexOf(active);

    const focusRow = (index) => {
      const cells = rowOf(rows[(index + rows.length) % rows.length]);
      cells[Math.min(col, cells.length - 1)]?.focus();
    };

    switch (e.key) {
      case 'ArrowDown':
        focusRow(rowIndex + 1);
        break;
      case 'ArrowUp':
        focusRow(rowIndex === -1 ? rows.length - 1 : rowIndex - 1);
        break;
      case 'Home':
        focusRow(0);
        break;
      case 'End':
        focusRow(rows.length - 1);
        break;
      case 'ArrowRight': {
        const cells = rowOf(row);
        if (cells.length > 1) {
          cells[Math.min(col + 1, cells.length - 1)].focus();
        } else if (active.dataset.subTrigger) {
          setOpenSub(active.dataset.subTrigger);
          setFocusSubOnOpen(true);
        }
        break;
      }
      case 'ArrowLeft': {
        const cells = rowOf(row);
        if (cells.length > 1 && col > 0) {
          cells[col - 1].focus();
        } else if (inSub) {
          const key = panel.dataset.sub;
          setOpenSub(null);
          rootRef.current.querySelector(`[data-sub-trigger="${key}"]`)?.focus();
        }
        break;
      }
      case 'Escape':
        if (inSub) {
          const key = panel.dataset.sub;
          setOpenSub(null);
          rootRef.current.querySelector(`[data-sub-trigger="${key}"]`)?.focus();
        } else {
          onClose();
        }
        break;
      default:
        return;
    }
    e.preventDefault();
    e.stopPropagation();
  };

  // ---- Rendering ----------------------------------------------------------
  const renderItems = (list, topLevel) => {
    let row = 0;
    return list.map((item, i) => {
      if (item.type === 'separator') {
        return <div key={`sep-${i}`} className="aqua-sep" role="separator" />;
      }
      const r = row++;

      if (item.type === 'icons') {
        return (
          <div key={`icons-${i}`} className="aqua-icon-row" role="group">
            {item.items.map((btn) => (
              <button
                key={btn.key}
                type="button"
                role="menuitem"
                data-row={r}
                tabIndex={-1}
                className={`aqua-icon-btn${btn.active ? ' active' : ''}`}
                title={btn.label}
                aria-label={btn.label}
                aria-pressed={btn.active === undefined ? undefined : btn.active}
                disabled={btn.disabled}
                onMouseEnter={topLevel ? () => hoverTopLevel(null) : undefined}
                onClick={choose(btn.onSelect)}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        );
      }

      if (item.type === 'swatches') {
        return (
          <div key={`swatches-${i}`} className="aqua-swatch-row" role="group" aria-label={item.label}>
            {item.items.map((swatch) => (
              <button
                key={swatch.key}
                type="button"
                role="menuitem"
                data-row={r}
                tabIndex={-1}
                className={`aqua-swatch${swatch.color === 'transparent' ? ' none' : ''}`}
                style={{ background: swatch.color }}
                title={swatch.label}
                aria-label={`${item.label}: ${swatch.label}`}
                onMouseEnter={topLevel ? () => hoverTopLevel(null) : undefined}
                onClick={choose(swatch.onSelect)}
              />
            ))}
            <span className="aqua-swatch-label">{item.label}</span>
          </div>
        );
      }

      const isSub = item.type === 'submenu';
      const open = isSub && openSub === item.key;
      return (
        <div key={item.key} className="aqua-item-wrap">
          <button
            type="button"
            role={
              item.checked === undefined
                ? 'menuitem'
                : item.radio
                  ? 'menuitemradio'
                  : 'menuitemcheckbox'
            }
            aria-checked={item.checked}
            aria-haspopup={isSub ? 'menu' : undefined}
            aria-expanded={isSub ? open : undefined}
            data-row={r}
            data-sub-trigger={isSub ? item.key : undefined}
            tabIndex={-1}
            className={`aqua-item${open ? ' open' : ''}`}
            disabled={item.disabled}
            onMouseEnter={topLevel ? () => hoverTopLevel(isSub ? item.key : null) : undefined}
            onClick={
              isSub
                ? () => {
                    clearTimeout(hoverTimer.current);
                    setOpenSub(open ? null : item.key);
                  }
                : choose(item.onSelect)
            }
          >
            <span className="aqua-lead">
              {item.checked ? <span className="aqua-bead" /> : item.icon}
            </span>
            <span className="aqua-label">{item.label}</span>
            {item.shortcut && <span className="aqua-shortcut">{item.shortcut}</span>}
            {isSub && <span className="aqua-arrow" aria-hidden="true">▶</span>}
          </button>
          {open && <Submenu itemKey={item.key}>{renderItems(item.items, false)}</Submenu>}
        </div>
      );
    });
  };

  return createPortal(
    <div
      ref={rootRef}
      className="aqua-menu aqua-menu--root"
      role="menu"
      aria-label={label}
      tabIndex={-1}
      style={pos}
      onKeyDown={handleKeyDown}
      onContextMenu={(e) => e.preventDefault()}
      // Clicks inside the menu shouldn't reach the window underneath
      onClick={(e) => e.stopPropagation()}
    >
      {renderItems(items, true)}
    </div>,
    document.body
  );
};

/** A submenu panel beside its entry, flipped to the left near the edge */
const Submenu = ({ itemKey, children }) => {
  const ref = useRef(null);
  const [flip, setFlip] = useState(false);

  useLayoutEffect(() => {
    const { right } = ref.current.getBoundingClientRect();
    if (right > window.innerWidth - EDGE) setFlip(true);
  }, []);

  return (
    <div
      ref={ref}
      className={`aqua-menu aqua-menu--sub${flip ? ' flip' : ''}`}
      role="menu"
      data-sub={itemKey}
    >
      {children}
    </div>
  );
};

Submenu.propTypes = {
  itemKey: PropTypes.string.isRequired,
  children: PropTypes.node,
};

const itemShape = PropTypes.shape({
  type: PropTypes.oneOf(['icons', 'swatches', 'item', 'submenu', 'separator']).isRequired,
  key: PropTypes.string,
  label: PropTypes.string,
  icon: PropTypes.node,
  shortcut: PropTypes.string,
  onSelect: PropTypes.func,
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
  radio: PropTypes.bool,
  items: PropTypes.array,
});

AquaContextMenu.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  items: PropTypes.arrayOf(itemShape).isRequired,
  onClose: PropTypes.func.isRequired,
  label: PropTypes.string,
  anchorRef: PropTypes.shape({ current: PropTypes.any }),
};

export default AquaContextMenu;
