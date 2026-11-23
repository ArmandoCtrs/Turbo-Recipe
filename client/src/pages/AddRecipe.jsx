import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Layout } from "../components/Layout";
import { createRecipe, deleteRecipe, getRecipe, updateRecipe } from "../api";
import { useAuth } from "../auth/useAuth";

export function AddRecipe() {
    const { recipeId } = useParams();
    const { user } = useAuth();
    const [loaded, setLoaded] = useState(null);

    useEffect(() => {
        if (!recipeId) return;
        let cancelled = false;
        getRecipe(recipeId)
            .then((recipe) => {
                if (!cancelled) setLoaded({ recipeId, recipe });
            })
            .catch((error) => {
                if (!cancelled) setLoaded({ recipeId, error: error.message });
            });
        return () => { cancelled = true; };
    }, [recipeId]);

    if (recipeId && loaded?.recipeId !== recipeId) {
        return <Layout><p>Loading recipe...</p></Layout>;
    }
    if (recipeId && (loaded.error || loaded.recipe.authorId !== user.id)) {
        return (
            <Layout>
                <p role="alert">{loaded.error || "Only the author can modify this recipe."}</p>
                <Link to={`/recipes/${recipeId}`}>Back to recipe</Link>
            </Layout>
        );
    }
    return <RecipeForm key={recipeId || "new"} recipe={recipeId ? loaded.recipe : null} />;
}

function RecipeForm({ recipe }) {
    const [title, setTitle] = useState(recipe?.name ?? "");
    const [description, setDescription] = useState(recipe?.description ?? "");
    const [ingredients, setIngredients] = useState(recipe?.ingredients.join("\n") ?? "");
    const [instructions, setInstructions] = useState(recipe?.instructions ?? "");
    const [tags, setTags] = useState(recipe?.tags.join(", ") ?? "");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSaving(true);

        try {
            const fields = {
                name: title.trim(),
                description: description.trim() || undefined,
                ingredients: ingredients
                    .split("\n")
                    .map((ingredient) => ingredient.trim())
                    .filter(Boolean),
                instructions: instructions.trim(),
                tags: tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean)
            };

            const result = recipe
                ? await updateRecipe(recipe.id, fields)
                : await createRecipe(fields);
            navigate(`/recipes/${result.id}`);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this recipe permanently? This cannot be undone.")) return;
        setError("");
        setSaving(true);
        try {
            await deleteRecipe(recipe.id);
            navigate("/recipes", { replace: true });
        } catch (requestError) {
            setError(requestError.message);
            setSaving(false);
        }
    };

    return (
        <Layout>
            <h1>{recipe ? "Modify Recipe" : "Add Recipe"}</h1>
            <form onSubmit={handleSubmit}>
                {error && <p role="alert">{error}</p>}

                <p>
                    Title
                    <input
                        style={{ display: "block" }}
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        required
                    />
                </p>
                <p>
                    Description
                    <textarea
                        style={{ display: "block" }}
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                    />
                </p>
                <p>
                    Ingredients (one per line)
                    <textarea
                        style={{ display: "block" }}
                        value={ingredients}
                        onChange={(event) => setIngredients(event.target.value)}
                        required
                    />
                </p>
                <p>
                    Instructions
                    <textarea
                        style={{ display: "block" }}
                        value={instructions}
                        onChange={(event) => setInstructions(event.target.value)}
                        required
                    />
                </p>
                <p>
                    Tags (optional, comma-separated)
                    <input
                        style={{ display: "block" }}
                        value={tags}
                        onChange={(event) => setTags(event.target.value)}
                    />
                </p>
                <button className="action-button" type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save recipe"}
                </button>
                {recipe && (
                    <button
                        type="button"
                        disabled={saving}
                        onClick={handleDelete}
                        style={{ marginLeft: 16, padding: "8px 14px", background: "#c62828", border: "1px solid #c62828", color: "#fff", cursor: "pointer" }}
                    >
                        Delete recipe
                    </button>
                )}
            </form>
        </Layout>
    );
}
