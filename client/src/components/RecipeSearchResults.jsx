import { Link } from "react-router";

const MAX_TAGS = 3;

const styles = {
    card: {
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "16px 20px",
        background: "#fff",
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius: 12,
        color: "#1c2026",
        textDecoration: "none",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    },
    cardLink: {
        position: "absolute",
        inset: 0,
        zIndex: 1,
        borderRadius: 12,
    },
    heading: {
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minWidth: 0, // lets children truncate inside flex
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
    author: {
        fontSize: 13.6,
        color: "#5b6370",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    authorRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        minWidth: 0,
    },
    text: {
        margin: 0,
        fontSize: 15,
        lineHeight: 1.5,
        color: "#3b424d",
        display: "-webkit-box",
        WebkitBoxOrient: "vertical",
        WebkitLineClamp: 2,
        lineClamp: 2,
        overflow: "hidden",
    },
    tags: {
        display: "flex",
        flexWrap: "nowrap",
        gap: 6,
        margin: 0,
        padding: 0,
        listStyle: "none",
        overflow: "hidden",
    },
    tag: {
        flexShrink: 0,
        padding: "2px 10px",
        fontSize: 12,
        fontWeight: 500,
        color: "#5b6370",
        background: "#f0f1f3",
        borderRadius: 999,
    },
    tagMore: {
        background: "none",
        paddingInline: 4,
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
        paddingTop: 4
    },
};

export function RecipeCard({ recipe, author, favorite, disabled, pending, onToggleFavorite }) {
    const { id, name, tags = [], description, instructions } = recipe;

    // `author` is the resolved user object; fall back to the raw id
    const handle = author?.username ?? recipe.author;

    const visibleTags = tags.slice(0, MAX_TAGS);
    const hiddenCount = tags.length - visibleTags.length;

    return (
        <article className="recipe-card" style={styles.card}>
            <Link to={`/recipes/${id}`} aria-label={`View ${name}`} style={styles.cardLink} />
            <div style={styles.heading}>
                <h3 style={styles.name}>{name}</h3>
                <div style={styles.authorRow}>
                    <span style={styles.author}>@{handle}</span>
                    <button
                        type="button"
                        className="card-favorite"
                        aria-label={`${favorite ? "Unfavorite" : "Favorite"} ${name}`}
                        aria-pressed={favorite}
                        disabled={disabled}
                        aria-disabled={disabled || pending}
                        onClick={(event) => onToggleFavorite(id, event.currentTarget)}
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                            <path d="M12 21s-8.5-5.3-8.5-11.1a4.6 4.6 0 0 1 8.5-2.4 4.6 4.6 0 0 1 8.5 2.4C20.5 15.7 12 21 12 21Z" />
                        </svg>
                    </button>
                </div>
            </div>

            <p style={styles.text}>{description ?? instructions}</p>

            {tags.length > 0 && (
                <ul style={styles.tags}>
                    {visibleTags.map((tag) => (
                        <li key={tag} style={styles.tag}>{tag}</li>
                    ))}
                    {hiddenCount > 0 && (
                        <li style={{ ...styles.tag, ...styles.tagMore }}>
                            +{hiddenCount}
                        </li>
                    )}
                </ul>
            )}
        </article>
    );
}

export function RecipeSearchResults({ ready, results, favorites, pendingIds, onToggleFavorite }) {
    if (!ready) {
        return <p>Loading...</p>;
    } else if (results === null) {
        return <p>Search for your favorite recipes using the search bar above.</p>
    } else if (results.length === 0) {
        return (
            <div>
                <p>No results found. Try adjusting your search query and filters.</p>
            </div>
        )
    } else {
        return (
            <div style={styles.results}>
                {results.map((recipe) => (
                    <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        author={recipe.authorUser}
                        favorite={favorites?.has(recipe.id) ?? false}
                        disabled={!favorites}
                        pending={pendingIds.has(recipe.id)}
                        onToggleFavorite={onToggleFavorite}
                    />
                ))}
            </div>
        )
    }
}
