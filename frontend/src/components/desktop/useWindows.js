// @ts-check
import { useCallback, useMemo, useReducer } from 'react';
import { WINDOWS, WINDOW_MAP } from '../../config/windowRegistry';

/** @typedef {{ open: boolean, minimized: boolean }} WindowState */
/**
 * @typedef {object} WindowsState
 * @property {Record<string, WindowState>} windows By window id
 * @property {string[]} stack Window ids, bottom to top
 * @property {string | null} focused
 */
/**
 * @typedef {{ type: 'open' | 'close' | 'focus' | 'minimize', id: string }
 *   | { type: 'minimizeAll' }} WindowsAction
 */

/** @type {WindowsState} */
export const initialWindows = {
  windows: Object.fromEntries(
    WINDOWS.map(({ id }) => [id, { open: false, minimized: false }]),
  ),
  stack: [],
  focused: null,
};

/**
 * @param {WindowsState} state
 * @param {string} id
 * @param {Partial<WindowState>} changes
 * @returns {WindowsState}
 */
const patch = (state, id, changes) => ({
  ...state,
  windows: { ...state.windows, [id]: { ...state.windows[id], ...changes } },
});

/**
 * @param {WindowsState} state
 * @param {string} id
 * @returns {WindowsState}
 */
const raise = (state, id) => ({
  ...patch(state, id, { minimized: false }),
  stack: [...state.stack.filter((other) => other !== id), id],
  focused: id,
});

/**
 * @param {WindowsState} state
 * @param {WindowsAction} action
 * @returns {WindowsState}
 */
export function windowsReducer(state, action) {
  switch (action.type) {
    case 'open':
      return raise(patch(state, action.id, { open: true }), action.id);
    case 'close':
      return {
        ...patch(state, action.id, { open: false }),
        stack: state.stack.filter((other) => other !== action.id),
      };
    case 'focus': {
      // Already in front: the same state back, so nothing re-renders. A press
      // on a window asks for this on every mouse down.
      const inFront =
        state.focused === action.id &&
        state.stack.at(-1) === action.id &&
        !state.windows[action.id].minimized;
      return inFront ? state : raise(state, action.id);
    }
    case 'minimize':
      return patch(state, action.id, { minimized: true });
    // Closed windows too: harmless, since opening a window un-minimizes it
    case 'minimizeAll':
      return {
        ...state,
        windows: Object.fromEntries(
          Object.entries(state.windows).map(([windowId, window]) => [
            windowId,
            { ...window, minimized: true },
          ]),
        ),
      };
    default:
      return state;
  }
}

// A click on another input of the same form (the country's flag) keeps the cursor
/** @param {string} id */
const focusField = (id) => {
  const selector = WINDOW_MAP[id]?.focusSelector;
  if (!selector) return;
  setTimeout(() => {
    const field = /** @type {HTMLInputElement | null} */ (document.querySelector(selector));
    const current = document.activeElement;
    if (current?.matches('input') && field?.form?.contains(current)) return;
    field?.focus();
  }, 10);
};

// Which windows are open, minimized and on top, plus what changes that
export function useWindows() {
  const [{ windows, stack, focused }, dispatch] = useReducer(
    windowsReducer,
    initialWindows,
  );

  const openWindow = useCallback((/** @type {string} */ id) => {
    dispatch({ type: 'open', id });
    focusField(id);
  }, []);

  const focusWindow = useCallback((/** @type {string} */ id) => {
    dispatch({ type: 'focus', id });
    focusField(id);
  }, []);

  // Bring a window to the front without moving the cursor into its field
  const raiseWindow = useCallback(
    (/** @type {string} */ id) => dispatch({ type: 'focus', id }),
    [],
  );

  const minimizeAllWindows = useCallback(
    () => dispatch({ type: 'minimizeAll' }),
    [],
  );

  // Created once, so each window's callbacks never change between renders:
  // some windows re-run effects when onClose changes
  const windowHandlers = useMemo(
    () =>
      Object.fromEntries(
        WINDOWS.map(({ id }) => [
          id,
          {
            onClose: () => dispatch({ type: 'close', id }),
            // Without stopPropagation the click reaches the window's onFocus,
            // which un-minimizes it in the same batch
            onMinimize: (/** @type {{ stopPropagation(): void } | undefined} */ e) => {
              e?.stopPropagation();
              dispatch({ type: 'minimize', id });
            },
            onFocus: () => focusWindow(id),
          },
        ]),
      ),
    [focusWindow],
  );

  const openWindows = useMemo(
    () => WINDOWS.filter(({ id }) => windows[id].open),
    [windows],
  );

  return {
    windows,
    openWindows,
    focused,
    zIndexOf: (/** @type {string} */ id) => 100 + stack.indexOf(id),
    openWindow,
    focusWindow,
    raiseWindow,
    minimizeAllWindows,
    windowHandlers,
  };
}
