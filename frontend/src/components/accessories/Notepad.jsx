import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import Draggable from "react-draggable";
import notepadIcon from "../../assets/notepad-icon.png";

const Notepad = ({
  onClose,
  onMinimize,
  onFocus,
  zIndex,
  isOpen,
  isMinimized,
}) => {
  const nodeRef = useRef(null);
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [title, setTitle] = useState("Untitled");
  const editorRef = useRef(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/notes");
      const data = await response.json();
      setNotes(data);
      if (data.length > 0) {
        setCurrentNote(data[0]);
        setTitle(data[0].title);
        if (editorRef.current) {
          editorRef.current.innerHTML = data[0].content;
        }
      }
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };

  const saveNote = async () => {
    const content = editorRef.current.innerHTML;
    try {
      if (currentNote) {
        await fetch(`http://localhost:5000/api/notes/${currentNote.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content }),
        });
      } else {
        const response = await fetch("http://localhost:5000/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content }),
        });
        const newNote = await response.json();
        setCurrentNote(newNote);
      }
      loadNotes();
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const newNote = () => {
    setCurrentNote(null);
    setTitle("Untitled");
    editorRef.current.innerHTML = "";
  };

  const loadNote = (note) => {
    setCurrentNote(note);
    setTitle(note.title);
    editorRef.current.innerHTML = note.content;
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  if (!isOpen) return null;

  return (
    <Draggable
      handle=".window-titlebar"
      nodeRef={nodeRef}
      cancel=".titlebar-button"
    >
      <div
        ref={nodeRef}
        className="notepad-window window"
        onClick={onFocus}
        style={{
          zIndex,
          ...(isMinimized && { display: "none" }),
        }}
      >
        <div className="window-titlebar leather">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <img
              src={notepadIcon}
              alt="Notepad"
              onDoubleClick={onClose}
              style={{
                cursor: "pointer",
                width: "16px",
                height: "16px",
                userSelect: "none",
              }}
              title="Double-click to close"
            />
            <span>Notepad</span>
          </div>
          <div style={{ display: "flex" }}>
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
              onChange={(e) => setTitle(e.target.value)}
              className="text-field note-title"
              placeholder="Note title..."
            />
            <div className="toolbar-buttons">
              <button
                onClick={() => formatText("bold")}
                title="Bold"
                className="btn"
              >
                <b>B</b>
              </button>
              <button
                onClick={() => formatText("italic")}
                title="Italic"
                className="btn"
              >
                <i>I</i>
              </button>
              <button
                onClick={() => formatText("underline")}
                title="Underline"
                className="btn"
              >
                <u>U</u>
              </button>
              <button
                onClick={() => formatText("insertUnorderedList")}
                title="Bullet List"
                className="btn"
              >
                •
              </button>
              <button onClick={saveNote} className="btn save-btn" title="Save">
                💾
              </button>
              <button onClick={newNote} className="btn new-btn" title="New">
                📄
              </button>
            </div>
          </div>

          <div className="notepad-body">
            <div className="notes-sidebar">
              <h4>Notes</h4>
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`note-item ${
                    currentNote?.id === note.id ? "active" : ""
                  }`}
                  onClick={() => loadNote(note)}
                >
                  {note.title}
                </div>
              ))}
            </div>

            <div
              ref={editorRef}
              className="note-editor"
              contentEditable
              suppressContentEditableWarning
              placeholder="Start typing..."
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
};

export default Notepad;
