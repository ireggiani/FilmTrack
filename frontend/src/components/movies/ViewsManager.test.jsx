import { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ViewsManager from './ViewsManager';
import { getViews, saveView, updateView } from '../../services/views';

// Both read import.meta.env, which Jest can't parse
jest.mock('../../config/api.js', () => ({ __esModule: true, default: '' }));
jest.mock('./useMovies', () => ({
  DEFAULT_SORT: { key: 'title', direction: 'ascending' },
}));
jest.mock('../../services/views');

const SIXTIES = {
  id: 1,
  name: '60s',
  filters: { minYear: '1960', maxYear: '1969' },
  sorting: { key: 'year', direction: 'ascending' },
  isDefault: false,
};
const RUSSIAN = {
  id: 2,
  name: 'Russian',
  filters: { countryTerm: [20] },
  sorting: { key: 'title', direction: 'ascending' },
  isDefault: false,
};

// Owns the filter state the way useMovies does, and exposes min year
const Harness = () => {
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [minYear, setMinYear] = useState('');
  const [maxYear, setMaxYear] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxRating, setMaxRating] = useState('');
  const [genreTerm, setGenreTerm] = useState([]);
  const [directorTerm, setDirectorTerm] = useState([]);
  const [countryTerm, setCountryTerm] = useState([]);
  return (
    <>
      <ViewsManager
        {...{
          sortConfig, searchTerm, minYear, maxYear, minRating, maxRating,
          genreTerm, directorTerm, countryTerm, setSortConfig, setSearchTerm,
          setMinYear, setMaxYear, setMinRating, setMaxRating, setGenreTerm,
          setDirectorTerm, setCountryTerm,
        }}
      />
      <input aria-label="min year" value={minYear} onChange={(e) => setMinYear(e.target.value)} />
      <span data-testid="sort">{`${sortConfig.key} ${sortConfig.direction}`}</span>
    </>
  );
};

const openMenu = () => fireEvent.click(screen.getByRole('button', { name: /views|60s|russian/i }));
// Item names start with their emoji icon, so match on the label's ending
const chooseMenuItem = (label) => {
  openMenu();
  const name = (accessibleName) => accessibleName.endsWith(label);
  fireEvent.click(screen.getByRole('menuitem', { name }));
};

beforeEach(() => {
  jest.resetAllMocks();
});

test('shows the full list by default when no view is starred', async () => {
  getViews.mockResolvedValue([SIXTIES, RUSSIAN]);
  render(<Harness />);
  await waitFor(() => expect(getViews).toHaveBeenCalled());
  expect(screen.getByRole('button', { name: /views/i })).not.toHaveClass('loaded');
  expect(screen.getByLabelText('min year')).toHaveValue('');
});

test('applies the starred view on open and names it on the button', async () => {
  getViews.mockResolvedValue([SIXTIES, { ...RUSSIAN, isDefault: true }]);
  render(<Harness />);
  expect(await screen.findByRole('button', { name: /russian/i })).toHaveClass('loaded');
});

test('loading a view applies its filters and sort, and marks later edits as modified', async () => {
  getViews.mockResolvedValue([SIXTIES]);
  render(<Harness />);
  await waitFor(() => expect(getViews).toHaveBeenCalled());

  fireEvent.click(screen.getByRole('button', { name: /views/i }));
  fireEvent.click(await screen.findByRole('menuitemradio', { name: '60s' }));

  expect(screen.getByLabelText('min year')).toHaveValue('1960');
  expect(screen.getByTestId('sort')).toHaveTextContent('year ascending');
  expect(screen.queryByLabelText('modified')).not.toBeInTheDocument();

  fireEvent.change(screen.getByLabelText('min year'), { target: { value: '1965' } });
  expect(screen.getByLabelText('modified')).toBeInTheDocument();

  updateView.mockResolvedValue({ ...SIXTIES, filters: { minYear: '1965', maxYear: '1969' } });
  chooseMenuItem('Update “60s”');
  await waitFor(() => expect(screen.queryByLabelText('modified')).not.toBeInTheDocument());
  expect(updateView).toHaveBeenCalledWith(1, expect.objectContaining({
    filters: expect.objectContaining({ minYear: '1965' }),
  }));
});

test('"All Movies" clears the view and resets the sort', async () => {
  getViews.mockResolvedValue([SIXTIES]);
  render(<Harness />);
  await waitFor(() => expect(getViews).toHaveBeenCalled());
  fireEvent.click(screen.getByRole('button', { name: /views/i }));
  fireEvent.click(await screen.findByRole('menuitemradio', { name: '60s' }));

  openMenu();
  fireEvent.click(screen.getByRole('menuitemradio', { name: 'All Movies' }));
  expect(screen.getByLabelText('min year')).toHaveValue('');
  expect(screen.getByTestId('sort')).toHaveTextContent('title ascending');
});

test('a duplicate name keeps the save dialog open with the server message', async () => {
  getViews.mockResolvedValue([SIXTIES]);
  saveView.mockRejectedValue(new Error('A view with that name already exists'));
  render(<Harness />);
  await waitFor(() => expect(getViews).toHaveBeenCalled());

  chooseMenuItem('Save as New View…');
  const input = screen.getByPlaceholderText('View name');
  expect(input).toHaveFocus();
  fireEvent.change(input, { target: { value: '60s' } });
  fireEvent.keyDown(input, { key: 'Enter' });

  expect(await screen.findByText('A view with that name already exists')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('View name')).toBeInTheDocument();
});

test('rename updates the name shown on the button', async () => {
  getViews.mockResolvedValue([{ ...SIXTIES, isDefault: true }]);
  updateView.mockResolvedValue({ ...SIXTIES, isDefault: true, name: 'Sixties' });
  render(<Harness />);
  await screen.findByRole('button', { name: /60s/i });

  chooseMenuItem('Rename…');
  const input = screen.getByPlaceholderText('View name');
  fireEvent.change(input, { target: { value: 'Sixties' } });
  fireEvent.click(screen.getByRole('button', { name: 'Rename' }));

  expect(await screen.findByRole('button', { name: /sixties/i })).toBeInTheDocument();
  expect(updateView).toHaveBeenCalledWith(1, { name: 'Sixties' });
});

test('clicking the button while the menu is open closes it', async () => {
  getViews.mockResolvedValue([SIXTIES]);
  render(<Harness />);
  await waitFor(() => expect(getViews).toHaveBeenCalled());
  const button = screen.getByRole('button', { name: /views/i });

  // A real click: mousedown (which the open menu listens for), then click
  const click = () => {
    fireEvent.mouseDown(button);
    fireEvent.click(button);
  };
  click();
  expect(screen.getByRole('menu')).toBeInTheDocument();
  click();
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  click();
  expect(screen.getByRole('menu')).toBeInTheDocument();
});
