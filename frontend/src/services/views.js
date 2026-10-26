import API_BASE_URL from '../config/api.js';

const API_URL = `${API_BASE_URL}/views`;

// Uses the server's message when it sent one (e.g. a duplicate name)
const failure = async (response, fallback) => {
    const body = await response.json().catch(() => null);
    return new Error(body?.error || fallback);
};

export const getViews = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw await failure(response, 'Failed to fetch views');
    }
    return response.json();
};

export const saveView = async (view) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(view),
    });
    if (!response.ok) {
        throw await failure(response, 'Failed to save view');
    }
    return response.json();
};

export const updateView = async (viewId, changes) => {
    const response = await fetch(`${API_URL}/${viewId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(changes),
    });
    if (!response.ok) {
        throw await failure(response, 'Failed to update view');
    }
    return response.json();
};

export const deleteView = async (viewId) => {
    const response = await fetch(`${API_URL}/${viewId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw await failure(response, 'Failed to delete view');
    }
};
