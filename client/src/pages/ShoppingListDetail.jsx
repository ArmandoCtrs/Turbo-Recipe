import { useAuth } from "../auth/useAuth"
import { Layout } from "../components/Layout"
import { getShoppingList } from "../api";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";

const styles = {
    page: {
        width: "100%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 16,
    },
    headerMeta: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 2,
        flexShrink: 0,
        textAlign: "right",
    },
    created: {
        fontSize: 13,
        color: "#5b6370",
    },
    listContainer: {
        flex: 1,
        minHeight: 0, // lets a flex child shrink below its content height
        overflowY: "auto",
        paddingRight: "16px",
    },
    columns: {
        columnWidth: 320, // as many columns as fit at this minimum width
        columnGap: 40,
    },
    category: {
        breakInside: "avoid", // keeps a category from splitting across columns
    },
    title: {
        margin: "0 0 8px",
    },
    divider: {
        margin: "0.5rem 0"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: 15,
    },
    categoryCell: {
        padding: "18px 0 2px",
        textAlign: "left",
        fontSize: 12,
        fontWeight: "bold",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "#5b6370",
        borderBottom: "1px solid #c6cbd3",
    },
    itemCell: {
        padding: "2px 0",
        borderBottom: "1px solid #eef0f2",
    },
    quantityCell: {
        padding: "2px 0 6px 16px",
        borderBottom: "1px solid #eef0f2",
        textAlign: "right",
        whiteSpace: "nowrap",
        color: "#5b6370",
        fontVariantNumeric: "tabular-nums",
    },
    section: {
        marginTop: 24,
        fontSize: 14,
        color: "#3b424d",
    },
    summary: {
        cursor: "pointer",
        fontWeight: 600,
        color: "#5b6370",
    },
    sectionList: {
        margin: "8px 0 0",
        paddingLeft: 20,
        lineHeight: 1.5,
    },
};

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const formatCreated = (ms) => new Date(ms).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

// Prefix "~" for approximate items, unless the quantity already has one
function formatQuantity({ quantity, approximate }) {
    return approximate && !quantity.startsWith("~") ? `~${quantity}` : quantity;
}

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

    const { categories = [], unparsed = [], notes = [] } = list.contents ?? {};

    console.log(JSON.stringify(list));
    return (
        <Layout>
            <div style={styles.page}>
                <div style={styles.header}>
                    <h1 style={styles.title}>"{list.name}"</h1>
                    <div style={styles.headerMeta}>
                        <Link to="/shopping-lists">&larr; Back to all shopping lists</Link>
                        {list.createdAt && (
                            <span style={styles.created}>
                                Created {formatCreated(list.createdAt)}
                            </span>
                        )}
                    </div>
                </div>
                <hr style={styles.divider} />
                <div style={styles.listContainer}>
                    <div style={styles.columns}>
                        {categories
                            .filter((category) => category.items.length > 0)
                            .map((category) => (
                                <div key={category.name} style={styles.category}>
                                    <table style={styles.table}>
                                        <tbody>
                                            <tr>
                                                <th colSpan={2} scope="colgroup" style={styles.categoryCell}>
                                                    {category.name}
                                                </th>
                                            </tr>
                                            {category.items.map((item) => (
                                                <tr key={item.item}>
                                                    <td style={styles.itemCell}>{capitalize(item.item)}</td>
                                                    <td style={styles.quantityCell}>{formatQuantity(item)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                    </div>

                    {unparsed.length > 0 && (
                        <div style={styles.section}>
                            <strong>Couldn't read these:</strong>
                            <ul style={styles.sectionList}>
                                {unparsed.map((line) => (
                                    <li key={line}>{line}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {notes.length > 0 && (
                        <details style={styles.section}>
                            <summary style={styles.summary}>Notes ({notes.length})</summary>
                            <ul style={styles.sectionList}>
                                {notes.map((note) => (
                                    <li key={note}>{note}</li>
                                ))}
                            </ul>
                        </details>
                    )}
                </div>
            </div>
        </Layout>
    );
}
