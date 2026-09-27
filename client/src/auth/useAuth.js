import { useContext } from "react";
import { AuthContext } from "./AuthContext";
 
/**
 * useAuth() — call this anywhere in the tree (below <AuthProvider>) to get:
 *   { user, isAuthenticated, isLoading, login, logout }
 */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (ctx === undefined) {
        throw new Error("useAuth must be used within an <AuthProvider>");
    }
    return ctx;
}
 