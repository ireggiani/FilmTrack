import API_BASE_URL from '../config/api.js';

const API_URL = `${API_BASE_URL}/views`;

export const getViews = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error('Failed to fetch views');
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
        throw new Error('Failed to save view');
    }
    return response.json();
};

export const deleteView = async (viewId) => {
    const response = await fetch(`${API_URL}/${viewId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete view');
    }
};
