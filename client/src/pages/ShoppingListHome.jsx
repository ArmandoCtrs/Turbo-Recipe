import { Layout } from "../components/Layout";
import { useAuth } from "../auth/useAuth";
import { createShoppingList, getShoppingLists } from "../api";
import { useEffect, useState } from "react";
import { ShoppingListCard } from "../components/ShoppingListDisplay";

export function ShoppingListHome() {
    const [res, setRes] = useState();
    const [shoppingLists, setShoppingLists] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        (async () => {
            const lsts = await getShoppingLists(user.id);
            console.log(lsts);
            setShoppingLists(lsts);
        })();
    }, []);

    return (
        <Layout>
            <button onClick={(async () =>{
                const response = await createShoppingList(user.id, "Test Shopping List", user.favorites);
                setShoppingLists(lsts => [...lsts, response]);
            })}>
                Create shopping list
            </button>
            <h2>My Shopping Lists</h2>
            <div>
                { shoppingLists.length ? (
                    shoppingLists.map(lst => (
                        <ShoppingListCard shoppingList={lst} user={user} />
                    ))
                ) : (
                    "No lists found. Create a new one above."
                )}
            </div>
        </Layout>
    );
}