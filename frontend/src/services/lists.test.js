import { act, renderHook, waitFor } from '@testing-library/react';
import api, { ApiError } from './api.js';
import { loadList, reloadLists, removeItem, resetLists, saveItem, useList } from './lists.js';

jest.mock('./api.js', () => {
  const actual = jest.requireActual('./api.js');
  return {
    __esModule: true,
    ApiError: actual.ApiError,
    default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), del: jest.fn() },
  };
});

const DATA = {
  '/genres': [{ id: 1, name: 'Drama' }, { id: 2, name: 'Noir' }],
  '/movies': [
    { id: 10, title: 'Ran', Genres: [{ id: 1, name: 'Drama', MovieGenres: { MovieId: 10 } }] },
    { id: 11, title: 'Alien', Genres: [{ id: 2, name: 'Noir' }] },
  ],
  '/series': [{ id: 20, title: 'Twin Peaks', Genres: [{ id: 1, name: 'Drama' }] }],
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  resetLists();
  api.get.mockImplementation((path) => Promise.resolve(DATA[path] ?? []));
});

afterEach(() => jest.restoreAllMocks());

const use = (name) => renderHook(useList, { initialProps: name });
const loaded = async (...hooks) => {
  for (const hook of hooks) await waitFor(() => expect(hook.result.current.loading).toBe(false));
};

describe('lists', () => {
  it('fetches a list once, however many windows use it', async () => {
    const first = use('genres');
    const second = use('genres');
    await loaded(first, second);

    expect(second.result.current.items).toEqual(DATA['/genres']);
    use('genres');
    expect(api.get).toHaveBeenCalledTimes(1);
  });

  it('shows an added item everywhere', async () => {
    const one = use('genres');
    const other = use('genres');
    await loaded(one, other);
    api.post.mockResolvedValue({ id: 3, name: 'Western' });

    await act(() => saveItem('genres', null, { name: 'Western' }));

    expect(api.post).toHaveBeenCalledWith('/genres', { name: 'Western' }, undefined);
    expect(other.result.current.items.map((g) => g.name)).toEqual(['Drama', 'Noir', 'Western']);
  });

  it('renames an item inside the movies and series that have it', async () => {
    const [genres, movies, series] = [use('genres'), use('movies'), use('series')];
    await loaded(genres, movies, series);
    const alien = movies.result.current.items[1];
    api.put.mockResolvedValue({ id: 1, name: 'Tragedy' });

    await act(() => saveItem('genres', 1, { name: 'Tragedy' }));

    expect(genres.result.current.items[0].name).toBe('Tragedy');
    // The link data that came with the copy is kept
    expect(movies.result.current.items[0].Genres).toEqual([
      { id: 1, name: 'Tragedy', MovieGenres: { MovieId: 10 } },
    ]);
    expect(series.result.current.items[0].Genres[0].name).toBe('Tragedy');
    // A movie without that genre is left alone, so its row doesn't redraw
    expect(movies.result.current.items[1]).toBe(alien);
  });

  it('removes a deleted item from the movies that had it', async () => {
    const [genres, movies] = [use('genres'), use('movies')];
    await loaded(genres, movies);
    api.del.mockResolvedValue(null);

    await act(() => removeItem('genres', 1));

    expect(api.del).toHaveBeenCalledWith('/genres/1', undefined);
    expect(genres.result.current.items).toEqual([{ id: 2, name: 'Noir' }]);
    expect(movies.result.current.items[0].Genres).toEqual([]);
  });

  it('changes nothing when the server refuses', async () => {
    const genres = use('genres');
    await loaded(genres);
    api.put.mockRejectedValue(new ApiError('That name is already in use', 409));

    await expect(saveItem('genres', 2, { name: 'Drama' })).rejects.toThrow('already in use');
    expect(genres.result.current.items).toEqual(DATA['/genres']);
  });

  it('reports a failed load, and tries again for the next window', async () => {
    api.get.mockRejectedValueOnce(new ApiError('Failed to load genres', 500));
    const first = use('genres');
    await waitFor(() => expect(first.result.current.error).toBe('Failed to load genres'));
    expect(first.result.current.loading).toBe(false);

    const second = use('genres');
    await waitFor(() => expect(second.result.current.items).toHaveLength(2));
    expect(first.result.current.error).toBeNull();
  });

  it('keeps what it had when a reload fails', async () => {
    const genres = use('genres');
    await loaded(genres);
    api.get.mockRejectedValueOnce(new ApiError('Failed to load genres', 500));

    await act(() => loadList('genres'));

    expect(genres.result.current.error).toBe('Failed to load genres');
    expect(genres.result.current.items).toHaveLength(2);
  });

  it('reloads only the lists that are in use', async () => {
    const genres = use('genres');
    await loaded(genres);
    api.get.mockClear();
    api.get.mockResolvedValue([{ id: 9, name: 'Fresh' }]);

    await act(() => reloadLists());

    expect(api.get.mock.calls.map(([path]) => path)).toEqual(['/genres']);
    expect(genres.result.current.items).toEqual([{ id: 9, name: 'Fresh' }]);
  });
});
