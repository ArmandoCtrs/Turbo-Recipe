import { useAuth } from "../auth/useAuth"
import { Layout } from "../components/Layout"
import { getShoppingList } from "../api";
import { useEffect } from "react";
import { useParams, Link } from "react-router";

export function ShoppingListDetail() {
    const [list, setList] = useState(undefined);
    const auth = useAuth();
    const { shoppingListId } = useParams();
    
    useEffect(() => {
        (async () => {
            try {
                const response = await getShoppingList(
                    auth.user.id,
                    shoppingListId
                );
                setList(response)
            } catch (err) {
                setList(null);
            }            
        })()
    }, []);

    if (list === null) {
        return (
            <Layout>
                <h1>Error: Invalid Shopping List</h1>
                <p>The shopping list you requested does not exist.</p>
                <p>
                    <Link to="/shopping-lists">Return to all to shopping lists</Link> 
                </p>
            </Layout>
        )
    }

    if (list === undefined) {
        return (
            <Layout>
                Loading...
            </Layout>
        )
    }

    return (
        <Layout>
            <p>Found your shopping list!</p>
            <pre>
                <code>
                    {JSON.stringify(list, null, 2)}
                </code>
            </pre>
        </Layout>
    )
}
