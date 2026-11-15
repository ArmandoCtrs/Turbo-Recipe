import { Layout } from "../components/Layout";
import { useAuth } from "../auth/useAuth";
import { createShoppingList } from "../api";
import { useState } from "react";

export function ExportShoppingList() {
    const [res, setRes] = useState();
    const { user } = useAuth();
    return (
        <Layout>
            <button onClick={(async () =>{
                const response = await createShoppingList(user.id, "Test Shopping List", user.favorites);
                setRes(response);
            })}>
                Create shopping list
            </button>
            <p>
                Favorites: {user.favorites}
            </p>
            <p>Response:</p>
            <pre>
                {JSON.stringify(res)}
            </pre>
        </Layout>
    );
}