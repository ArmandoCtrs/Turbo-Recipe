/*
We're going to use this directory to store all of our API calls.
Every time we need to talk to the backend, the server needs to call fetch("/api/...") to get the data.
But since this is cumbersome to do over and over again, instead, we'll create some easy-to-use functions in this file.
These functions will be called on the individual pages and handle all the fetching for us.
*/

import { useState, useEffect } from "react";

export function useRecipes() {
    const [recipes, setRecipes] = useState(null);

    useEffect(() => {
        let cancelled = false;

        fetch("/api/recipes")
            .then(async (response) => {
                if (!response.ok) {
                    const body = await response.json().catch(() => ({}));
                    throw new Error(body.error ?? "Unable to load recipes.");
                }
                return response.json();
            })
            .then((data) => {
                if (!cancelled) setRecipes(data);
            })
            .catch((error) => {
                console.error(error);
                if (!cancelled) setRecipes([]);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return recipes;
};

/* From Albert: Added function to fetch only a single recipe by its ID. I have it so that the 
   function throws an error if the recipe cannot be loaded, and the URL displays the recipe ID in the endpoint.
   This was also a part of the code that CoPilot generated as part of RecipeDetail's functionality. See the prompt at the top of RecipeDetail.jsx for reference. */
export async function getRecipe(recipeId) {
    const response = await fetch(`/api/recipes/${encodeURIComponent(recipeId)}`);

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Unable to load recipe.");
    }

    return response.json();
}
