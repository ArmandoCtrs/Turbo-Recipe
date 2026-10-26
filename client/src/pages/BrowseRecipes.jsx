import { SampleSitemap } from "../utils/SampleSitemap";
import { useAuth } from "../auth/useAuth";
import { useRecipes } from "../api";

export function BrowseRecipes() {
    const user = useAuth().user;
    const recipes = useRecipes();
    return (
        <div id="page-container">
            <header>
                <div id="page-title">
                    <span>(icon) </span>
                    <span>Turbo Recipe</span>
                </div>
                {" – "}
                <div>Logged in as  <b>{user.firstName} {user.lastName}</b></div>
            </header>
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