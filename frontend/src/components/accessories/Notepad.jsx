import { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';
import WindowIcon from '../ui/WindowIcon';
import ConfirmDialog from '../ui/ConfirmDialog';
import NotepadContextMenu from './NotepadContextMenu';
import API_BASE_URL from '../../config/api.js';

const FORE_COLORS = [
  { name: 'Black', value: '#1a1a1a' },
  { name: 'Red', value: '#c0392b' },
  { name: 'Orange', value: '#e67e22' },
  { name: 'Green', value: '#27ae60' },
  { name: 'Blue', value: '#2980b9' },
  { name: 'Purple', value: '#8e44ad' },
];

const HILITE_COLORS = [
  { name: 'None', value: 'transparent' },
  { name: 'Yellow', value: '#fff59d' },
  { name: 'Green', value: '#b9f6ca' },
  { name: 'Cyan', value: '#b2ebf2' },
  { name: 'Pink', value: '#f8bbd0' },
];

const HEADING_OPTIONS = [
  { value: 'p', label: 'Normal' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
];

const Notepad = ({
  onClose,
  onMinimize,
  onFocus,
  zIndex,
  isOpen,
  isMinimized,
  icon,
  newNoteRequested,
  onNewNoteHandled,
}) => {
  const nodeRef = useRef(null);
  // Opened by the desktop's "New Note": start blank instead of showing the
  // first saved note
  const openedForNewNote = useRef(newNoteRequested);
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [title, setTitle] = useState('Untitled');
  const [isDirty, setIsDirty] = useState(false);
  const [activeFormats, setActiveFormats] = useState({});
  const [openPalette, setOpenPalette] = useState(null); // 'fore' | 'hilite' | null
  // Action waiting on the Save / Don't Save / Cancel prompt
  const [pendingAction, setPendingAction] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [editorMenu, setEditorMenu] = useState(null); // { x, y } while open
  const [clipboardBlocked, setClipboardBlocked] = useState(false);
  // The editor selection when the context menu opened. Focus moves into the
  // menu, so each command puts this back before running.
  const menuRangeRef = useRef(null);
  // Stable: the menu re-runs its setup whenever onClose changes
  const closeEditorMenu = useCallback(() => setEditorMenu(null), []);
  const editorRef = useRef(null);

  const updateActiveFormats = useCallback(() => {
    const editor = editorRef.current;
    const selection = document.getSelection();
    if (!editor || !selection?.anchorNode || !editor.contains(selection.anchorNode)) {
      return;
    }
    const block = (document.queryCommandValue('formatBlock') || '').toLowerCase();
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      superscript: document.queryCommandState('superscript'),
      subscript: document.queryCommandState('subscript'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
      block: ['h1', 'h2', 'h3', 'blockquote'].includes(block) ? block : 'p',
    });
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', updateActiveFormats);
    return () =>
      document.removeEventListener('selectionchange', updateActiveFormats);
  }, [updateActiveFormats]);

  // Close an open color palette on any outside click (listener attaches after
  // the opening click has finished bubbling)
  useEffect(() => {
    if (!openPalette) return undefined;
    const close = () => setOpenPalette(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [openPalette]);

  useEffect(() => {
    loadNotes(!openedForNewNote.current);
  }, []);

  const loadNotes = async (selectFirst = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notes`);
      const data = await response.json();
      setNotes(data);
      if (selectFirst) {
        if (data.length > 0) {
          setCurrentNote(data[0]);
          setTitle(data[0].title);
          if (editorRef.current) {
            editorRef.current.innerHTML = data[0].content;
          }
        } else {
          setCurrentNote(null);
          setTitle('Untitled');
          if (editorRef.current) {
            editorRef.current.innerHTML = '';
          }
        }
        setIsDirty(false);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  // Resolves true once saved, false if the save failed
  const saveNote = async () => {
    const content = editorRef.current.innerHTML;
    try {
      if (currentNote) {
        await fetch(`${API_BASE_URL}/notes/${currentNote.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
        });
      } else {
        const response = await fetch(`${API_BASE_URL}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
        });
        const newNoteFromServer = await response.json();
        setCurrentNote(newNoteFromServer);
      }
      setIsDirty(false);
      loadNotes(); // refresh the sidebar without touching the editor
      return true;
    } catch (error) {
      console.error('Error saving note:', error);
      return false;
    }
  };

  // Runs the action right away, or first asks whether to save unsaved changes
  const guardUnsaved = (action) => {
    if (isDirty) setPendingAction(() => action);
    else action();
  };

  const resolvePending = async (save) => {
    const action = pendingAction;
    setPendingAction(null);
    if (save && !(await saveNote())) return;
    action();
  };

  const startNewNote = () => {
    setCurrentNote(null);
    setTitle('Untitled');
    editorRef.current.innerHTML = '';
    setIsDirty(false);
  };

  const newNote = () => guardUnsaved(startNewNote);

  const handleClose = () => guardUnsaved(onClose);

  // "New Note" from the desktop menu — asks to save first if needed, like New.
  // Through a ref: newNote is recreated every render, but this should only
  // run when a request arrives.
  const newNoteRef = useRef(newNote);
  newNoteRef.current = newNote;
  useEffect(() => {
    if (!newNoteRequested) return;
    newNoteRef.current();
    onNewNoteHandled?.();
  }, [newNoteRequested, onNewNoteHandled]);

  // Leaving the page (reload, closing the tab) can't use the app dialog —
  // browsers only allow their own generic prompt there
  useEffect(() => {
    if (!isDirty) return undefined;
    const warn = (e) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  const loadNote = (note) =>
    guardUnsaved(() => {
      setCurrentNote(note);
      setTitle(note.title);
      editorRef.current.innerHTML = note.content;
      setIsDirty(false);
    });

  const deleteNote = () => {
    if (!currentNote) {
      newNote();
      return;
    }
    setConfirmingDelete(true);
  };

  const confirmDelete = async () => {
    setConfirmingDelete(false);
    try {
      await fetch(`${API_BASE_URL}/notes/${currentNote.id}`, {
        method: 'DELETE',
      });
      loadNotes(true);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    updateActiveFormats();
  };

  // Colors are applied as CSS spans (instead of legacy <font> tags)
  const applyColor = (command, value) => {
    document.execCommand('styleWithCSS', false, true);
    formatText(command, value);
    document.execCommand('styleWithCSS', false, false);
    setOpenPalette(null);
  };

  const toggleBlockquote = () => {
    formatText(
      'formatBlock',
      activeFormats.block === 'blockquote' ? '<p>' : '<blockquote>'
    );
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      saveNote();
    }
  };

  // ---- Editor context menu ----------------------------------------------
  // Shift+right-click still gives the browser's own menu (spelling
  // suggestions live there).
  const handleEditorContextMenu = (e) => {
    if (e.shiftKey) return;
    e.preventDefault();
    setOpenPalette(null);
    const selection = document.getSelection();
    menuRangeRef.current =
      selection.rangeCount && editorRef.current.contains(selection.anchorNode)
        ? selection.getRangeAt(0).cloneRange()
        : null;
    setEditorMenu({ x: e.clientX, y: e.clientY });
  };

  const restoreMenuSelection = () => {
    editorRef.current.focus();
    if (!menuRangeRef.current) return;
    const selection = document.getSelection();
    selection.removeAllRanges();
    selection.addRange(menuRangeRef.current);
  };

  // Wraps a command so it runs on the restored selection
  const onMenuSelection = (fn) => (...args) => {
    restoreMenuSelection();
    fn(...args);
  };

  // Plain text only: inserting the clipboard's HTML ourselves would skip the
  // sanitizing a real paste gets (e.g. event-handler attributes would end up
  // saved in the note). Ctrl+V still pastes with formatting.
  const pasteFromMenu = async () => {
    try {
      const text = await navigator.clipboard.readText();
      restoreMenuSelection();
      document.execCommand('insertText', false, text);
    } catch {
      setClipboardBlocked(true); // permission denied or API unavailable
    }
  };

  const selectAllFromMenu = () => {
    editorRef.current.focus();
    const range = document.createRange();
    range.selectNodeContents(editorRef.current);
    const selection = document.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  // In the writing area, Tab indents instead of moving focus; Esc restores
  // keyboard navigation by leaving the editor (ARIA rich-text pattern).
  const handleEditorKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      formatText(e.shiftKey ? 'outdent' : 'indent');
    } else if (e.key === 'Escape') {
      editorRef.current.blur();
    }
  };

  // Keeps focus (and the text selection) in the editor when clicking toolbar controls
  const keepSelection = (e) => e.preventDefault();

  if (!isOpen) return null;

  const fmtBtn = (command, label, tooltip, stateKey = command, value = null) => (
    <button
      onMouseDown={keepSelection}
      onClick={() => formatText(command, value)}
      title={tooltip}
      className={activeFormats[stateKey] ? 'active' : ''}
    >
      {label}
    </button>
  );

  return (
    <Draggable
      handle=".window-titlebar"
      bounds="parent"
      nodeRef={nodeRef}
      cancel=".titlebar-button"
    >
      <div
        ref={nodeRef}
        className="notepad-window window"
        onClick={onFocus}
        onKeyDown={handleKeyDown}
        style={{
          zIndex,
          ...(isMinimized && { display: 'none' }),
        }}
      >
        <div className="window-titlebar leather">
          <div className="titlebar-left">
            <span
              onDoubleClick={handleClose}
              title="Double-click to close"
              className="window-icon-container"
            >
              <WindowIcon icon={icon} alt="Notepad" />
            </span>
            <span className="window-title">Notepad</span>
          </div>
          <div className="titlebar-right">
            <button
              className="titlebar-button window-minimize"
              onClick={onMinimize}
              title="Minimize"
            >
              🗕
            </button>
            <button className="titlebar-button window-close" onClick={handleClose}>
              🗙
            </button>
          </div>
        </div>

        <div className="notepad-content">
          <div className="notepad-toolbar">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setIsDirty(true);
              }}
              className="text-field note-title"
              placeholder="Note title..."
            />
            <span
              className={`dirty-dot ${isDirty ? 'visible' : ''}`}
              title="Unsaved changes"
            >
              ●
            </span>
            <div className="toolbar-buttons file-buttons">
              <button
                onClick={saveNote}
                className="save-btn"
                title="Save (Ctrl+S)"
              >
                💾
              </button>
              <button onClick={newNote} className="new-btn" title="New">
                📄
              </button>
              <button onClick={deleteNote} className="del-btn" title="Delete">
                🗑️
              </button>
            </div>
          </div>

          <div className="notepad-formatbar">
            <span className="toolbar-group">
              <select
                className="heading-select"
                value={
                  activeFormats.block === 'blockquote'
                    ? 'p'
                    : activeFormats.block || 'p'
                }
                onChange={(e) => formatText('formatBlock', `<${e.target.value}>`)}
                title="Paragraph style"
              >
                {HEADING_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </span>

            <span className="toolbar-sep" />

            <span className="toolbar-group">
              {fmtBtn('bold', <b>B</b>, 'Bold (Ctrl+B)')}
              {fmtBtn('italic', <i>I</i>, 'Italic (Ctrl+I)')}
              {fmtBtn('underline', <u>U</u>, 'Underline (Ctrl+U)')}
              {fmtBtn('strikeThrough', <s>S</s>, 'Strikethrough')}
            </span>

            <span className="toolbar-sep" />

            <span className="toolbar-group">
              {fmtBtn('superscript', <span>x²</span>, 'Superscript')}
              {fmtBtn('subscript', <span>x₂</span>, 'Subscript')}
            </span>

            <span className="toolbar-sep" />

            <span className="toolbar-group">
              <span className="palette-wrap">
                <button
                  onMouseDown={keepSelection}
                  onClick={(e) => {
                    // Keep the click from reaching the window-level
                    // close-on-outside-click listener
                    e.stopPropagation();
                    setOpenPalette(openPalette === 'fore' ? null : 'fore');
                  }}
                  title="Text color"
                  className={`ico-fore ${openPalette === 'fore' ? 'active' : ''}`}
                >
                  A
                </button>
                {openPalette === 'fore' && (
                  <div className="palette-pop">
                    {FORE_COLORS.map((color) => (
                      <button
                        key={color.value}
                        className="swatch"
                        style={{ background: color.value }}
                        onMouseDown={keepSelection}
                        onClick={() => applyColor('foreColor', color.value)}
                        title={color.name}
                      />
                    ))}
                  </div>
                )}
              </span>
              <span className="palette-wrap">
                <button
                  onMouseDown={keepSelection}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenPalette(openPalette === 'hilite' ? null : 'hilite');
                  }}
                  title="Highlight color"
                  className={`ico-hilite ${openPalette === 'hilite' ? 'active' : ''}`}
                >
                  A
                </button>
                {openPalette === 'hilite' && (
                  <div className="palette-pop">
                    {HILITE_COLORS.map((color) => (
                      <button
                        key={color.value}
                        className={`swatch ${color.value === 'transparent' ? 'none' : ''}`}
                        style={{ background: color.value }}
                        onMouseDown={keepSelection}
                        onClick={() => applyColor('hiliteColor', color.value)}
                        title={color.name}
                      />
                    ))}
                  </div>
                )}
              </span>
            </span>

            <span className="toolbar-sep" />

            <span className="toolbar-group">
              {fmtBtn('insertUnorderedList', '•', 'Bullet list')}
              {fmtBtn('insertOrderedList', '1.', 'Numbered list')}
              {fmtBtn('outdent', '⇤', 'Decrease indent', '_none')}
              {fmtBtn('indent', '⇥', 'Increase indent', '_none')}
            </span>

            <span className="toolbar-sep" />

            <span className="toolbar-group">
              {fmtBtn('justifyLeft', 'L', 'Align left')}
              {fmtBtn('justifyCenter', 'C', 'Align center')}
              {fmtBtn('justifyRight', 'R', 'Align right')}
            </span>

            <span className="toolbar-sep" />

            <span className="toolbar-group">
              <button
                onMouseDown={keepSelection}
                onClick={toggleBlockquote}
                title="Quote block"
                className={activeFormats.block === 'blockquote' ? 'active' : ''}
              >
                ❝
              </button>
              {fmtBtn('insertHorizontalRule', '—', 'Separator line', '_none')}
              <button
                onMouseDown={keepSelection}
                onClick={() => formatText('removeFormat')}
                title="Clear formatting"
              >
                T<sub>x</sub>
              </button>
            </span>
          </div>

          <div className="notepad-body">
            <div className="notes-sidebar">
              <h4>Notes</h4>
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`note-item ${
                    currentNote?.id === note.id ? 'active' : ''
                  }`}
                  onClick={() => loadNote(note)}
                >
                  <span className="note-item-title">{note.title}</span>
                  {currentNote?.id === note.id && (
                    <span
                      className={`dirty-dot ${isDirty ? 'visible' : ''}`}
                      title="Unsaved changes"
                    >
                      ●
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div
              ref={editorRef}
              className="note-editor"
              contentEditable
              suppressContentEditableWarning
              placeholder="Start typing..."
              onInput={() => setIsDirty(true)}
              onKeyDown={handleEditorKeyDown}
              onContextMenu={handleEditorContextMenu}
            />
          </div>
        </div>
        {pendingAction && (
          <ConfirmDialog
            title="Notepad"
            heading={`Save changes to “${title}”?`}
            confirmLabel="Save"
            extraLabel="Don't Save"
            onConfirm={() => resolvePending(true)}
            onExtra={() => resolvePending(false)}
            onCancel={() => setPendingAction(null)}
          >
            Your changes will be lost if you don&apos;t save them.
          </ConfirmDialog>
        )}
        {editorMenu && (
          <NotepadContextMenu
            x={editorMenu.x}
            y={editorMenu.y}
            hasSelection={Boolean(menuRangeRef.current && !menuRangeRef.current.collapsed)}
            activeFormats={activeFormats}
            foreColors={FORE_COLORS}
            hiliteColors={HILITE_COLORS}
            onCommand={onMenuSelection(formatText)}
            onColor={onMenuSelection(applyColor)}
            onCut={onMenuSelection(() => document.execCommand('cut'))}
            onCopy={onMenuSelection(() => document.execCommand('copy'))}
            onPaste={pasteFromMenu}
            onSelectAll={selectAllFromMenu}
            onToggleQuote={onMenuSelection(toggleBlockquote)}
            onSave={saveNote}
            onClose={closeEditorMenu}
          />
        )}
        {clipboardBlocked && (
          <ConfirmDialog
            title="Notepad"
            icon="info"
            heading="FilmTrack can't read the clipboard"
            confirmLabel="OK"
            cancelLabel={null}
            onConfirm={() => setClipboardBlocked(false)}
            onCancel={() => setClipboardBlocked(false)}
          >
            Allow clipboard access for this site in your browser, or press
            Ctrl+V to paste.
          </ConfirmDialog>
        )}
        {confirmingDelete && (
          <ConfirmDialog
            title="Delete Note"
            heading={`Delete “${title}”?`}
            confirmLabel="Delete"
            onConfirm={confirmDelete}
            onCancel={() => setConfirmingDelete(false)}
          >
            The note will be permanently removed. This can&apos;t be undone.
          </ConfirmDialog>
        )}
      </div>
    </Draggable>
  );
};

Notepad.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isMinimized: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onMinimize: PropTypes.func,
  onFocus: PropTypes.func,
  zIndex: PropTypes.number,
  icon: PropTypes.string,
  newNoteRequested: PropTypes.bool,
  onNewNoteHandled: PropTypes.func,
};

export default Notepad;
