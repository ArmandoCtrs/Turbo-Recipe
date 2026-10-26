import { useRecipes } from "../api";

import { AppHeader } from "../components/AppHeader";
import RecipeSearchBar from "../components/RecipeSearchBar";

export function BrowseRecipes() {
    const recipes = useRecipes();
    return (
        <div id="page-container">
            <AppHeader />
            <div id="search-container">
                <RecipeSearchBar />
            </div>
            <div id="results-container">
                {
                    (recipes === undefined) ? (
                        <div>Loading recipes...</div>
                    ) : (
                        <div>{JSON.stringify(recipes)}</div>
                    )
                }
            </div>
        </div>
    );
}