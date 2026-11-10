import api from './api.js';

export const getViews = () => api.get('/views', 'Failed to fetch views');

export const saveView = (view) => api.post('/views', view, 'Failed to save view');

export const updateView = (viewId, changes) =>
    api.put(`/views/${viewId}`, changes, 'Failed to update view');

export const deleteView = (viewId) => api.del(`/views/${viewId}`, 'Failed to delete view');
