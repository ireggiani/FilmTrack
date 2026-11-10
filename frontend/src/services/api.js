import API_BASE_URL from '../config/api.js';

// A response outside 2xx. The message is the server's { error } when it sent
// one, which is written to be shown to the user, otherwise the call's fallback.
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const send = async (method, path, body, fallback) => {
  const options = { method };
  if (body instanceof FormData) {
    // The browser sets the Content-Type itself, with the multipart boundary
    options.body = body;
  } else if (body !== undefined) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, options);
  if (!response.ok) {
    const failure = await response.json().catch(() => null);
    throw new ApiError(failure?.error || fallback, response.status);
  }
  return response;
};

const json = async (response) => (response.status === 204 ? null : response.json());

// Paths start after /api. Each call resolves with the parsed body and throws
// ApiError when refused; the last argument is the message if the server sent none.
const api = {
  get: (path, fallback = 'Request failed') =>
    send('GET', path, undefined, fallback).then(json),
  // For downloads
  blob: (path, fallback = 'Request failed') =>
    send('GET', path, undefined, fallback).then((response) => response.blob()),
  post: (path, body, fallback = 'Request failed') =>
    send('POST', path, body, fallback).then(json),
  put: (path, body, fallback = 'Request failed') =>
    send('PUT', path, body, fallback).then(json),
  del: (path, fallback = 'Request failed') =>
    send('DELETE', path, undefined, fallback).then(json),
};

export default api;
