import { createContext, useContext, useState } from "react";

const API_URL = "http://localhost:7777/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState(() => {
        try {
            const savedAuth = localStorage.getItem("home-dashboard-auth");
            return savedAuth ? JSON.parse(savedAuth) : null;
        } catch {
            return null;
        }
    });

    const register = async ({ username, email, password }) => {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, email, password }),
        });

        if (!response.ok) {
            throw new Error("Impossible de créer le compte.");
        }

        const data = await response.json();

        localStorage.setItem(
            "home-dashboard-auth",
            JSON.stringify(data)
        );

        setAuth(data);

        return data;
    };

    const login = async ({ email, password }) => {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error("Email ou mot de passe incorrect.");
        }

        const data = await response.json();

        localStorage.setItem(
            "home-dashboard-auth",
            JSON.stringify(data)
        );

        setAuth(data);

        return data;
    };

    const logout = () => {
        localStorage.removeItem("home-dashboard-auth");
        setAuth(null);
    };

    return (
        <AuthContext.Provider
            value={{
                auth,
                token: auth?.token ?? null,
                isAuthenticated: !!auth?.token,
                register,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth doit être utilisé dans AuthProvider"
        );
    }

    return context;
}