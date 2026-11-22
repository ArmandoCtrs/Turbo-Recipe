import { Layout } from "../components/Layout";
import { useAuth } from "../auth/useAuth";
import { getShoppingLists } from "../api";
import { useEffect, useState } from "react";
import { ShoppingListCard } from "../components/ShoppingListDisplay";
import { useNavigate } from "react-router";

export function ShoppingListHome() {
    const [res, setRes] = useState();
    const [shoppingLists, setShoppingLists] = useState([]);
    const navigate = useNavigate();
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
            <button className="create-shopping-list-navigate-button" onClick={() => {
                navigate("/shopping-list/new");
            }}>
                + Create New Shopping List
            </button>
            <h2>My Shopping Lists</h2>
            <div>
                { shoppingLists.length ? (
                    shoppingLists.map(lst => (
                        <ShoppingListCard key={lst.id} shoppingList={lst} user={user} />
                    ))
                ) : (
                    "No lists found. Create a new one above."
                )}
            </div>
        </Layout>
    );
}