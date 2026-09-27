import path from "path";
import express from "express";

const app = express();

const isProd = !process.argv.includes("--dev");
const clientDist = path.resolve(import.meta.dirname, "../../client/dist");

if (isProd) {
    app.use(express.static(clientDist));
    app.get("/{*splat}", (req, res) => {
        // since we're using JS routing, for ANY route, serve index.html
        // then, index.html will figure out from there what to render
        res.sendFile(path.join(clientDist, "index.html"));
    });
} else {
    // from mike: I wrote in this section so nobody gets confused about how to run the 
    // frontend and backend servers when making changes.
    app.get("/", (req, res) => {
        res.send(`
            <ul>
            <li>This is the <strong>dev backend server</strong>, used for active development.</li>
            <li>To see the app, you need to run the <strong>dev frontend server</strong> in another terminal window.</li>
            <li>Run "<code>npm run dev:client</code>" in another terminal window.</li>
            <li>Then, go to <a href='http://localhost:5173/'>http://localhost:5173/</a> to see the frontend.</li>
            <br/><br/>
            <li>If you wanted to run the production server instead, run "<code>npm run build</code>" and then "<code>npm run start</code>", and then refresh this page.</li>
            </ul>
            `
        );
    });
}

app.get("/api/ping", (req, res) => {
    res.json({ message: "up", timestamp: Date.now() });
});

app.listen(3001, () => {
    console.log("Server listening on port 3001");
    if (isProd) {
        console.log(`Frontend link: http://localhost:3001`);
    }
});