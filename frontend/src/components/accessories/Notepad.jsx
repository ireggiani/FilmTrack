import { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';
import WindowIcon from '../ui/WindowIcon';
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
}) => {
  const nodeRef = useRef(null);
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [title, setTitle] = useState('Untitled');
  const [isDirty, setIsDirty] = useState(false);
  const [activeFormats, setActiveFormats] = useState({});
  const [openPalette, setOpenPalette] = useState(null); // 'fore' | 'hilite' | null
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
    loadNotes(true);
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
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const confirmDiscard = () =>
    !isDirty ||
    window.confirm(`Discard unsaved changes to "${title}"?`);

  const newNote = () => {
    if (!confirmDiscard()) return;
    setCurrentNote(null);
    setTitle('Untitled');
    editorRef.current.innerHTML = '';
    setIsDirty(false);
  };

  const loadNote = (note) => {
    if (!confirmDiscard()) return;
    setCurrentNote(note);
    setTitle(note.title);
    editorRef.current.innerHTML = note.content;
    setIsDirty(false);
  };

  const deleteNote = async () => {
    if (!currentNote) {
      newNote();
      return;
    }
    if (!window.confirm(`Delete note "${title}"?`)) return;
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
              onDoubleClick={onClose}
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
            <button className="titlebar-button window-close" onClick={onClose}>
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
            />
          </div>
        </div>
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
};

export default Notepad;
