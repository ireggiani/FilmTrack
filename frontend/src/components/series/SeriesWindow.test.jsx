import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import SeriesWindow from './SeriesWindow';
import api from '../../services/api.js';
import { resetLists } from '../../services/lists.js';

jest.mock('react-draggable', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));
jest.mock('../../services/api.js', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), del: jest.fn() },
}));

const series = (id, title, extra = {}) => ({
  id,
  title,
  alternativeTitle: null,
  releaseYear: 1990,
  rating: null,
  watchedDate: null,
  Genres: [],
  Directors: [],
  Actors: [],
  Countries: [],
  posterUrl: null,
  posterThumbUrl: null,
  ...extra,
});

const SERIES = [
  series(1, 'Twin Peaks'),
  series(2, "Gulliver's Travels", { alternativeTitle: 'Los viajes de Gulliver', releaseYear: 1996 }),
];

const renderWindow = () =>
  render(<SeriesWindow isOpen onClose={jest.fn()} onMinimize={jest.fn()} onFocus={jest.fn()} />);

const rowTitles = () =>
  within(screen.getByRole('table'))
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0].textContent);

beforeEach(() => {
  jest.clearAllMocks();
  resetLists();
  api.get.mockImplementation((path) => Promise.resolve(path === '/series' ? SERIES : []));
});

describe('SeriesWindow', () => {
  it('lists series from their own endpoint, never the movies', async () => {
    renderWindow();
    await waitFor(() => expect(rowTitles()).toEqual(["Gulliver's Travels", 'Twin Peaks']));

    expect(api.get).toHaveBeenCalledWith('/series', expect.any(String));
    expect(api.get).not.toHaveBeenCalledWith('/movies', expect.anything());
    expect(screen.getByPlaceholderText('Series title')).toBeInTheDocument();
    expect(screen.getByText('2 series')).toBeInTheDocument();
    // Title search only: no saved views, no year or rating filters
    expect(screen.queryByPlaceholderText('Min Year')).not.toBeInTheDocument();
  });

  it('searches titles and alternative titles', async () => {
    renderWindow();
    const search = await screen.findByLabelText('Search by title');

    fireEvent.change(search, { target: { value: 'viajes' } });
    expect(rowTitles()).toEqual(["Gulliver's Travels"]);
    expect(screen.getByText('1 of 2 series')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Clear title search'));
    expect(rowTitles()).toHaveLength(2);
  });

  it('adds a series through the series endpoint', async () => {
    api.post.mockResolvedValue(series(3, 'Cowboy Bebop', { releaseYear: 1998 }));
    renderWindow();

    fireEvent.change(await screen.findByPlaceholderText('Series title'), { target: { value: 'Cowboy Bebop' } });
    fireEvent.change(screen.getByPlaceholderText('Release year'), { target: { value: '1998' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Series' }));

    await waitFor(() => expect(rowTitles()).toContain('Cowboy Bebop'));
    expect(api.post).toHaveBeenCalledWith(
      '/series',
      expect.objectContaining({ title: 'Cowboy Bebop', releaseYear: 1998 }),
      expect.any(String),
    );
  });
});
