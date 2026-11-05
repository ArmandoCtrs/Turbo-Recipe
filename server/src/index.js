import path from "path";
import { readFileSync } from "fs";
import express from "express";

const app = express();

// From Albert: I also added backend support for fetching a recipe by its ID. Of course, this isn't permanent and will be replaced,
// by a database, but it's proof that the functionality works.
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
        return res.status(404).json({ error: "Recipe not found." });
    }

    res.json(recipe);
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