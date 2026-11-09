// From Albert: LLM Disclosure. This component was created with the assistance of VS Code's CoPilot (GPT-5.6 Luna). I'd specifically asked it to
// generate the RecipeDetail component for displaying recipe details, explicitly including name, author, tags, description, ingredients, and instructions.
// As a frame of reference, I gave it my Zillow API that I made for Assignment 5 as something to model after.

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getRecipe } from "../api";

import { Layout } from "../components/Layout";

const styles = {
    page: {
        maxWidth: 800,
        width: "100%",
        margin: "0 auto",
        padding: "24px 20px 48px",
        height: "100%",
        flex: 1,
        overflowY: "auto",
    },
    backLink: {
        display: "inline-block",
        marginBottom: 24,
        color: "#2f6fed",
        textDecoration: "none",
    },
    heading: {
        display: "flex",
        flexDirection: "column", // Overrides default App.css flex-direction to display header elements vertically.
        alignItems: "stretch",
        marginBottom: 24,
    },
    name: {
        display: "block",
        margin: 0,
        fontFamily: '"Lexend", sans-serif',
        fontSize: 32,
        lineHeight: 1.2,
        width: "100%",
    },
    author: {
        display: "block",
        marginTop: 8,
        color: "#5b6370",
    },
    tags: {
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        margin: "16px 0 0",
        padding: 0,
        listStyle: "none",
    },
    tag: {
        padding: "4px 10px",
        color: "#1f5133",
        background: "#e3f1e8",
        border: "1px solid #9cc7aa",
        borderRadius: 999,
        fontSize: 13,
    },
    section: {
        marginTop: 28,
    },
    sectionHeading: {
        marginBottom: 10,
    },
    ingredients: {
        margin: 0,
        paddingLeft: 22,
        lineHeight: 1.7,
    },
    instructions: {
        margin: 0,
        paddingLeft: 22,
        lineHeight: 1.7,
    },
};

// RecipeDetail component that displays the details of the fetched recipe. This relies on the getRecipe() function from the API
// module, but of course, this can be changed in the future. This also doesn't yet support showing prep time, cook time, or difficulty,
// which'll be added in the future and handled by an LLM API call.
export function RecipeDetail() {
    const { recipeId } = useParams();
    const [recipeLoad, setRecipeLoad] = useState(null);

    useEffect(() => {
        let cancelled = false;

        getRecipe(recipeId)
            .then((data) => {
                if (!cancelled) setRecipeLoad({ recipeId, recipe: data, error: null });
            })
            .catch((requestError) => {
                if (!cancelled) {
                    setRecipeLoad({ recipeId, recipe: null, error: requestError.message });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [recipeId]);

    // As requested, the string in the "instructions" field is split into individual steps, splitting for each period.
    // Could use newlines, but either way, it'd be good to tell the user when they're actually adding a new recipe.
    const recipe = recipeLoad?.recipeId === recipeId ? recipeLoad.recipe : null;
    const error = recipeLoad?.recipeId === recipeId ? recipeLoad.error : null;
    const instructionSteps = recipe?.instructions
        .split(".")
        .map((instruction) => instruction.trim())
        .filter(Boolean);

    if (error) {
        return (
            <Layout>
                <main style={styles.page}>
                    <Link to="/recipes" style={styles.backLink}>Back to recipes</Link>
                    <h1>Unable to load recipe</h1>
                    <p>{error}</p>
                </main>
            </Layout>
        );
    }

    if (recipe === null) {
        return (
            <Layout>
                <main style={styles.page}>
                    <p>Loading recipe...</p>
                </main>
            </Layout>
        );
    }

    return (
        <Layout>
            <main style={styles.page}>
                <Link to="/recipes" style={styles.backLink}>Back to recipes</Link>

                <header style={styles.heading}>
                    <h1 style={styles.name}>{recipe.name}</h1>
                    <span style={styles.author}>By @{recipe.author}</span>
                    <ul style={styles.tags}>
                        {recipe.tags.map((tag) => (
                            <li key={tag} style={styles.tag}>{tag}</li>
                        ))}
                    </ul>
                </header>

                {recipe.description && <p>{recipe.description}</p>}

                <section style={styles.section}>
                    <h2 style={styles.sectionHeading}>Ingredients</h2>
                    <ol style={styles.ingredients}>
                        {recipe.ingredients.map((ingredient) => (
                            <li key={ingredient}>{ingredient}</li>
                        ))}
                    </ol>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.sectionHeading}>Instructions</h2>
                    <ol style={styles.instructions}>
                        {instructionSteps.map((instruction) => (
                            <li key={instruction}>{instruction}.</li>
                        ))}
                    </ol>
                </section>
            </main>
        </Layout>
    );
}