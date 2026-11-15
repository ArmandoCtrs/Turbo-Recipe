/*
We're going to use this directory to store all of our API calls.
Every time we need to talk to the backend, the server needs to call fetch("/api/...") to get the data.
But since this is cumbersome to do over and over again, instead, we'll create some easy-to-use functions in this file.
These functions will be called on the individual pages and handle all the fetching for us.
*/

import { useState, useEffect } from "react";

import SAMPLE_RECIPES from "../../../sample_data/recipes.json";

// catch errors
async function handleResponse(response, fallbackMessage) {
    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const err = new Error(body.message ?? fallbackMessage);
        err.status = response.status;
        throw err;
    }
    return response.json();
}


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

/* From Albert: Added function to fetch only a single recipe by its ID. I have it so that the 
   function throws an error if the recipe cannot be loaded, and the URL displays the recipe ID in the endpoint.
   This was also a part of the code that CoPilot generated as part of RecipeDetail's functionality. See the prompt at the top of RecipeDetail.jsx for reference. */
export async function getRecipe(recipeId) {
    const response = await fetch(`/api/recipes/${encodeURIComponent(recipeId)}`);
    return handleResponse(response, "Unable to load recipe");
}

const listsUrl = (userId) => `/api/users/${encodeURIComponent(userId)}/shopping-list`;


// Create a new shopping list from an array of recipe objects (the same objects
// returned by useRecipes() / getRecipe()).
export async function createShoppingList(userId, name, recipeIds) {
    const response = await fetch(`${listsUrl(userId)}/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, recipes: recipeIds }),
    });
    return handleResponse(response, "Unable to create shopping list.");
}

// Get all of a user's shopping lists.
export async function getShoppingLists(userId) {
    const response = await fetch(listsUrl(userId));
    return handleResponse(response, "Unable to load shopping lists.");
}

// Get one shopping list by id.
export async function getShoppingList(userId, listId) {
    const response = await fetch(`${listsUrl(userId)}/${encodeURIComponent(listId)}`);
    return handleResponse(response, "Unable to load shopping list.");
}

// Delete a shopping list. Resolves to { message: "Success" }.
export async function deleteShoppingList(userId, listId) {
    const response = await fetch(`${listsUrl(userId)}/${encodeURIComponent(listId)}`, {
        method: "DELETE",
    });
    return handleResponse(response, "Unable to delete shopping list.");
}
