import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(undefined);
const STORAGE_KEY = "recipeApp.auth";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // On first load, restore any existing session (e.g. from a stored token).
    useEffect(() => {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        console.log(stored, JSON.parse(stored));
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                window.localStorage.removeItem(STORAGE_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    async function login(username, password) {
        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await response.json();

        // Reject unsuccessful login attempts
        if (!response.ok) {
            throw new Error(data.message || "Invalid credentials");
        }

        // Store authenticated user in React state
        setUser(data.user);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user)); // persist session

        return data.user;
    }

    async function register(username, firstName, lastName, password, passwordVerify, email) {
        const response = await fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                username,
                firstName,
                lastName,
                password,
                passwordVerify,
                email
            })
        });

        const data = await response.json();

        // Reject unsuccessful login attempts
        if (!response.ok) {
            throw new Error(data.message || "Error registering new account");
        }

        // Store authenticated user in React state
        setUser(data.user);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user)); // persist session

        return data.user;
    }

    function logout() {
        // TODO: invalidate the token/session in the backend
        window.localStorage.removeItem(STORAGE_KEY);
        setUser(null);
    }

    const value = {
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}