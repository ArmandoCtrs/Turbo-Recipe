import path from "path";
import express from "express";
import session from 'express-session';
import bodyParser from 'body-parser';
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";

export function favoritesRouter(userCollection, recipeCollection) {
    const router = express.Router();

    router.use("/:recipeId/favorite", (req, res, next) => {
        if (!req.session.user || !ObjectId.isValid(req.session.user.id)) {
            return res.status(401).json({ error: "Please log in to manage favorites." });
        }
        if (!ObjectId.isValid(req.params.recipeId)) {
            return res.status(400).json({ error: "Invalid recipe ID." });
        }
        next();
    });

    router.get("/:recipeId/favorite", async (req, res) => {
        try {
            const user = await userCollection.findOne(
                { _id: new ObjectId(req.session.user.id) },
                { projection: { favorites: 1 } }
            );
            if (!user) {
                return res.status(404).json({ error: "User not found." });
            }
            if (user.favorites !== undefined && !Array.isArray(user.favorites)) {
                throw new Error("User favorites is not an array.");
            }
            const recipeId = new ObjectId(req.params.recipeId);
            res.json({ favorite: (user.favorites ?? []).some((id) => id instanceof ObjectId && id.equals(recipeId)) });
        } catch (error) {
            console.error("Failed to load favorite:", error);
            res.status(500).json({ error: "Unable to load favorite status." });
        }
    });

    router.put("/:recipeId/favorite", async (req, res) => {
        try {
            const recipeId = new ObjectId(req.params.recipeId);
            const recipe = await recipeCollection.findOne({ _id: recipeId }, { projection: { _id: 1 } });
            if (!recipe) {
                return res.status(404).json({ error: "Recipe not found." });
            }
            const result = await userCollection.updateOne(
                { _id: new ObjectId(req.session.user.id) },
                { $addToSet: { favorites: recipeId } }
            );
            if (!result.matchedCount) {
                return res.status(404).json({ error: "User not found." });
            }
            res.json({ favorite: true });
        } catch (error) {
            console.error("Failed to favorite recipe:", error);
            res.status(500).json({ error: "Unable to favorite recipe." });
        }
    });

    router.delete("/:recipeId/favorite", async (req, res) => {
        try {
            const result = await userCollection.updateOne(
                { _id: new ObjectId(req.session.user.id) },
                { $pull: { favorites: new ObjectId(req.params.recipeId) } }
            );
            if (!result.matchedCount) {
                return res.status(404).json({ error: "User not found." });
            }
            res.json({ favorite: false });
        } catch (error) {
            console.error("Failed to unfavorite recipe:", error);
            res.status(500).json({ error: "Unable to unfavorite recipe." });
        }
    });

    return router;
}

async function startServer() {
    dotenv.config({ path: path.resolve(import.meta.dirname, "../../.env") });

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

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();

    const database = client.db("db");
    const userCollection = database.collection("users");
    const recipeCollection = database.collection("recipes");

    // Registration route used by Register.jsx to create a new user account. All fields are required, and it checks for email and username uniqueness, which is enforced by Atlas as well.
    app.post("/register", async (req, res) => {
        const { username, email, password, firstName, lastName } = req.body;

        if (
            typeof username !== "string" || !username.trim() ||
            typeof email !== "string" || !email.trim() ||
            typeof password !== "string" || !password ||
            typeof firstName !== "string" || !firstName.trim() ||
            typeof lastName !== "string" || !lastName.trim()
        ) {
            // Throw a code 400 if any of the registration fields are empty.
            return res.status(400).json({ error: "All registration fields are required." });
        }

        try {
            const normalizedUsername = username.trim();
            const normalizedEmail = email.trim().toLowerCase();

            const existingUser = await userCollection.findOne({
                $or: [
                    { username: normalizedUsername },
                    { email: normalizedEmail }
                ]
            });

            // Throw a code 409 (Conflict) if the username or email is already registered.
            if (existingUser) {
                return res.status(409).json({
                    error: "Username or email is already registered."
                });
            }

            const result = await userCollection.insertOne({
                username: normalizedUsername,
                email: normalizedEmail,
                password,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                favorites: []
            });

            const user = {
                id: result.insertedId,
                username: normalizedUsername,
                firstName: firstName.trim(),
                lastName: lastName.trim()
            };

            req.session.user = user;
            res.status(201).json({ message: "Registration successful.", user });
        } catch (error) {
            console.error("Failed to register user:", error);
            res.status(500).json({ error: "Unable to register." });
        }
    });

    // Login route
    app.post("/login", async (req, res) => {
        const user = await userCollection.findOne({
            username: req.body.username,
            password: req.body.password
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        req.session.user = {
            id: user._id,
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
            return res.status(401).json({ message: 'Unauthorized. Please ensure you are logged in, or re-login' });
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

    app.get("/api/ping", (req, res) => {
        res.json({ message: "up", timestamp: Date.now() });
    });

    app.use("/api/recipes", favoritesRouter(userCollection, recipeCollection));

    app.post("/api/recipes", async (req, res) => {
        if (!req.session.user) {
            return res.status(401).json({ error: "" });
        }

        const { name, description, ingredients, instructions, tags } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            !Array.isArray(ingredients) ||
            ingredients.length === 0 ||
            ingredients.some((ingredient) => typeof ingredient !== "string" || !ingredient.trim()) ||
            typeof instructions !== "string" ||
            !instructions.trim() ||
            (tags !== undefined && !Array.isArray(tags))
        ) {
            return res.status(400).json({
                error: "Name, ingredients, and instructions are required."
            });
        }

        if (!ObjectId.isValid(req.session.user.id)) {
            return res.status(401).json({ error: "Invalid authenticated user." });
        }

        try {
            const result = await recipeCollection.insertOne({
                name: name.trim(),
                ...(typeof description === "string" && description.trim()
                    ? { description: description.trim() }
                    : {}),
                author: new ObjectId(req.session.user.id),
                ingredients: ingredients.map((ingredient) => ingredient.trim()),
                instructions: instructions.trim(),
                tags: Array.isArray(tags)
                    ? tags
                        .filter((tag) => typeof tag === "string")
                        .map((tag) => tag.trim())
                        .filter(Boolean)
                    : []
            });

            res.status(201).json({
                recipe: {
                    id: String(result.insertedId),
                    name: name.trim()
                }
            });
        } catch (error) {
            console.error("Failed to add recipe:", error);
            res.status(500).json({ error: "Unable to add recipe." });
        }
    });

    // From Albert: Added an endpoint for recipe fetches by ID,
    // allowing requests such as GET /api/recipes/r1 (the Classic Spaghetti Carbonara) possible.
    // After verifying with CoPilot that RecipeDetail correctly uses the new useRecipes() function in the API module, I asked it to help design the corresponding backend endpoint.
    app.get("/api/recipes/:recipeId", async (req, res, next) => {
        try {
            if (!ObjectId.isValid(req.params.recipeId)) {
                return res.status(400).json({ error: "Invalid recipe ID." });
            }

            const [recipe] = await recipeCollection.aggregate([
                { $match: { _id: new ObjectId(req.params.recipeId) } },
                {
                    $lookup: {
                        from: "users",
                        localField: "author",
                        foreignField: "_id",
                        as: "authorUser"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        id: { $toString: "$_id" },
                        name: 1,
                        author: { $arrayElemAt: ["$authorUser.username", 0] },
                        tags: 1,
                        description: 1,
                        ingredients: 1,
                        instructions: 1
                    }
                }
            ]).toArray();

            if (!recipe) {
                return res.status(404).json({ error: "Recipe not found." });
            }

            res.json({ ...recipe, id: String(recipe._id) });
        } catch (error) {
            next(error);
        }
    });

    app.get("/api/recipes", async (req, res, next) => {
        try {
            const results = await recipeCollection.aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "author",
                        foreignField: "_id",
                        as: "authorUser"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        id: { $toString: "$_id" },
                        name: 1,
                        author: { $arrayElemAt: ["$authorUser.username", 0] },
                        tags: 1,
                        description: 1,
                        ingredients: 1,
                        instructions: 1
                    }
                }
            ]).toArray();

            res.json(results.map((recipe) => ({
                ...recipe,
                id: String(recipe._id)
            })));
        } catch (error) {
            next(error);
        }
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
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
    await startServer();
}