import { useState } from "react";
import { Layout } from "../components/Layout";
import { SampleSitemap } from "../utils/SampleSitemap";


export function AddRecipe() {
    const [form, setForm] = useState<RecipeForm>({
        title: "",
        ingredients: "",
        instructions: "",
    });
    
    return (
        <Layout>
            <h1>Add Recipe</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Title
                    <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Ingredients (one per line)
                    <textarea
                        name="ingredients"
                        value={form.ingredients}
                        onChange={handleChange}
                        rows={6}
                    />
                </label>

                <label>
                    Instructions
                    <textarea
                        name="instructions"
                        value={form.instructions}
                        onChange={handleChange}
                        rows={8}
                    />
                </label>

                <button type="submit">Save Recipe</button>
            </form>

            <SampleSitemap />
        </Layout>
    );
}
