import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../auth/useAuth";

export function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        // if we're logged out, redirect back to the login page
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}