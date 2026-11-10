import React from 'react';
import { act, render, renderHook, screen } from '@testing-library/react';
import CountryForm from '../countries/CountryForm';
import DirectorForm from '../directors/DirectorForm';
import { WINDOWS } from '../../config/windowRegistry';
import { initialWindows, useWindows, windowsReducer } from './useWindows';

const run = (...actions) => actions.reduce(windowsReducer, initialWindows);
const open = (id) => ({ type: 'open', id });

describe('windowsReducer', () => {
  it('starts with every registered window closed', () => {
    expect(Object.keys(initialWindows.windows)).toEqual(WINDOWS.map((w) => w.id));
    expect(Object.values(initialWindows.windows).some((w) => w.open)).toBe(false);
  });

  it('opens a window on top and focused', () => {
    const state = run(open('movies'), open('notepad'));
    expect(state.windows.notepad.open).toBe(true);
    expect(state.stack).toEqual(['movies', 'notepad']);
    expect(state.focused).toBe('notepad');
  });

  it('raises a focused window without duplicating it', () => {
    const state = run(open('movies'), open('notepad'), { type: 'focus', id: 'movies' });
    expect(state.stack).toEqual(['notepad', 'movies']);
    expect(state.focused).toBe('movies');
  });

  it('keeps a minimized window open, and focus restores it', () => {
    const minimized = run(open('movies'), { type: 'minimize', id: 'movies' });
    expect(minimized.windows.movies).toEqual({ open: true, minimized: true });

    const restored = windowsReducer(minimized, { type: 'focus', id: 'movies' });
    expect(restored.windows.movies.minimized).toBe(false);
  });

  it('removes a closed window from the stack', () => {
    const state = run(open('movies'), open('notepad'), { type: 'close', id: 'movies' });
    expect(state.windows.movies.open).toBe(false);
    expect(state.stack).toEqual(['notepad']);
  });

  it('brings a window back visible when it was closed minimized', () => {
    const state = run(
      open('clock'),
      { type: 'minimize', id: 'clock' },
      { type: 'close', id: 'clock' },
      open('clock'),
    );
    expect(state.windows.clock).toEqual({ open: true, minimized: false });
  });

  it('minimizes everything and leaves the stack alone', () => {
    const state = run(open('movies'), open('notepad'), { type: 'minimizeAll' });
    expect(state.windows.movies.minimized).toBe(true);
    expect(state.windows.notepad.minimized).toBe(true);
    expect(state.stack).toEqual(['movies', 'notepad']);
  });
});

describe('useWindows', () => {
  it('stacks z-indexes from 100', () => {
    const { result } = renderHook(() => useWindows());
    act(() => result.current.openWindow('movies'));
    act(() => result.current.openWindow('notepad'));
    expect(result.current.zIndexOf('movies')).toBe(100);
    expect(result.current.zIndexOf('notepad')).toBe(101);
  });

  it('lists open windows in registry order', () => {
    const { result } = renderHook(() => useWindows());
    act(() => result.current.openWindow('notepad'));
    act(() => result.current.openWindow('movies'));
    expect(result.current.openWindows.map((w) => w.id)).toEqual(['movies', 'notepad']);
  });

  it('keeps the same handlers across state changes', () => {
    const { result } = renderHook(() => useWindows());
    const { windowHandlers } = result.current;
    act(() => result.current.openWindow('movies'));
    act(() => windowHandlers.movies.onMinimize());
    expect(result.current.windowHandlers).toBe(windowHandlers);
  });

  it('stops the minimize click from reaching the window', () => {
    const { result } = renderHook(() => useWindows());
    const stopPropagation = jest.fn();
    act(() => result.current.openWindow('movies'));
    act(() => result.current.windowHandlers.movies.onMinimize({ stopPropagation }));
    expect(stopPropagation).toHaveBeenCalled();
    expect(result.current.windows.movies.minimized).toBe(true);
  });

  it('moves keyboard focus to a window\'s field', () => {
    jest.useFakeTimers();
    const field = document.createElement('input');
    field.id = 'actorName';
    document.body.appendChild(field);

    const { result } = renderHook(() => useWindows());
    act(() => result.current.openWindow('actors'));
    jest.advanceTimersByTime(10);

    expect(document.activeElement).toBe(field);
    field.remove();
    jest.useRealTimers();
  });

  describe('with a real form', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    const focusWindow = (id) => {
      const { result } = renderHook(() => useWindows());
      act(() => result.current.windowHandlers[id].onFocus());
      act(() => jest.advanceTimersByTime(10));
    };

    it('focuses the director name', () => {
      render(<DirectorForm />);
      focusWindow('directors');
      expect(document.activeElement).toBe(screen.getByLabelText('Director Name'));
    });

    it('focuses the country name', () => {
      render(<CountryForm />);
      focusWindow('countries');
      expect(document.activeElement).toBe(screen.getByLabelText('Country Name'));
    });

    it('leaves the cursor in the flag field when that was clicked', () => {
      render(<CountryForm />);
      const flag = screen.getByLabelText('Flag Emoji');
      flag.focus();
      focusWindow('countries');
      expect(document.activeElement).toBe(flag);
    });

    it('takes the cursor from another window\'s field', () => {
      render(<DirectorForm />);
      render(<CountryForm />);
      screen.getByLabelText('Director Name').focus();
      focusWindow('countries');
      expect(document.activeElement).toBe(screen.getByLabelText('Country Name'));
    });
  });
});
