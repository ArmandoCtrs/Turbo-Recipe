import { Layout } from "../components/Layout";
import { Link } from "react-router";
import { useState } from "react";
import { RecipeSelector } from "../components/RecipeSelector";

const styles = {
    nameField: {
        display: "inline-flex",
        gap: "16px",
        alignItems: "center",
    },
    nameInput: {
        boxSizing: "border-box",
        height: "100%",
        padding: "0 16px",
        fontFamily: "inherit",
        flex: 1,
        margin: 0,
        border: "1px solid #6c6f71",
        borderRadius: 10,
        fontSize: 18,
    }
}

export function CreateShoppingList() {
    const [name, setName] = useState("");
    const [recipes, setRecipes] = useState([]);
    return (
        <Layout>
            <p>
               <Link to="/shopping-list" style={styles.backLink}>&larr; Back to shopping lists</Link> 
            </p>
            <h1 className="shopping-list-header" style={styles.nameField}>
                <span>1) Give your list a name:</span>
                <input 
                    style={styles.nameInput} 
                    type="text" 
                    placeholder="e.g. Sunday Meal Prep" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
            </h1>
            <h1 className="shopping-list-header">2) Select some recipes:</h1>
            <RecipeSelector />
            <button>Create shopping list with <code>n</code> recipes &rarr;</button>
        </Layout>
    )
}

/*
(async () =>{
                const response = await createShoppingList(user.id, "Test Shopping List", user.favorites);
                setShoppingLists(lsts => [...lsts, response]);
            })
*/