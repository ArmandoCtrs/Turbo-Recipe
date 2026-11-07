import { useState } from "react";
import { Layout } from "../components/Layout";
import { SampleSitemap } from "../utils/SampleSitemap";

export function AddRecipe() {
    const [title, setTitle] = useState("");
    const [ingredients, setIngredients] = useState("");
    const [steps, setSteps] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({ title, ingredients, steps });
        // TODO: send to your API
    };

    return (
        <Layout>
            <h1>Add Recipe</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Title
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Ingredients
                    <textarea
                        value={ingredients}
                        onChange={(e) => setIngredients(e.target.value)}
                    />
                </label>
                <label>
                    Steps
                    <textarea
                        value={steps}
                        onChange={(e) => setSteps(e.target.value)}
                    />
                </label>
                <button type="submit">Save recipe</button>
            </form>
            <SampleSitemap />
        </Layout>
    );
}
