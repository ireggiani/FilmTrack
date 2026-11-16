import { useRef } from 'react';
import LookupWindow from './LookupWindow';
import { DIRECTORS } from './lookups';
import '../../styles/directors/_director-form.scss';
import '../../styles/directors/_director-list.scss';

// Horizontal repeat of the metal sheen (700px bands at 80deg in _metal.scss)
const SHEEN_PERIOD = 700 / Math.sin((80 * Math.PI) / 180);

// Paddle switch latched down, with its LED lit, while the form is shown
const formToggle = ({ shown, toggle }) => (
  <button
    className={`titlebar-button paddle-switch${shown ? ' active' : ''}`}
    onClick={toggle}
    title={shown ? 'Hide add director form' : 'Show add director form'}
    aria-pressed={shown}
  >
    +
    <span className={`led${shown ? ' on' : ''}`} aria-hidden="true" />
  </button>
);

const DirectorsWindow = (props) => {
  const sheenRef = useRef(null);

  // Drift the metal's sheen against the drag, so the light seems to stay put
  // while the window moves. Set directly on the sheen element's transform: no
  // React state (no re-render), and not a CSS variable on the window (those
  // inherit, so every element inside would get its style recalculated on
  // each mouse move). Only this layer is recomposited.
  //
  // The offset wraps within one horizontal period of the sheen's repeating
  // pattern (700px bands at 80° → 700 / sin 80° ≈ 711px across), which looks
  // identical, so the layer never slides far enough to show its edge.
  const handleDrag = (_e, data) => {
    if (sheenRef.current) {
      const shift = (((data.x * 0.6) % SHEEN_PERIOD) + SHEEN_PERIOD) % SHEEN_PERIOD;
      sheenRef.current.style.transform = `translateX(${-shift}px)`;
    }
  };

  return (
    <LookupWindow
      lookup={DIRECTORS}
      formToggle={formToggle}
      underlay={<div ref={sheenRef} className="metal-sheen" aria-hidden="true" />}
      onDrag={handleDrag}
      {...props}
    />
  );
};

export default DirectorsWindow;
