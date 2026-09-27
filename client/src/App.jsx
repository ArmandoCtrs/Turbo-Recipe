import "./App.css";

import { useEffect } from "react";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { AppRoutes } from "./routing/AppRoutes.jsx";
import { testDevApiConnection } from "./utils/testApiConnection.js";

function App() {
    async function checkConnection() {
        const ok = await testDevApiConnection();
        if (ok) return;

        if (import.meta.env.DEV) {
            // this is a safeguard for the dev build to prevent running without the dev backend server
            alert("Failed to connect to the server. Please check that the backend dev server is running. To use the Vite dev server, you need to run the backend dev server in another console window. See docs/DEVELOPMENT.md for instructions.");
        } else {
            alert("Failed to connect to the server. Please refresh the page or try again later.");
        }
    }

    useEffect(() => {
        // check API connection on page load
        checkConnection();
    }, []);

    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
