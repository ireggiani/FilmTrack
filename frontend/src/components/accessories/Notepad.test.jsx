import React from 'react';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Notepad from './Notepad';

jest.mock('react-draggable', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

const ok = (body) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) });
const refused = (status, body) => Promise.resolve({ ok: false, status, json: () => Promise.resolve(body) });

// Lists come back empty; a save is answered by `onSave`
const serve = (onSave) => {
  global.fetch = jest.fn((url, { method }) => (method === 'GET' ? ok([]) : onSave()));
};

// Waits for the first load, which clears the unsaved mark when it finishes
const renderNotepad = async (props) => {
  let result;
  await act(async () => {
    result = render(
      <Notepad
        isOpen
        isMinimized={false}
        onClose={jest.fn()}
        onMinimize={jest.fn()}
        onFocus={jest.fn()}
        zIndex={100}
        {...props}
      />
    );
  });
  return result;
};

const edit = (container) => fireEvent.input(container.querySelector('[contenteditable]'));
const save = () => fireEvent.click(screen.getByTitle('Save (Ctrl+S)'));

describe('Notepad saving', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows the server's reason and keeps the note unsaved", async () => {
    serve(() => refused(413, { error: 'That is too large to save (the limit is 100 KB)' }));
    const { container } = await renderNotepad();
    edit(container);
    save();

    expect(await screen.findByText("The note couldn't be saved")).toBeInTheDocument();
    expect(screen.getByText(/too large to save/)).toBeInTheDocument();
    expect(container.querySelector('.dirty-dot.visible')).toBeInTheDocument();
  });

  it('explains a server that does not answer', async () => {
    serve(() => Promise.reject(new TypeError('Failed to fetch')));
    await renderNotepad();
    save();

    expect(await screen.findByText(/server didn't answer/)).toBeInTheDocument();
    expect(screen.queryByText(/Failed to fetch/)).not.toBeInTheDocument();
  });

  it('stays open when saving from the close prompt fails', async () => {
    serve(() => refused(500, {}));
    const onClose = jest.fn();
    const { container } = await renderNotepad({ onClose });
    edit(container);

    fireEvent.click(container.querySelector('.window-close'));
    fireEvent.click(await screen.findByRole('button', { name: 'Save' }));

    expect(await screen.findByText("The note couldn't be saved")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows nothing when the save works', async () => {
    serve(() => ok({ id: 1, title: 'Untitled', content: '' }));
    const { container } = await renderNotepad();
    edit(container);
    save();

    await waitFor(() =>
      expect(container.querySelector('.dirty-dot.visible')).not.toBeInTheDocument()
    );
    expect(screen.queryByText("The note couldn't be saved")).not.toBeInTheDocument();
  });
});
