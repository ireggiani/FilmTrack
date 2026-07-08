const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

// Base for backend-served static assets (e.g. movie posters at /posters/...)
export const ASSETS_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';

export default API_BASE_URL;