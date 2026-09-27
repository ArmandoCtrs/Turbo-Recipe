import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(undefined);
const STORAGE_KEY = "recipeApp.auth";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // On first load, restore any existing session (e.g. from a stored token).
    useEffect(() => {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                window.localStorage.removeItem(STORAGE_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    async function login(email, password) {
        // TODO: replace with a real API call
        // this is just a template for now
        const fakeUser = { id: "1", email, name: email.split("@")[0] };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fakeUser));
        setUser(fakeUser);
        return fakeUser;
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
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}