import "./App.css";

import { useEffect, useState } from "react";
import { testDevApiConnection } from "./utils/testApiConnection.js";

function App() {
    async function checkConnection() {
        const ok = await testDevApiConnection();
        if (import.meta.env.DEV) {
            // this is a safeguard for the dev build to prevent running without the dev backend server
            alert("Failed to connect to the server. Please check that the backend dev server is running. To use the Vite dev server, you need to run the backend dev server in another console window. See README.md for instructions.");
        } else {
            alert("Failed to connect to the server. Please refresh the page or try again later.");
        }
    }

    useEffect(() => {
        checkConnection();
    }, []);

    return <div>API status: {status}</div>;
}

export default App;
