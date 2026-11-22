
import { useState } from "react";
import { Link } from "react-router";

const MAX_CATEGORIES = 2;
const MAX_ITEMS_PER_CATEGORY = 3;

const styles = {
    card: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "16px 20px",
        background: "#fff",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#c6cbd3",
        borderRadius: 12,
        color: "#1c2026",
        textDecoration: "none",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        minWidth: 0,
    },
    cardHover: {
        borderColor: "#8d95a3",
        boxShadow: "0 2px 8px rgb(28 32 38 / 0.06)",
    },
    heading: {
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minWidth: 0,
    },
    name: {
        margin: 0,
        fontFamily: '"Lexend", sans-serif',
        fontSize: 17.6,
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: "-0.01em",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    metadata: {
        fontSize: 13.6,
        color: "#5b6370",
    },
    summary: {
        display: "flex",
        gap: 12,
        fontSize: 13.6,
        color: "#3b424d",
    },
    categories: {
        display: "flex",
        flexDirection: "column",
        gap: 6,
        margin: 0,
        padding: 0,
        listStyle: "none",
    },
    category: {
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minWidth: 0,
    },
    categoryName: {
        fontSize: 13,
        fontWeight: 600,
        color: "#5b6370",
    },
    items: {
        fontSize: 13.6,
        color: "#3b424d",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    indicators: {
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
    },
    indicator: {
        padding: "2px 10px",
        fontSize: 12,
        fontWeight: 500,
        color: "#5b6370",
        background: "#f0f1f3",
        borderRadius: 999,
    },
    results: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        alignContent: "start",
        gap: 16,
        minHeight: 0,
        height: "100%",
        flex: 1,
        overflowY: "auto",
        paddingBottom: 16,
        paddingRight: 8,
        paddingTop: 4,
    },
};

function formatDate(date) {
    return new Date(date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function ShoppingListCard({ shoppingList, user }) {
    const [hovered, setHovered] = useState(false);

    const {
        id,
        name,
        createdAt,
        contents = {},
    } = shoppingList;

    const {
        categories = [],
        unparsed = [],
        notes = [],
    } = contents;

    const handle = user?.username ?? shoppingList.user;

    const totalItems = categories.reduce(
        (total, category) => total + category.items.length,
        0
    );

    const visibleCategories = categories.slice(0, MAX_CATEGORIES);
    const hiddenCategories = categories.length - visibleCategories.length;

    return (
        <Link
            to={`/shopping-lists/${id}`}
            style={{
                ...styles.card,
                ...(hovered && styles.cardHover),
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div style={styles.heading}>
                <h3 style={styles.name}>{name}</h3>
                <span style={styles.metadata}>
                    {formatDate(createdAt)} · @{handle}
                </span>
            </div>

            <div style={styles.summary}>
                <span>
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
                <span>
                    {categories.length} {categories.length === 1
                        ? "category"
                        : "categories"}
                </span>
            </div>

            {categories.length > 0 && (
                <ul style={styles.categories}>
                    {visibleCategories.map((category) => {
                        const visibleItems = category.items.slice(
                            0,
                            MAX_ITEMS_PER_CATEGORY
                        );

                        const hiddenItems =
                            category.items.length - visibleItems.length;

                        return (
                            <li key={category.name} style={styles.category}>
                                <span style={styles.categoryName}>
                                    {category.name}
                                </span>

                                <span style={styles.items}>
                                    {visibleItems.map((item) => item.item).join(", ")}
                                    {hiddenItems > 0 && ` +${hiddenItems} more`}
                                </span>
                            </li>
                        );
                    })}

                    {hiddenCategories > 0 && (
                        <li style={styles.metadata}>
                            +{hiddenCategories} more categories
                        </li>
                    )}
                </ul>
            )}

            {(unparsed.length > 0 || notes.length > 0) && (
                <div style={styles.indicators}>
                    {unparsed.length > 0 && (
                        <span style={styles.indicator}>
                            {unparsed.length} unparsed
                        </span>
                    )}

                    {notes.length > 0 && (
                        <span style={styles.indicator}>
                            {notes.length} {notes.length === 1 ? "note" : "notes"}
                        </span>
                    )}
                </div>
            )}
        </Link>
    );
}
