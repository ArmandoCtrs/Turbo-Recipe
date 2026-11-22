import { Layout } from "../components/Layout";
import { Link } from "react-router";
import { useState } from "react";
import { MiniRecipeCard } from "../components/MiniRecipeCard";
import { useAuth } from "../auth/useAuth";
import { useRecipes } from "../api";

const styles = {
    nameField: {
        display: "inline-flex",
        gap: "12px",
        alignItems: "center",
    },
    nameInput: {
        boxSizing: "border-box",
        height: "100%",
        padding: "4px 12px",
        fontFamily: "inherit",
        flex: 1,
        margin: 0,
        border: "1px solid #6c6f71",
        borderRadius: 10,
        fontSize: "0.75em",
    },
    selectRegion: {
        flex: 1,
        minHeight: 0,
        border: "1px dashed #c6cbd3",
        borderRadius: "16px",
        padding: "0px 16px",
        display: "flex",
        flexDirection: "column",
    },
    results: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        alignContent: "start",
        gap: 8,
        minHeight: 0,
        height: "100%",
        flex: 1,
        overflowY: "auto",
        padding: "8px 2px",
    },
}

function NoFavoritedRecipes() {
    return (
        <Layout>
            <h1>Error: No Favorited Recipes</h1>
            <p>
                Creating a shopping list pulls from recipes you have added to your favorites list.
                Please add some recipes to your favorites list and try again.
            </p>
            <p>
                <Link to="/">Browse recipes to find favorites!</Link>
                <br />
                <Link to="/shopping-list">Return to all to shopping lists</Link> 
            </p>
        </Layout>
    );
}

export function CreateShoppingList() {
    const [name, setName] = useState("");
    const [selectedRecipes, setSelectedRecipes] = useState([]);

    const auth = useAuth();
    const recipes = useRecipes();

    if (!recipes) {
        return (
            <Layout>
                Loading...
            </Layout>
        )
    }
    
    if (!auth.user.favorites) {
        return (
            <NoFavoritedRecipes />
        )
    }

    const favorites = recipes.filter(recipe => {
        return auth.user.favorites.includes(recipe.id);
    });

    const toggleRecipeSelection = (recipeId) => {
        setSelectedRecipes((prev) =>
            prev.includes(recipeId)
                ? prev.filter((item) => item !== recipeId)
                : [...prev, recipeId]
        );
    }

    return (
        <Layout>
            <p>
               <Link to="/shopping-list">&larr; Back to shopping lists</Link> 
            </p>
            <h1 className="shopping-list-header" style={styles.nameField}>
                <span>1) Give your list a name:</span>
                <input 
                    style={styles.nameInput} 
                    type="text" 
                    placeholder='e.g. "Meal prep for next week"'
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
            </h1>
            <h1 className="shopping-list-header">2) Select some recipes:</h1>
            <div style={styles.selectRegion}>
                <h4>Your Favorited Recipes</h4>
                <div style={styles.results}>
                    {favorites.map((recipe) => (
                        <MiniRecipeCard 
                            key={recipe.id} 
                            recipe={recipe} 
                            author={recipe.authorUser}
                            selected={selectedRecipes.includes(recipe.id)}
                            onSelect={toggleRecipeSelection}
                        />
                    ))}
                </div>
            </div>
            <button 
                disabled={(selectedRecipes.length == 0) || !name}
                className="create-shopping-list-button"
            >
                Create shopping list
                { (selectedRecipes.length) ? (
                    <> ({selectedRecipes.length} recipes) &rarr;</>
                ) : ""}
            </button>
        </Layout>
    )
}

/*
(async () =>{
                const response = await createShoppingList(user.id, "Test Shopping List", user.favorites);
                setShoppingLists(lsts => [...lsts, response]);
            })
*/