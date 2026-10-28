import { useState } from "react";
import { useRecipes } from "../api";

import { Layout } from "../components/Layout";
import { RecipeSearchBar } from "../components/RecipeSearchBar";
import { RecipeSearchResults } from "../components/RecipeSearchResults";

const styles = {
    searchRegion: {
        paddingTop: 0,
        paddingBottom: 30,
        display: "flex",
        justifyContent: "center",
    },
    resultsRegion: {
        flex: 1,
        border: "1px dashed #c6cbd3",
        borderRadius: "16px",
        padding: "0px 16px",
    }
}

export function BrowseRecipes() {
    const recipes = useRecipes();
    const [searchResults, setSearchResults] = useState(null);

    function onSearch(data) {
        // placeholder for now
        setSearchResults(recipes);
        console.log(data);
    }

    return (
        <Layout>
            <div style={styles.searchRegion}>
                <RecipeSearchBar disabled={recipes === null} onSearch={onSearch} />
            </div>
            <div style={styles.resultsRegion}>
                <h4>Results</h4>
                <RecipeSearchResults ready={recipes !== null} results={searchResults} />
            </div>
        </Layout>
    );
}