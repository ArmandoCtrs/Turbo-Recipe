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
    itemRow: {
        cursor: "pointer",
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

    // Item detail panel
    panel: {
        maxWidth: 560,
        margin: "0 auto",
    },
    backButton: {
        font: "inherit",
        fontSize: 14,
        padding: "4px 0",
        margin: "0 0 12px",
        background: "none",
        border: "none",
        color: "#2457c5",
        cursor: "pointer",
    },
    panelHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 16,
        borderBottom: "1px solid #c6cbd3",
        paddingBottom: 8,
    },
    panelName: {
        margin: 0,
        fontSize: 22,
        paddingBottom: 0,
        border: 0, // clear some default styles
    },
    panelQuantity: {
        fontSize: 18,
        color: "#5b6370",
        whiteSpace: "nowrap",
        fontVariantNumeric: "tabular-nums",
    },
    panelCategory: {
        margin: "6px 0 0",
        fontSize: 13,
        color: "#5b6370",
    },
    sourcesHeading: {
        margin: "20px 0 4px",
        fontSize: 14,
        fontWeight: 600,
        color: "#5b6370",
    },
    sourceList: {
        listStyle: "none",
        margin: 0,
        padding: 0,
    },
    sourceItem: {
        padding: "8px 0",
        borderBottom: "1px solid #eef0f2",
    },
    sourceRecipe: {
        fontWeight: 600,
    },
    sourceIngredient: {
        fontSize: 14,
        color: "#3b424d",
        marginTop: 2,
    },
    emptySources: {
        fontSize: 14,
        color: "#5b6370",
    },
    ingredientList: {
        listStyle: "none",
        margin: 0,
        padding: 0,
    },
};

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const formatCreated = (ms) => new Date(ms).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

// Prefix "~" for approximate items, unless the quantity already has one
function formatQuantity({ quantity, approximate }) {
    return approximate && !quantity.startsWith("~") ? `~${quantity}` : quantity;
}

// Groups an item's sources by recipe, in the order each recipe first appears.
function groupByRecipe(sources) {
    const groups = new Map();
    for (const s of sources) {
        if (!groups.has(s.recipeId)) {
            groups.set(s.recipeId, { recipeId: s.recipeId, recipeName: s.recipeName, lines: [] });
        }
        groups.get(s.recipeId).lines.push(s);
    }
    for (const g of groups.values()) g.lines.sort((a, b) => a.index - b.index);
    return [...groups.values()];
}

function ItemDetail({ category, item, onBack }) {
    const groups = groupByRecipe(item.sources ?? []);

    return (
        <div style={styles.panel}>
            <button type="button" style={styles.backButton} onClick={onBack}>
                &larr; Back to shopping list
            </button>
            <div style={styles.panelHeader}>
                <h2 style={styles.panelName}>{capitalize(item.item)}</h2>
                <span style={styles.panelQuantity}>{formatQuantity(item)}</span>
            </div>
            <p style={styles.panelCategory}>{category}</p>

            <h3 style={styles.sourcesHeading}>Used in</h3>
            {groups.length === 0 ? (
                <p style={styles.emptySources}>No source recipes were recorded for this item.</p>
            ) : (
                <ul style={styles.sourceList}>
                    {groups.map((group) => (
                        <li key={group.recipeId} style={styles.sourceItem}>
                            <div style={styles.sourceRecipe}>
                                <Link 
                                    to={`/recipes/${group.recipeId}`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                >
                                    {group.recipeName}
                                </Link>
                            </div>
                            <ul style={styles.ingredientList}>
                                {group.lines.map((line) => (
                                    <li key={line.id} style={styles.sourceIngredient}>
                                        {line.text}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export function ShoppingListDetail() {
    const [list, setList] = useState(undefined);
    const [selected, setSelected] = useState(null); // { category, item }
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

    const { categories = [], unparsed = [], unsorted = [], notes = [] } = list.contents ?? {};
    const unplaced = [...unparsed, ...unsorted];

    const selectItem = (category, item) => setSelected({ category, item });
    const handleRowKeyDown = (e, category, item) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            selectItem(category, item);
        }
    };

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
                    {selected ? (
                        <ItemDetail
                            category={selected.category}
                            item={selected.item}
                            onBack={() => setSelected(null)}
                        />
                    ) : (
                        <>
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
                                                        <tr
                                                            key={item.item}
                                                            style={styles.itemRow}
                                                            role="button"
                                                            tabIndex={0}
                                                            onClick={() => selectItem(category.name, item)}
                                                            onKeyDown={(e) => handleRowKeyDown(e, category.name, item)}
                                                        >
                                                            <td style={styles.itemCell}>{capitalize(item.item)}</td>
                                                            <td style={styles.quantityCell}>{formatQuantity(item)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ))}
                            </div>

                            {unplaced.length > 0 && (
                                <div style={styles.section}>
                                    <strong>Couldn't read these:</strong>
                                    <ul style={styles.sectionList}>
                                        {unplaced.map((src) => (
                                            <li key={src.id}>
                                                {src.text} <span style={styles.created}>({src.recipeName})</span>
                                            </li>
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
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}