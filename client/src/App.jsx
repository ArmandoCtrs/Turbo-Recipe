import "./App.css";

import { useEffect, useState } from "react";

async function testApiConnection() {
    const res = await fetch("/api/ping");
    if (!res.ok) {
        throw new Error(`API responded with ${res.status}`);
    }
    const data = await res.json();
    console.log("API connection OK:", data);
    return data;
}

function App() {
    const [status, setStatus] = useState("checking...");

    useEffect(() => {
        testApiConnection()
            .then((data) => setStatus(`Connected: ${data.message}`))
            .catch((err) => setStatus(`Failed: ${err.message}`));
    }, []);

    return <div>API status: {status}</div>;
}

export default App;
