import { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import AquaContextMenu from "../ui/AquaContextMenu";
import ConfirmDialog from "../ui/ConfirmDialog";
import { DEFAULT_SORT } from "./useMovies";
import {
  getViews,
  saveView,
  updateView,
  deleteView,
} from "../../services/views";

// What each saved filter falls back to when a view doesn't set it
const EMPTY_FILTERS = {
  searchTerm: "",
  minYear: "",
  maxYear: "",
  minRating: "",
  maxRating: "",
  genreTerm: [],
  directorTerm: [],
  countryTerm: [],
};

// Comparable form of filters + sort, so a loaded view can tell whether the
// table has drifted from it (multi-select order doesn't matter)
const snapshot = (filters, sorting) =>
  JSON.stringify({
    filters: Object.fromEntries(
      Object.entries(EMPTY_FILTERS).map(([key, empty]) => {
        const value = filters?.[key] ?? empty;
        return [key, Array.isArray(value) ? [...value].sort() : String(value)];
      })
    ),
    sorting: sorting ?? DEFAULT_SORT,
  });

// Modal prompt for a view name. onSubmit may throw; its message is shown and
// the dialog stays open.
const ViewNameDialog = ({ title, heading, confirmLabel, initialName, onSubmit, onCancel }) => {
  const inputRef = useRef(null);
  const [name, setName] = useState(initialName);
  const [error, setError] = useState(null);

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter a name for the view.");
      inputRef.current?.focus();
      return;
    }
    try {
      await onSubmit(trimmed);
    } catch (err) {
      setError(err.message);
      inputRef.current?.focus();
    }
  };

  return (
    <ConfirmDialog
      title={title}
      heading={heading}
      icon="question"
      confirmLabel={confirmLabel}
      onConfirm={submit}
      onCancel={onCancel}
      initialFocusRef={inputRef}
    >
      <input
        ref={inputRef}
        type="text"
        className="text-field view-name-input"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError(null);
        }}
        onFocus={(e) => e.target.select()}
        placeholder="View name"
        maxLength={60}
      />
      {error && <p className="view-name-error">{error}</p>}
    </ConfirmDialog>
  );
};

ViewNameDialog.propTypes = {
  title: PropTypes.string.isRequired,
  heading: PropTypes.string.isRequired,
  confirmLabel: PropTypes.string.isRequired,
  initialName: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

const ViewsManager = ({
  sortConfig,
  searchTerm,
  minYear,
  maxYear,
  minRating,
  maxRating,
  genreTerm,
  directorTerm,
  countryTerm,
  setSortConfig,
  setSearchTerm,
  setMinYear,
  setMaxYear,
  setMinRating,
  setMaxRating,
  setGenreTerm,
  setDirectorTerm,
  setCountryTerm,
}) => {
  const [views, setViews] = useState([]);
  const [activeViewId, setActiveViewId] = useState(null);
  const [menuPos, setMenuPos] = useState(null); // { x, y } while open
  // { kind: "save" | "rename" | "delete" } while a dialog is up
  const [dialog, setDialog] = useState(null);
  const [error, setError] = useState(null);
  const buttonRef = useRef(null);

  const currentFilters = {
    searchTerm,
    minYear,
    maxYear,
    minRating,
    maxRating,
    genreTerm,
    directorTerm,
    countryTerm,
  };
  const activeView = views.find((v) => v.id === activeViewId) ?? null;
  const isModified =
    activeView !== null &&
    snapshot(activeView.filters, activeView.sorting) !==
      snapshot(currentFilters, sortConfig);

  const applyView = useCallback(
    (view) => {
      const filters = { ...EMPTY_FILTERS, ...view?.filters };
      setSearchTerm(filters.searchTerm);
      setMinYear(filters.minYear);
      setMaxYear(filters.maxYear);
      setMinRating(filters.minRating);
      setMaxRating(filters.maxRating);
      setGenreTerm(filters.genreTerm);
      setDirectorTerm(filters.directorTerm);
      setCountryTerm(filters.countryTerm);
      setSortConfig(view?.sorting ?? DEFAULT_SORT);
      setActiveViewId(view?.id ?? null);
    },
    [
      setSearchTerm,
      setMinYear,
      setMaxYear,
      setMinRating,
      setMaxRating,
      setGenreTerm,
      setDirectorTerm,
      setCountryTerm,
      setSortConfig,
    ]
  );

  // Fetch once per window open, applying the starred view if there is one
  useEffect(() => {
    let cancelled = false;
    getViews()
      .then((fetched) => {
        if (cancelled) return;
        setViews(fetched);
        const starred = fetched.find((v) => v.isDefault);
        if (starred) applyView(starred);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setError("Failed to fetch views.");
      });
    return () => {
      cancelled = true;
    };
  }, [applyView]);

  // Runs a request, showing a failure in the error dialog
  const attempt = async (request, failureMessage) => {
    try {
      await request();
    } catch (err) {
      console.error(err);
      setError(failureMessage);
    }
  };

  const replaceView = (updated) =>
    setViews((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));

  const handleSaveNew = async (name) => {
    // Throws on a duplicate name; ViewNameDialog shows the message
    const saved = await saveView({
      name,
      filters: currentFilters,
      sorting: sortConfig,
    });
    setViews((prev) => [...prev, saved]);
    setActiveViewId(saved.id);
    setDialog(null);
  };

  const handleRename = async (name) => {
    if (name !== activeView.name) {
      replaceView(await updateView(activeView.id, { name }));
    }
    setDialog(null);
  };

  const handleUpdate = () =>
    attempt(async () => {
      replaceView(
        await updateView(activeView.id, {
          filters: currentFilters,
          sorting: sortConfig,
        })
      );
    }, "Failed to update view.");

  const handleToggleDefault = () =>
    attempt(async () => {
      const isDefault = !activeView.isDefault;
      const updated = await updateView(activeView.id, { isDefault });
      // The server unstars every other view when one is starred
      setViews((prev) =>
        prev.map((v) =>
          v.id === updated.id ? updated : isDefault ? { ...v, isDefault: false } : v
        )
      );
    }, "Failed to change the default view.");

  const handleDelete = () => {
    const id = activeView.id;
    setDialog(null);
    attempt(async () => {
      await deleteView(id);
      setViews((prev) => prev.filter((v) => v.id !== id));
      setActiveViewId(null);
    }, "Failed to delete view.");
  };

  // The menu ignores mousedowns on the button (anchorRef), so a click while
  // it's open closes it here rather than closing and reopening it
  const toggleMenu = (e) => {
    e.stopPropagation();
    if (menuPos) {
      setMenuPos(null);
      return;
    }
    const rect = buttonRef.current.getBoundingClientRect();
    setMenuPos({ x: rect.left, y: rect.bottom + 2 });
  };

  const closeMenu = useCallback(() => setMenuPos(null), []);

  const sortedViews = [...views].sort((a, b) => a.name.localeCompare(b.name));
  const activeName = activeView ? `“${activeView.name}”` : "";

  const menuItems = [
    {
      type: "item",
      key: "all",
      label: "All Movies",
      checked: activeView === null,
      radio: true,
      onSelect: () => applyView(null),
    },
    ...sortedViews.map((view) => ({
      type: "item",
      key: `view-${view.id}`,
      label: view.name,
      checked: view.id === activeViewId,
      radio: true,
      shortcut: view.isDefault ? "★" : undefined,
      onSelect: () => applyView(view),
    })),
    { type: "separator" },
    {
      type: "item",
      key: "save",
      label: "Save as New View…",
      icon: "💾",
      onSelect: () => setDialog({ kind: "save" }),
    },
    {
      type: "item",
      key: "update",
      label: activeView ? `Update ${activeName}` : "Update View",
      icon: "🔄",
      disabled: !isModified,
      onSelect: handleUpdate,
    },
    {
      type: "item",
      key: "rename",
      label: "Rename…",
      icon: "✏️",
      disabled: !activeView,
      onSelect: () => setDialog({ kind: "rename" }),
    },
    {
      type: "item",
      key: "default",
      label: "Open by Default",
      icon: "⭐",
      checked: Boolean(activeView?.isDefault),
      disabled: !activeView,
      onSelect: handleToggleDefault,
    },
    {
      type: "item",
      key: "delete",
      label: "Delete…",
      icon: "🗑️",
      disabled: !activeView,
      onSelect: () => setDialog({ kind: "delete" }),
    },
  ];

  const buttonTitle = activeView
    ? `View: ${activeView.name}${isModified ? " (modified)" : ""}${
        activeView.isDefault ? " ★" : ""
      }`
    : "Saved views";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={`btn views-button${activeView ? " loaded" : ""}${
          menuPos ? " open" : ""
        }`}
        onClick={toggleMenu}
        title={buttonTitle}
        aria-haspopup="menu"
        aria-expanded={menuPos !== null}
      >
        <span className="views-button-icon" aria-hidden="true">
          🔖
        </span>
        <span className="views-button-label">
          {activeView ? activeView.name : "Views"}
        </span>
        {isModified && (
          <span className="views-button-modified" aria-label="modified">
            •
          </span>
        )}
        <span className="views-button-caret" aria-hidden="true">
          ▾
        </span>
      </button>
      {menuPos && (
        <AquaContextMenu
          x={menuPos.x}
          y={menuPos.y}
          items={menuItems}
          onClose={closeMenu}
          anchorRef={buttonRef}
          label="Views"
        />
      )}
      {dialog?.kind === "save" && (
        <ViewNameDialog
          title="Save View"
          heading="Save the current filters and sort order as a view"
          confirmLabel="Save"
          initialName=""
          onSubmit={handleSaveNew}
          onCancel={() => setDialog(null)}
        />
      )}
      {dialog?.kind === "rename" && activeView && (
        <ViewNameDialog
          title="Rename View"
          heading={`Rename ${activeName}`}
          confirmLabel="Rename"
          initialName={activeView.name}
          onSubmit={handleRename}
          onCancel={() => setDialog(null)}
        />
      )}
      {dialog?.kind === "delete" && activeView && (
        <ConfirmDialog
          title="Delete View"
          heading={`Delete ${activeName}?`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDialog(null)}
        >
          The saved filters and sort order will be removed. The table keeps
          showing what it shows now.
        </ConfirmDialog>
      )}
      {error && (
        <ConfirmDialog
          title="Views"
          heading={error}
          cancelLabel={null}
          onConfirm={() => setError(null)}
          onCancel={() => setError(null)}
        />
      )}
    </>
  );
};

ViewsManager.propTypes = {
  sortConfig: PropTypes.object.isRequired,
  searchTerm: PropTypes.string.isRequired,
  minYear: PropTypes.string.isRequired,
  maxYear: PropTypes.string.isRequired,
  minRating: PropTypes.string.isRequired,
  maxRating: PropTypes.string.isRequired,
  genreTerm: PropTypes.array.isRequired,
  directorTerm: PropTypes.array.isRequired,
  countryTerm: PropTypes.array.isRequired,
  setSortConfig: PropTypes.func.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  setMinYear: PropTypes.func.isRequired,
  setMaxYear: PropTypes.func.isRequired,
  setMinRating: PropTypes.func.isRequired,
  setMaxRating: PropTypes.func.isRequired,
  setGenreTerm: PropTypes.func.isRequired,
  setDirectorTerm: PropTypes.func.isRequired,
  setCountryTerm: PropTypes.func.isRequired,
};

export default ViewsManager;
