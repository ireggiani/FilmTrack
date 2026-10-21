import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import Draggable from "react-draggable";
import PropTypes from "prop-types";
import WindowIcon from "../ui/WindowIcon";
import { HelpContext } from "./helpContext";
import { TOPICS, TOC } from "./helpContent";
import "../../styles/help/_help.scss";

const HOME_TOPIC = "welcome";

// Index tab: every topic keyword, alphabetically
const INDEX = Object.entries(TOPICS)
  .flatMap(([id, topic]) =>
    topic.keywords.map((keyword) => ({ keyword, id, title: topic.title }))
  )
  .sort((a, b) => a.keyword.localeCompare(b.keyword));

const bookOf = (topicId) =>
  TOC.find((entry) => typeof entry !== "string" && entry.topics.includes(topicId))
    ?.book;

// Windows HTML Help-style viewer: toolbar, Contents/Index navigation pane and
// a topic pane, with browser-like Back/Forward history.
const HelpWindow = ({
  isOpen,
  isMinimized,
  onClose,
  onMinimize,
  onFocus,
  onOpenWindow,
  zIndex,
  icon,
}) => {
  const nodeRef = useRef(null);
  const topicPaneRef = useRef(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [tab, setTab] = useState("contents");
  const [history, setHistory] = useState({ stack: [HOME_TOPIC], index: 0 });
  const [openBooks, setOpenBooks] = useState(() => new Set(["Getting Started"]));
  const [indexQuery, setIndexQuery] = useState("");

  const currentId = history.stack[history.index];
  const topic = TOPICS[currentId];

  const navigate = useCallback(
    (id) => {
      if (!TOPICS[id] || id === currentId) return;
      setHistory(({ stack, index }) => ({
        stack: [...stack.slice(0, index + 1), id],
        index: index + 1,
      }));
    },
    [currentId]
  );
  const goBack = () =>
    setHistory((h) => ({ ...h, index: Math.max(h.index - 1, 0) }));
  const goForward = () =>
    setHistory((h) => ({ ...h, index: Math.min(h.index + 1, h.stack.length - 1) }));

  // New topic: scroll to its top and make sure its book is open in Contents
  useEffect(() => {
    if (topicPaneRef.current) topicPaneRef.current.scrollTop = 0;
    const book = bookOf(currentId);
    if (book) setOpenBooks((prev) => (prev.has(book) ? prev : new Set(prev).add(book)));
  }, [currentId]);

  const toggleBook = (book) =>
    setOpenBooks((prev) => {
      const next = new Set(prev);
      if (next.has(book)) next.delete(book);
      else next.add(book);
      return next;
    });

  const indexMatches = useMemo(() => {
    const query = indexQuery.trim().toLowerCase();
    return query ? INDEX.filter((entry) => entry.keyword.startsWith(query)) : INDEX;
  }, [indexQuery]);

  const contextValue = useMemo(
    () => ({ navigate, openWindow: onOpenWindow }),
    [navigate, onOpenWindow]
  );

  if (!isOpen) return null;

  const renderTopicItem = (id) => (
    <li key={id}>
      <button
        type="button"
        className={`help-tree-item${id === currentId ? " selected" : ""}`}
        onClick={() => navigate(id)}
      >
        <span className="help-tree-icon" aria-hidden="true">📄</span>
        {TOPICS[id].title}
      </button>
    </li>
  );

  return (
    <Draggable
      handle=".window-titlebar"
      bounds="parent"
      nodeRef={nodeRef}
      disabled={isMaximized}
      cancel=".titlebar-button"
    >
      <div
        ref={nodeRef}
        className={`window help-window${isMaximized ? " maximized" : ""}`}
        onClick={onFocus}
        style={{ zIndex, ...(isMinimized ? { display: "none" } : {}) }}
      >
        <div className="window-titlebar">
          <div className="titlebar-left">
            <span
              onDoubleClick={onClose}
              title="Double-click to close"
              className="window-icon-container"
            >
              <WindowIcon icon={icon} alt="FilmTrack Help" />
            </span>
            <span className="window-title">FilmTrack Help</span>
          </div>
          <div className="titlebar-right">
            <button
              className="titlebar-button window-minimize"
              onClick={onMinimize}
              title="Minimize"
            >
              🗕
            </button>
            <button
              className="titlebar-button"
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? "🗗" : "🗖"}
            </button>
            <button className="titlebar-button window-close" onClick={onClose}>
              🗙
            </button>
          </div>
        </div>

        <div className="help-toolbar">
          <button
            type="button"
            onClick={() => setShowNav(!showNav)}
            title={showNav ? "Hide the navigation pane" : "Show the navigation pane"}
          >
            <span aria-hidden="true">{showNav ? "◧" : "▣"}</span>
            {showNav ? "Hide" : "Show"}
          </button>
          <span className="help-toolbar-sep" />
          <button type="button" onClick={goBack} disabled={history.index === 0}>
            <span className="help-nav-orb" aria-hidden="true">◀</span>
            Back
          </button>
          <button
            type="button"
            onClick={goForward}
            disabled={history.index === history.stack.length - 1}
          >
            <span className="help-nav-orb" aria-hidden="true">▶</span>
            Forward
          </button>
          <button type="button" onClick={() => navigate(HOME_TOPIC)}>
            <span aria-hidden="true">🏠</span>
            Home
          </button>
        </div>

        <div className="help-body">
          {showNav && (
            <nav className="help-nav">
              <div className="help-tabs" role="tablist">
                {["contents", "index"].map((name) => (
                  <button
                    key={name}
                    type="button"
                    role="tab"
                    aria-selected={tab === name}
                    className={`help-tab${tab === name ? " active" : ""}`}
                    onClick={() => setTab(name)}
                  >
                    {name === "contents" ? "Contents" : "Index"}
                  </button>
                ))}
              </div>

              {tab === "contents" ? (
                <ul className="help-tree">
                  {TOC.map((entry) => {
                    if (typeof entry === "string") return renderTopicItem(entry);
                    const isOpenBook = openBooks.has(entry.book);
                    return (
                      <li key={entry.book}>
                        <button
                          type="button"
                          className="help-tree-item help-tree-book"
                          onClick={() => toggleBook(entry.book)}
                          aria-expanded={isOpenBook}
                        >
                          <span className="help-tree-icon" aria-hidden="true">
                            {isOpenBook ? "📖" : "📕"}
                          </span>
                          {entry.book}
                        </button>
                        {isOpenBook && (
                          <ul>{entry.topics.map(renderTopicItem)}</ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="help-index">
                  <label htmlFor="help-index-query">Type in the keyword to find:</label>
                  <input
                    id="help-index-query"
                    type="text"
                    className="text-field"
                    value={indexQuery}
                    onChange={(e) => setIndexQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && indexMatches.length > 0) {
                        navigate(indexMatches[0].id);
                      } else if (e.key === "Escape") {
                        setIndexQuery("");
                      }
                    }}
                  />
                  <ul className="help-index-list">
                    {indexMatches.map((entry) => (
                      <li key={`${entry.keyword}-${entry.id}`}>
                        <button
                          type="button"
                          className={`help-tree-item${entry.id === currentId ? " selected" : ""}`}
                          onClick={() => navigate(entry.id)}
                          title={entry.title}
                        >
                          {entry.keyword}
                        </button>
                      </li>
                    ))}
                    {indexMatches.length === 0 && (
                      <li className="help-index-empty">No matching keywords</li>
                    )}
                  </ul>
                </div>
              )}
            </nav>
          )}

          <article className="help-topic" ref={topicPaneRef}>
            <HelpContext.Provider value={contextValue}>
              <header className="help-topic-header">
                {bookOf(currentId) && (
                  <span className="help-topic-book">{bookOf(currentId)}</span>
                )}
                <h1>{topic.title}</h1>
              </header>
              <div className="help-topic-body">{topic.body}</div>
              {topic.related?.length > 0 && (
                <footer className="help-related">
                  <h3>Related topics</h3>
                  <ul>
                    {topic.related.map((id) => (
                      <li key={id}>
                        <button type="button" className="help-link" onClick={() => navigate(id)}>
                          {TOPICS[id].title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </footer>
              )}
            </HelpContext.Provider>
          </article>
        </div>
      </div>
    </Draggable>
  );
};

HelpWindow.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isMinimized: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onMinimize: PropTypes.func.isRequired,
  onFocus: PropTypes.func,
  onOpenWindow: PropTypes.func.isRequired,
  zIndex: PropTypes.number,
  icon: PropTypes.string,
};

export default HelpWindow;
