import path from "path";
import express from "express";
import session from 'express-session';
import bodyParser from 'body-parser';
import fs from "fs";//for reading the sample user database

const app = express();

// Parse request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Configure sessions
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));


// Login route
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Sample user database
    var users = [];
    try {
        users = JSON.parse(fs.readFileSync('../sample_data/users.json', 'utf8'));
    } catch (err) {
        console.error(err);
    }

    const user = users.find(
        u => u.username === username && u.password === password
    );

    if (!user) {
        return res.status(401).json({ message: "Invalid username or password." });
    }

    req.session.user = {
        id: user.id,
        username: user.username
    };

    res.json({
        message: "Login successful",
        user: req.session.user
    });
});

// Protected route
app.get('/profile', (req, res) => {
    // Check if user is logged in
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    res.json({ message: 'Profile accessed', user: req.session.user });
});

// Logout route
app.post('/logout', (req, res) => {
    // Destroy session
    req.session.destroy((err) => {
        if (err) {
        return res.status(500).json({ message: 'Logout failed' });
        }
        res.json({ message: 'Logout successful' });
    });
});

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