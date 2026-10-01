// I made this just to demonstrate that the protected routes are working.
// Let's remove this at some point.

import { Link } from "react-router";

export function SampleSitemap() {
    return (
        <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/recipes">Browse Recipes</Link></li>
            <li><Link to="/recipes/new">Add Recipe</Link></li>
            <li><Link to="/recipes/1">Recipe Detail (id=1)</Link></li>
            <li><Link to="/recipes/1/edit">Edit Recipe (id=1)</Link></li>
            <li><Link to="/shopping-list/export">Export Shopping List</Link></li>
        </ul>
    );
}

/*
<Route path="/" element={<BrowseRecipes />} />
                <Route path="/recipes" element={<BrowseRecipes />} />
                <Route path="/recipes/new" element={<AddRecipe />} />
                <Route path="/recipes/:recipeId" element={<RecipeDetail />} />
                <Route path="/recipes/:recipeId/edit" element={<AddRecipe />} />
                <Route path="/shopping-list/export" element={<ExportShoppingList />} />

*/