import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getFavorites, setFavorite, useRecipes } from "../api";
import { useAuth } from "../auth/useAuth";

import { Layout } from "../components/Layout";
import { RecipeSearchBar } from "../components/RecipeSearchBar";
import { RecipeSearchResults } from "../components/RecipeSearchResults";

const styles = {
    searchRegion: {
        paddingTop: 15,
        paddingBottom: 45,
        display: "flex",
        justifyContent: "center",
    },
    resultsRegion: {
        flex: 1,
        minHeight: 0,
        border: "1px dashed #c6cbd3",
        borderBottom: "none",
        borderRadius: "16px 16px 0px 0px",
        padding: "0px 16px",
        margin: "-12px 0px",
        display: "flex",
        flexDirection: "column",
    }
}

export function BrowseRecipes() {
    const recipes = useRecipes();
    const { user } = useAuth();
    const [searchResults, setSearchResults] = useState(null);
    const [favoriteState, setFavoriteState] = useState(null);
    const [pendingIds, setPendingIds] = useState(new Set());
    const focusAfterSort = useRef(null);
    const userId = user.id;
    const currentFavorites = favoriteState?.userId === userId ? favoriteState : null;

    useEffect(() => {
        let cancelled = false;
        getFavorites()
            .then((ids) => {
                if (!cancelled) setFavoriteState({ userId, ids: new Set(ids), error: "" });
            })
            .catch((error) => {
                if (!cancelled) setFavoriteState({ userId, ids: null, error: error.message });
            });
        return () => { cancelled = true; };
    }, [userId]);

    useLayoutEffect(() => {
        const button = focusAfterSort.current;
        focusAfterSort.current = null;
        if (button?.isConnected && document.activeElement === document.body) {
            button.focus({ preventScroll: true });
        }
    }, [currentFavorites?.ids]);

    async function toggleFavorite(recipeId, button) {
        if (!currentFavorites?.ids || pendingIds.has(recipeId)) return;
        const nextFavorite = !currentFavorites.ids.has(recipeId);
        setPendingIds((previous) => new Set(previous).add(recipeId));
        setFavoriteState((previous) => previous?.userId === userId ? { ...previous, error: "" } : previous);
        try {
            const favorite = await setFavorite(recipeId, nextFavorite);
            focusAfterSort.current = document.activeElement === button ? button : null;
            setFavoriteState((previous) => {
                if (previous?.userId !== userId || !previous.ids) return previous;
                const ids = new Set(previous.ids);
                if (favorite) ids.add(recipeId);
                else ids.delete(recipeId);
                return { ...previous, ids };
            });
        } catch (error) {
            setFavoriteState((previous) => previous?.userId === userId
                ? { ...previous, error: error.message }
                : previous);
        } finally {
            setPendingIds((previous) => {
                const ids = new Set(previous);
                ids.delete(recipeId);
                return ids;
            });
        }
    }

    function onSearch(data) {
        const { query, tags, author } = data;

        if (!query && tags.length === 0 && !author) {
            setSearchResults(null);
            return;
        }
        
        const results = recipes.filter((recipe) => {
            const matchesQuery = !query || recipe.name.toLowerCase().includes(query.toLowerCase());
            const matchesTags = tags.length === 0 || tags.every(tag => recipe.tags.includes(tag));
            const matchesAuthor = !author || recipe.author === author;

            return matchesQuery && matchesTags && matchesAuthor;
        });

        setSearchResults(results);
    }

    const sortedResults = searchResults && currentFavorites?.ids
        ? [...searchResults].sort((a, b) => Number(currentFavorites.ids.has(b.id)) - Number(currentFavorites.ids.has(a.id)))
        : searchResults;

    return (
        <Layout>
            <div style={styles.searchRegion}>
                <RecipeSearchBar disabled={recipes === null} onSearch={onSearch} />
            </div>
            <div style={styles.resultsRegion}>
                <h4>Results</h4>
                {!currentFavorites && <p>Loading favorites...</p>}
                {currentFavorites?.error && <p role="alert">{currentFavorites.error}</p>}
                <RecipeSearchResults
                    ready={recipes !== null}
                    results={sortedResults}
                    favorites={currentFavorites?.ids}
                    pendingIds={pendingIds}
                    onToggleFavorite={toggleFavorite}
                />
            </div>
        </Layout>
    );
}