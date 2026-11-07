import { useState } from "react";
import { Layout } from "../components/Layout";

export function AddRecipe() {
    const [title, setTitle] = useState("");
    const [ingredients, setIngredients] = useState("");
    const [steps, setSteps] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({ title, ingredients, steps });
       
    };

    return (
        <Layout>
            <h1>Add Recipe</h1>
            <form onSubmit={handleSubmit}>
                <p>
                    Title
                    <input
                        style={{ display: "block" }}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </p>
                <p>
                    Ingredients
                    <textarea
                        style={{ display: "block" }}
                        value={ingredients}
                        onChange={(e) => setIngredients(e.target.value)}
                    />
                </p>
                <p>
                    Steps
                    <textarea
                        style={{ display: "block" }}
                        value={steps}
                        onChange={(e) => setSteps(e.target.value)}
                    />
                </p>
                <button type="submit">Save recipe</button>
            </form>
        </Layout>
    );
}
