export const API_BASE_URL = "http://localhost:7777";

export async function apiFetch(path, options = {}) {
    const auth = JSON.parse(localStorage.getItem("home-dashboard-auth"));
    const token = auth?.token;

    return fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
}