// @ts-check
import api from './api.js';

export const getViews = () => api.get('/views', 'Failed to fetch views');

/** @param {object} view */
export const saveView = (view) => api.post('/views', view, 'Failed to save view');

/**
 * @param {number} viewId
 * @param {object} changes Only the fields to change
 */
export const updateView = (viewId, changes) =>
    api.put(`/views/${viewId}`, changes, 'Failed to update view');

/** @param {number} viewId */
export const deleteView = (viewId) => api.del(`/views/${viewId}`, 'Failed to delete view');
