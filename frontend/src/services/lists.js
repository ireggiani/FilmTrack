import { useEffect, useSyncExternalStore } from 'react';
import api from './api.js';

// The app's lists, shared by every window. Each is fetched the first time a
// window asks for it, and every later change goes through here, so all the
// windows showing a list update together.
const PATHS = {
  movies: '/movies',
  series: '/series',
  genres: '/genres',
  countries: '/countries',
  directors: '/directors',
  actors: '/actors',
};

// Movies and series carry copies of their genres, countries… under these keys.
// Renaming or deleting one has to reach the copies too.
const COPIES = {
  genres: 'Genres',
  countries: 'Countries',
  directors: 'Directors',
  actors: 'Actors',
};
const WITH_COPIES = ['movies', 'series'];

const emptyState = () =>
  Object.fromEntries(
    Object.keys(PATHS).map((name) => [name, { items: [], loaded: false, error: null }]),
  );

let state = emptyState();
let requests = {};
// Bumped by resetLists, so an answer to an earlier request is dropped
let generation = 0;
const listeners = new Set();

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const set = (name, changes) => {
  state = { ...state, [name]: { ...state[name], ...changes } };
  listeners.forEach((listener) => listener());
};

// Fetch a list again. A failed reload keeps the items already shown.
export function loadList(name) {
  if (requests[name]) return requests[name];
  const startedIn = generation;
  const request = api
    .get(PATHS[name], `Failed to load ${name}`)
    .then(
      (items) => {
        if (startedIn === generation) set(name, { items, loaded: true, error: null });
      },
      (error) => {
        console.error(`Error loading ${name}:`, error);
        if (startedIn === generation) set(name, { error: error.message });
      },
    )
    .finally(() => {
      if (requests[name] === request) delete requests[name];
    });
  requests[name] = request;
  return request;
}

// Fetch again every list a window has asked for (the 🔄 buttons, after a restore)
export const reloadLists = () =>
  Promise.all(
    Object.keys(PATHS)
      .filter((name) => state[name].loaded || state[name].error)
      .map(loadList),
  );

export const updateList = (name, change) =>
  set(name, { items: change(state[name].items) });

// Apply `change` to the copies of one item inside movies and series
const updateCopies = (name, id, change) => {
  const key = COPIES[name];
  if (!key) return;
  for (const list of WITH_COPIES) {
    updateList(list, (items) =>
      items.map((item) =>
        item[key]?.some((copy) => copy.id === id)
          ? { ...item, [key]: change(item[key]) }
          : item,
      ),
    );
  }
};

// Create (no id) or update an item. Throws ApiError when the server refuses.
export async function saveItem(name, id, body, fallback) {
  if (id == null) {
    const created = await api.post(PATHS[name], body, fallback);
    updateList(name, (items) => [...items, created]);
    return created;
  }
  const saved = await api.put(`${PATHS[name]}/${id}`, body, fallback);
  updateList(name, (items) => items.map((item) => (item.id === id ? saved : item)));
  updateCopies(name, id, (copies) =>
    copies.map((copy) => (copy.id === id ? { ...copy, ...saved } : copy)),
  );
  return saved;
}

export async function removeItem(name, id, fallback) {
  await api.del(`${PATHS[name]}/${id}`, fallback);
  updateList(name, (items) => items.filter((item) => item.id !== id));
  updateCopies(name, id, (copies) => copies.filter((copy) => copy.id !== id));
}

// { items, loading, error } for one list, fetching it if nobody has yet.
// A window opened after a failed load tries again.
export function useList(name) {
  const list = useSyncExternalStore(subscribe, () => state[name]);
  useEffect(() => {
    if (!state[name].loaded) loadList(name);
  }, [name]);
  return {
    items: list.items,
    loading: !list.loaded && !list.error,
    error: list.error,
  };
}

// For tests: forget everything
export function resetLists() {
  generation += 1;
  requests = {};
  state = emptyState();
  listeners.forEach((listener) => listener());
}
