import { useAuth } from "../auth/useAuth";
import { useRecipes } from "../api";

import { AppHeader } from "../components/AppHeader";

export function BrowseRecipes() {
    const user = useAuth().user;
    const recipes = useRecipes();
    return (
        <div id="page-container">
            <AppHeader />
            <div id="search-container">

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