import api, { ApiError } from './api.js';

const respond = (status, body) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => (body === undefined ? Promise.reject(new Error('no body')) : Promise.resolve(body)),
    blob: () => Promise.resolve('the blob'),
  });

describe('api', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() => respond(200, { id: 1 }));
  });

  it('adds the /api prefix and returns the parsed body', async () => {
    await expect(api.get('/movies')).resolves.toEqual({ id: 1 });
    expect(global.fetch).toHaveBeenCalledWith('/api/movies', { method: 'GET' });
  });

  it('sends objects as JSON', async () => {
    await api.put('/notes/3', { title: 'Hi' });
    expect(global.fetch).toHaveBeenCalledWith('/api/notes/3', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: '{"title":"Hi"}',
    });
  });

  it('sends FormData untouched, with no JSON header', async () => {
    const form = new FormData();
    await api.post('/movies/1/poster', form);
    expect(global.fetch).toHaveBeenCalledWith('/api/movies/1/poster', { method: 'POST', body: form });
  });

  it('resolves with null on an empty reply', async () => {
    global.fetch = jest.fn(() => respond(204));
    await expect(api.del('/movies/1')).resolves.toBeNull();
  });

  it('returns downloads as a blob', async () => {
    await expect(api.blob('/database/backup')).resolves.toBe('the blob');
  });

  it("throws the server's message and status when refused", async () => {
    global.fetch = jest.fn(() => respond(409, { error: 'That name is already in use' }));
    const error = await api.post('/actors', { name: 'Mel Gibson' }, 'Could not save').catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe('That name is already in use');
    expect(error.status).toBe(409);
  });

  it('falls back when a refusal has no readable message', async () => {
    global.fetch = jest.fn(() => respond(500));
    await expect(api.get('/movies', 'Failed to fetch movies')).rejects.toThrow('Failed to fetch movies');
  });
});
