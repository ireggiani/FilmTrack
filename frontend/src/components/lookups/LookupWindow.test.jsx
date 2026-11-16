import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GenresWindow from './GenresWindow';
import DirectorsWindow from './DirectorsWindow';
import CountriesWindow from './CountriesWindow';
import api, { ApiError } from '../../services/api.js';
import { resetLists } from '../../services/lists.js';

jest.mock('react-draggable', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));
jest.mock('../../services/api.js', () => {
  const actual = jest.requireActual('../../services/api.js');
  return {
    __esModule: true,
    ApiError: actual.ApiError,
    default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), del: jest.fn() },
  };
});

const DATA = {
  '/genres': [{ id: 1, name: 'Noir' }, { id: 2, name: 'Drama' }],
  '/directors': [{ id: 1, name: 'Akira Kurosawa' }],
  '/countries': [{ id: 1, name: 'Japan', flagEmoji: '🇯🇵' }],
};

const open = async (component) => {
  const Manager = component;
  const view = render(<Manager isOpen onClose={jest.fn()} onMinimize={jest.fn()} onFocus={jest.fn()} />);
  await screen.findByText('Alphabetical');
  return view;
};
const pills = (container) =>
  [...container.querySelectorAll('.pill-edit-button')].map((pill) => pill.textContent);
const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  resetLists();
  api.get.mockImplementation((path) => Promise.resolve(DATA[path] ?? []));
});

afterEach(() => jest.restoreAllMocks());

describe('manager windows', () => {
  it('lists the items alphabetically and adds one', async () => {
    const { container } = await open(GenresWindow);
    expect(pills(container)).toEqual(['Drama', 'Noir']);
    api.post.mockResolvedValue({ id: 3, name: 'Western' });

    type('Genre Name:', '  Western ');
    fireEvent.click(screen.getByRole('button', { name: 'Add Genre' }));

    await waitFor(() => expect(pills(container)).toEqual(['Drama', 'Noir', 'Western']));
    expect(api.post).toHaveBeenCalledWith('/genres', { name: 'Western' }, 'Could not save the genre');
    expect(screen.getByLabelText('Genre Name:')).toHaveValue('');
    await waitFor(() => expect(screen.getByLabelText('Genre Name:')).toHaveFocus());
  });

  it('refuses a name that only differs in capitalization, without asking the server', async () => {
    await open(GenresWindow);
    type('Genre Name:', 'drama');
    fireEvent.click(screen.getByRole('button', { name: 'Add Genre' }));

    expect(await screen.findByText('Genre already exists')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('renames an item, and lets it keep its own name', async () => {
    const { container } = await open(GenresWindow);
    api.put.mockImplementation((path, body) => Promise.resolve({ id: 2, ...body }));

    fireEvent.click(screen.getByTitle('Edit Drama'));
    expect(screen.getByText('Edit Genre')).toBeInTheDocument();
    expect(screen.getByLabelText('Genre Name:')).toHaveValue('Drama');

    // Renaming it to another genre's name is refused
    type('Genre Name:', 'NOIR');
    fireEvent.click(screen.getByRole('button', { name: 'Update Genre' }));
    expect(await screen.findByText('Genre already exists')).toBeInTheDocument();

    type('Genre Name:', 'DRAMA');
    fireEvent.click(screen.getByRole('button', { name: 'Update Genre' }));
    await waitFor(() => expect(pills(container)).toEqual(['DRAMA', 'Noir']));
    expect(api.put).toHaveBeenCalledWith('/genres/2', { name: 'DRAMA' }, 'Could not save the genre');
    expect(screen.getByText('Add New Genre')).toBeInTheDocument();
  });

  it('cancels an edit', async () => {
    await open(GenresWindow);
    fireEvent.click(screen.getByTitle('Edit Noir'));
    fireEvent.click(screen.getByRole('button', { name: '← Cancel Edit' }));

    expect(screen.getByText('Add New Genre')).toBeInTheDocument();
    expect(screen.getByLabelText('Genre Name:')).toHaveValue('');
  });

  it('filters the list', async () => {
    const { container } = await open(GenresWindow);
    const filter = screen.getByPlaceholderText('Filter genres…');

    fireEvent.change(filter, { target: { value: 'no' } });
    expect(pills(container)).toEqual(['Noir']);
    fireEvent.change(filter, { target: { value: 'zz' } });
    expect(container.querySelector('.genre-list')).toHaveTextContent('No genres match “zz”');
  });

  it('deletes after asking', async () => {
    const { container } = await open(GenresWindow);
    api.del.mockResolvedValue(null);

    fireEvent.click(screen.getByTitle('Delete Noir'));
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(pills(container)).toEqual(['Drama']));
    expect(api.del).toHaveBeenCalledWith('/genres/1', undefined);
  });

  it("shows the server's reason in the metal form, which keeps what was typed", async () => {
    const { container } = await open(DirectorsWindow);
    expect(container.querySelector('.window--metal .metal-sheen')).toBeInTheDocument();
    api.post.mockRejectedValue(new ApiError('That name is already in use', 409));

    type('Director Name', 'Agnès Varda');
    fireEvent.click(screen.getByRole('button', { name: 'Add Director' }));

    expect(await screen.findByText('🚫 Error: That name is already in use')).toBeInTheDocument();
    expect(screen.getByLabelText('Director Name')).toHaveValue('Agnès Varda');
    expect(pills(container)).toEqual(['Akira Kurosawa']);
  });

  it('needs a flag for a country and shows it on the pill', async () => {
    const { container } = await open(CountriesWindow);
    expect(pills(container)).toEqual(['🇯🇵Japan']);
    api.post.mockResolvedValue({ id: 2, name: 'Chile', flagEmoji: '🇨🇱' });

    type('Country Name', 'Chile');
    expect(screen.getByRole('button', { name: 'Add Country' })).toBeDisabled();
    type('Flag Emoji', '🇨🇱');
    // Longer than a flag: ignored
    type('Flag Emoji', '🇨🇱🇨🇱');
    expect(screen.getByLabelText('Flag Emoji')).toHaveValue('🇨🇱');
    fireEvent.click(screen.getByRole('button', { name: 'Add Country' }));

    await waitFor(() => expect(pills(container)).toEqual(['🇨🇱Chile', '🇯🇵Japan']));
    expect(api.post).toHaveBeenCalledWith(
      '/countries',
      { name: 'Chile', flagEmoji: '🇨🇱' },
      'Could not save the country',
    );
  });

  it('keeps what was typed while the form is hidden, and shows it again for an edit', async () => {
    const { container } = await open(CountriesWindow);
    const form = container.querySelector('form');
    type('Country Name', 'Chi');

    fireEvent.click(screen.getByTitle('Hide Add Form'));
    expect(form).toHaveClass('hide');
    fireEvent.click(screen.getByTitle('Show Add Form'));
    expect(form).not.toHaveClass('hide');
    expect(screen.getByLabelText('Country Name')).toHaveValue('Chi');

    fireEvent.click(screen.getByTitle('Hide Add Form'));
    fireEvent.click(screen.getByTitle('Edit Japan'));
    expect(form).not.toHaveClass('hide');
    expect(screen.getByLabelText('Country Name')).toHaveValue('Japan');
    expect(screen.getByLabelText('Flag Emoji')).toHaveValue('🇯🇵');
  });
});
