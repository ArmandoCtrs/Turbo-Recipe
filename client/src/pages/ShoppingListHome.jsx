import { Layout } from "../components/Layout";
import { useAuth } from "../auth/useAuth";
import { getShoppingLists } from "../api";
import { useEffect, useState } from "react";
import { ShoppingListCard } from "../components/ShoppingListDisplay";
import { useNavigate } from "react-router";

const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 16,
    alignItems: "start",
    minHeight: 0,
    flex: 1,
    overflowY: "auto",
    paddingRight: "8px",
};

export function ShoppingListHome() {
    const [res, setRes] = useState();
    const [shoppingLists, setShoppingLists] = useState([]);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        (async () => {
            const lsts = await getShoppingLists(user.id);
            setShoppingLists(lsts);
        })();
    }, []);

    return (
        <Layout>
            <button className="create-shopping-list-navigate-button" onClick={() => {
                navigate("/shopping-lists/new");
            }}>
                + Create New Shopping List
            </button>
            <h2>My Shopping Lists</h2>
            { shoppingLists.length ? (
                <div style={gridStyle}>
                    {shoppingLists.map(lst => (
                        <ShoppingListCard key={lst.id} shoppingList={lst} />
                    ))}
                </div>
            ) : (
                <p>No lists found. Create a new one above.</p>
            )}
        </Layout>
    );
}