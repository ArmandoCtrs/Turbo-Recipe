import path from "path";
import { readFileSync } from "fs";
import { GoogleGenAI } from '@google/genai';
import express from "express";
import session from 'express-session';
import bodyParser from 'body-parser';
import fs from "fs";//for reading the sample user database
import { createShoppingList } from "./shopping-list";

// TODO: remove this once you set up mongo
const SHOPPING_LISTS = [];

process.loadEnvFile("../.env");

if (!(process.env.SESSION_SECRET && process.env.LLM_API_KEY)) {
    throw new Error(".env file not properly configured. See .env.example for additional information");
}

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.LLM_API_KEY });

// Parse request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
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
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
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
const recipesPath = path.resolve(import.meta.dirname, "../../sample_data/recipes.json");
const recipes = JSON.parse(readFileSync(recipesPath, "utf8"));

app.get("/api/ping", (req, res) => {
    res.json({ message: "up", timestamp: Date.now() });
});

// From Albert: Added an endpoint for recipe fetches by ID, 
// allowing requests such as GET /api/recipes/r1 (the Classic Spaghetti Carbonara) possible.
// After verifying with CoPilot that RecipeDetail correctly uses the new useRecipes() function in the API module, I asked it to help design the corresponding backend endpoint.
app.get("/api/recipes/:recipeId", (req, res) => {
    const recipe = recipes.find((item) => item.id === req.params.recipeId);

    // Returns 404 if the recipe ID isn't found, otherwise, returns the recipe as JSON.
    if (!recipe) {
        return res.status(404).json({ message: "Recipe not found." });
    }

    res.json(recipe);
});


// Create a new shopping list
app.post("/api/users/:userId/shopping-list/new", async (req, res) => {
    if (!req.session.user || req.session.user.id !== req.params.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const lst = await createShoppingList(req.body.recipes, ai);
        const shoppingList = {
            id: Math.random().toString(36).slice(2),
            name: req.body.name,
            user: req.session.user.id,
            createdAt: Date.now(),
            contents: lst,
        }
        SHOPPING_LISTS.push(shoppingList);
        res.json(shoppingList);
    } catch (err) {
        res.status(err.status ?? 500)
            .json({ 
                message: err.status ? err.message : "Something went wrong" 
            });
    }
});

// Delete a shopping list
app.delete("/api/users/:userId/shopping-list/:listId", (req, res) => {
    if (!req.session.user || req.session.user.id !== req.params.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const i = SHOPPING_LISTS.findIndex(lst =>
        lst.id === req.params.listId &&
        lst.user === req.session.user.id
    );

    if (i !== -1) {
        SHOPPING_LISTS.splice(i, 1);
        res.json({ message: "Success" });
    } else {
        res.status(404).send({ error: "Not found" });
    }
});

// Get all user's shopping lists
app.get("/api/users/:userId/shopping-list", (req, res) => {
    if (!req.session.user || req.session.user.id !== req.params.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    res.json(SHOPPING_LISTS.filter(lst => {
        return lst.user === req.session.user.id;
    }));
});

// Get just one shopping list
app.get("/api/users/:userId/shopping-list/:listId", (req, res) => {
    if (!req.session.user || req.session.user.id !== req.params.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const shoppingList = SHOPPING_LISTS.find(lst => {
        return lst.id === req.params.listId;
    });

    if (!shoppingList) {
        return res.status(404).json({ message: 'Not found' });
    }

    if (shoppingList.user !== req.session.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(shoppingList);
});

// from mike: unknown /api/* paths should 404 as JSON, not fall through to index.html
app.use("/api", (req, res) => {
    res.status(404).json({ error: "Not found." });
});

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

app.listen(3001, () => {
    console.log("Server listening on port 3001");
    if (isProd) {
        console.log(`Frontend link: http://localhost:3001`);
    }
});