import { useState } from "react";
import { useNavigate } from "react-router";
import { Layout } from "../components/Layout";
import { createRecipe } from "../api";

export function AddRecipe() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [ingredients, setIngredients] = useState("");
    const [instructions, setInstructions] = useState("");
    const [tags, setTags] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSaving(true);

        try {
            const recipe = await createRecipe({
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
            });

            navigate(`/recipes/${recipe.id}`);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout>
            <h1>Add Recipe</h1>
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
                <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save recipe"}
                </button>
            </form>
        </Layout>
    );
}
