/*
We're going to use this directory to store all of our API calls.
Every time we need to talk to the backend, the server needs to call fetch("/api/...") to get the data.
But since this is cumbersome to do over and over again, instead, we'll create some easy-to-use functions in this file.
These functions will be called on the individual pages and handle all the fetching for us.
*/

import { useState, useEffect } from "react";

import SAMPLE_RECIPES from "../../../sample_data/recipes.json";

export function useRecipes() {
    const [recipes, setRecipes] = useState(null);
    useEffect(() => {
        // TODO: run the actual fetch() call: this is just a placeholder for now
        setTimeout(() => {
            setRecipes(SAMPLE_RECIPES);
        }, 500); // sample 500ms delay to simulate a fetch call
    }, []);

    return recipes;
};
