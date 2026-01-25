const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const verifyApi = async (token: string) => {
    return fetch(`${API_BASE_URL}/api/auth/verify`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};

export const loginApi = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
    }

    return response.json();
};

export const registerApi = async (fullname: string, email: string, password: string, college: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fullname, email, password, college })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
    }

    return response.json();
};
