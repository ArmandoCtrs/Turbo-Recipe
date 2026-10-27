import { useRecipes } from "../api";

import { Layout } from "../components/Layout";
import RecipeSearchBar from "../components/RecipeSearchBar";

const styles = {
    searchRegion: {
        paddingTop: 32,
        paddingBottom: 48,
        margin: "0 auto",
        display: "flex",
        justifyContent: "center",
    }
}

export function BrowseRecipes() {
    const recipes = useRecipes();
    return (
        <Layout>
            <div style={styles.searchRegion}>
                <RecipeSearchBar onSearch={console.log} />
            </div>
            <div>
                RESULTS:
            </div>
            {
                (recipes === undefined) ? (
                    <div>Loading recipes...</div>
                ) : (
                    <div>{JSON.stringify(recipes)}</div>
                )
            }
        </Layout>
    );
}