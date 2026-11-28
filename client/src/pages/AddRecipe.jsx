import { useState } from "react";
import { useParams } from "react-router";
import { Layout } from "../components/Layout";

const label = { display: "block", marginBottom: "1.25rem" };

const sampleRecipe = {
    title: "Weeknight Chili",
    ingredients: "Beans\nTomatoes\nOnion",
    steps: "Chop the onion\nSimmer for 30 minutes",
};

export function AddRecipe() {
    const { id } = useParams();
    const isEditing = Boolean(id);
    
    const [title, setTitle] = useState(isEditing ? sampleRecipe.title : "");
    const [ingredients, setIngredients] = useState(isEditing ? sampleRecipe.ingredients : "");
    const [instructions, setInstructions] = useState(isEditing ? sampleRecipe.instructions : "");

    const handleSubmit = (e) => {
         if (isEditing) {
            console.log("Update recipe", { id, title, ingredients, instructions });
        } else {
            console.log("Create recipe", { title, ingredients, instructions });
        }
    };

    return (
        <Layout>
            <h1>{isEditing ? "Edit Recipe" : "Add Recipe"}</h1>
            <form onSubmit={handleSubmit}>
                 <label style={label}>
                    Title
                    <br />
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </label>
                <label style={label}>
                    Ingredients
                    <br />
                    <textarea
                        value={ingredients}
                        onChange={(e) => setIngredients(e.target.value)}
                    />
                </label>
                <label style={label}>
                    Steps
                    <br />
                    <textarea
                        value={steps}
                        onChange={(e) => setSInstructions(e.target.value)}
                    />
                </label>
                <button type="submit">
                    {isEditing ? "Save changes" : "Save recipe"}
                </button>
            </form>
        </Layout>
    );
}
