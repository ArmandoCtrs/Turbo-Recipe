import { SampleSitemap } from "../utils/SampleSitemap";
import { useAuth } from "../auth/useAuth";
import { useRecipes } from "../api";

export function BrowseRecipes() {
    const user = useAuth().user;
    const recipes = useRecipes();
    return (
        <div>
            <h1>Browse Recipes</h1>
            <p>Welcome back, <b>{user.firstName} {user.lastName}</b>!</p>
            {
                (recipes === undefined) ? (
                    <div>Loading recipes...</div>
                ) : (
                    <div>{JSON.stringify(recipes)}</div>
                )
            }
        </div>
    );
}