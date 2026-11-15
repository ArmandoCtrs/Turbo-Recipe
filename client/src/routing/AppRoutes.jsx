import { useEffect } from "react";
import { Route, Routes } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";

import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { BrowseRecipes } from "../pages/BrowseRecipes";
import { RecipeDetail } from "../pages/RecipeDetail";
import { AddRecipe } from "../pages/AddRecipe";
import { ShoppingListHome } from "../pages/ShoppingListHome";
import { NotFound } from "../pages/NotFound";
import { useAuth } from "../auth/useAuth";
import { CreateShoppingList } from "../pages/CreateShoppingList";
import { ShoppingListDetail } from "../pages/ShoppingListDetail";

/**
 * Route map:
 *  - /login is the only public route.
 *  - Everything else sits under <ProtectedRoute>, which redirects to
 *    /login if there's no authenticated user, and otherwise renders
 *    <Layout> (shared nav) wrapping the actual page via nested routes.
 *
 * To add a new page that requires login, just add a <Route> inside the
 * <Layout> block below — you get the auth check for free.
 */
export function AppRoutes() {
    const auth = useAuth();
    
    //useEffect(() => {
    //    // FOR TESTING ONLY:
    //    // every time the page refreshes, log out the user so we can test the login flow
    //    auth.logout();
    //}, []);

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<BrowseRecipes />} />
                <Route path="/recipes" element={<BrowseRecipes />} />
                <Route path="/recipes/new" element={<AddRecipe />} />
                <Route path="/recipes/:recipeId" element={<RecipeDetail />} />
                <Route path="/recipes/:recipeId/edit" element={<AddRecipe />} />
                <Route path="/shopping-list" element={<ShoppingListHome />} />
                <Route path="/shopping-list/new" element={<CreateShoppingList />} />
                <Route path="/shopping-list/:shoppingListId" element={<ShoppingListDetail />} />
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}