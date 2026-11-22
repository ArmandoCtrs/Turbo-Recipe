import { useState } from "react";

const MINI_MAX_TAGS = 2;
const ACCENT = "#2f6fed";

const miniStyles = {
    card: {
        display: "flex",
        flexDirection: "column",
        gap: 4,
        width: "100%",
        padding: "10px 12px",
        background: "#fff",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#c6cbd3",
        borderRadius: 12,
        color: "#1c2026",
        font: "inherit",
        textAlign: "left",
        cursor: "pointer",
        transition:
            "border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease",
    },
    cardHover: {
        borderColor: "#8d95a3",
    },
    cardSelected: {
        borderColor: ACCENT,
        // Thickens the border visually without shifting layout
        boxShadow: `0 0 0 1px ${ACCENT}`,
        background: "#f4f8ff",
    },
    top: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    name: {
        margin: 0,
        minWidth: 0,
        fontFamily: '"Lexend", sans-serif',
        fontSize: 15,
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: "-0.01em",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    indicator: {
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 18,
        height: 18,
        borderRadius: "50%",
        borderWidth: 1.5,
        borderStyle: "solid",
        borderColor: "#c6cbd3",
        background: "#fff",
        boxSizing: "border-box",
        transition: "background 0.15s ease, border-color 0.15s ease",
    },
    indicatorSelected: {
        borderColor: ACCENT,
        background: ACCENT,
    },
    check: {
        width: 11,
        height: 11,
        opacity: 0,
        transform: "scale(0.5)",
        transition: "opacity 0.15s ease, transform 0.15s ease",
    },
    checkSelected: {
        opacity: 1,
        transform: "scale(1)",
    },
    meta: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        minWidth: 0,
    },
    author: {
        flex: "0 1 auto", // author truncates first when space runs out
        minWidth: 0,
        fontSize: 12.5,
        lineHeight: 1.4,
        color: "#5b6370",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    tags: {
        flex: "0 0 auto",
        display: "flex",
        flexWrap: "nowrap",
        gap: 4,
        marginLeft: "auto", // pushes tags to the right edge
        padding: 0,
        marginBlock: 0,
        listStyle: "none",
    },
    tag: {
        flexShrink: 0,
        padding: "0 8px",
        fontSize: 11.5,
        fontWeight: 500,
        lineHeight: 1.6,
        color: "#5b6370",
        background: "#f0f1f3",
        borderRadius: 999,
    },
    tagSelected: {
        color: ACCENT,
        background: "#e1ebff",
    },
    tagMore: {
        background: "none",
        paddingInline: 2,
    },
};

export function MiniRecipeCard({ recipe, author, selected = false, onSelect }) {
    const [hovered, setHovered] = useState(false);

    const { id, name, tags = [] } = recipe;
    const handle = author?.username ?? recipe.author;

    const visibleTags = tags.slice(0, MINI_MAX_TAGS);
    const hiddenCount = tags.length - visibleTags.length;

    return (
        <button
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect?.(id)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                ...miniStyles.card,
                ...(hovered && !selected && miniStyles.cardHover),
                ...(selected && miniStyles.cardSelected),
            }}
        >
            <div style={miniStyles.top}>
                <h3 style={miniStyles.name}>{name}</h3>

                {/* Selection indicator: a checkbox-style badge that fills in */}
                <span
                    aria-hidden="true"
                    style={{
                        ...miniStyles.indicator,
                        ...(selected && miniStyles.indicatorSelected),
                    }}
                >
                    <svg
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            ...miniStyles.check,
                            ...(selected && miniStyles.checkSelected),
                        }}
                    >
                        <polyline points="2.5,6.5 5,9 9.5,3.5" />
                    </svg>
                </span>
            </div>

            <div style={miniStyles.meta}>
                <span style={miniStyles.author}>@{handle}</span>

                {tags.length > 0 && (
                    <ul style={miniStyles.tags}>
                        {visibleTags.map((tag) => (
                            <li
                                key={tag}
                                style={{
                                    ...miniStyles.tag,
                                    ...(selected && miniStyles.tagSelected),
                                }}
                            >
                                {tag}
                            </li>
                        ))}
                        {hiddenCount > 0 && (
                            <li style={{ ...miniStyles.tag, ...miniStyles.tagMore }}>
                                +{hiddenCount}
                            </li>
                        )}
                    </ul>
                )}
            </div>
        </button>
    );
}
