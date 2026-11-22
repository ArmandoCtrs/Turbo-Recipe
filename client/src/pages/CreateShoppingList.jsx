import { Layout } from "../components/Layout";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { MiniRecipeCard } from "../components/MiniRecipeCard";
import { createShoppingList } from "../api";
import { useAuth } from "../auth/useAuth";
import { useRecipes } from "../api";
import { SlidingMessage } from "../components/SlidingMessage";

const styles = {
    loadingWrap: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        minHeight: "70vh",
        textAlign: "center",
    },
    spinner: {
        width: 40,
        height: 40,
        border: "4px solid #e4e7ec",
        borderTopColor: "#2f6fed",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
    },
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

const PROGRESS_MESSAGES = [
    "Gathering your recipes...",
    "Opening each recipe card...",
    "Reading ingredient lists...",
    "Spotting the duplicates...",
    "Combining duplicate ingredients...",
    "Converting measurements...",
    "Rounding up the fractions...",
    "Grouping similar items...",
    "Sorting items by aisle...",
    "Checking the pantry staples...",
    "Crossing off the extras...",
    "Tidying up the quantities...",
    "Double-checking the math...",
    "Alphabetizing the produce...",
    "Adding the finishing touches...",
    "Almost ready to shop...",
];

function CreatingShoppingList() {
    return (
        <Layout>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={styles.loadingWrap} role="status">
                <h1 style={{ display: "inline-flex", gap: 24 }}>
                    <div style={styles.spinner} />
                    Creating your list!
                </h1>
                <p>
                    You will be redirected automatically when your list is ready. <br/> 
                    This can take up to 60 seconds, please be patient.
                    <br/><br/>
                    <SlidingMessage messages={PROGRESS_MESSAGES} interval={2500} />
                </p>
                
            </div>
        </Layout>
    );
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
    const [creating, setCreating] = useState(false);

    const navigate = useNavigate();
    const auth = useAuth();
    const recipes = useRecipes();

    if (creating) {
        return (
            <CreatingShoppingList />
        )
    }

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

    const selectContainerStyles = {
        flex: 1,
        display: "flex",
        flexDirection: "column",
    };

    if (name.length < 3) { 
        selectContainerStyles.opacity = 0.2;
        selectContainerStyles.pointerEvents = "none";
    }

    const toggleRecipeSelection = (recipeId) => {
        setSelectedRecipes((prev) =>
            prev.includes(recipeId)
                ? prev.filter((item) => item !== recipeId)
                : [...prev, recipeId]
        );
    }

    const executeCreation = async () => {
        setCreating(true);
        try {
            const response = await createShoppingList(auth.user.id, name, selectedRecipes);
            navigate(`/shopping-list/${response.id}`);
        } catch (err) {
            console.error(err);
            setCreating(false);
            alert("An error occurred while trying to create your shopping list. Please try again.");
        }
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
            <div style={selectContainerStyles}>
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
            </div>
            <button 
                disabled={(selectedRecipes.length == 0) || !name}
                className="create-shopping-list-button"
                onClick={executeCreation}
            >
                Create shopping list
                { (selectedRecipes.length) ? (
                    <> ({selectedRecipes.length} recipes) &rarr;</>
                ) : ""}
            </button>
        </Layout>
    )
}
