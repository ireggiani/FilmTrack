import { useCallback, useMemo, useReducer } from 'react';
import { WINDOWS, WINDOW_MAP } from '../../config/windowRegistry';

export const initialWindows = {
  windows: Object.fromEntries(
    WINDOWS.map(({ id }) => [id, { open: false, minimized: false }]),
  ),
  // Window ids, bottom to top
  stack: [],
  focused: null,
};

const patch = (state, id, changes) => ({
  ...state,
  windows: { ...state.windows, [id]: { ...state.windows[id], ...changes } },
});

const raise = (state, id) => ({
  ...patch(state, id, { minimized: false }),
  stack: [...state.stack.filter((other) => other !== id), id],
  focused: id,
});

export function windowsReducer(state, { type, id }) {
  switch (type) {
    case 'open':
      return raise(patch(state, id, { open: true }), id);
    case 'close':
      return {
        ...patch(state, id, { open: false }),
        stack: state.stack.filter((other) => other !== id),
      };
    case 'focus':
      return raise(state, id);
    case 'minimize':
      return patch(state, id, { minimized: true });
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
const focusField = (id) => {
  const selector = WINDOW_MAP[id]?.focusSelector;
  if (!selector) return;
  setTimeout(() => {
    const field = document.querySelector(selector);
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

  const openWindow = useCallback((id) => {
    dispatch({ type: 'open', id });
    focusField(id);
  }, []);

  const focusWindow = useCallback((id) => {
    dispatch({ type: 'focus', id });
    focusField(id);
  }, []);

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
            onMinimize: (e) => {
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
    zIndexOf: (id) => 100 + stack.indexOf(id),
    openWindow,
    focusWindow,
    minimizeAllWindows,
    windowHandlers,
  };
}
