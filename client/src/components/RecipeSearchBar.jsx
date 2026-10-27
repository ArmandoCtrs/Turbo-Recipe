import { useEffect, useState } from "react";

function stripPrefix(text, prefix) {
    if (text.startsWith(prefix)) {
        return text.slice(prefix.length);
    } else {
        return text;
    }
}

const styles = {
  form: { width: "100%", maxWidth: 640, fontFamily: "system-ui, sans-serif" },
  searchInput: {
    boxSizing: "border-box",
    width: "100%",
    height: 46,
    padding: "0 20px",
    border: "1px solid #cfd5d9",
    borderRadius: 13,
    background: "#f4f6f7",
    fontSize: 15,
  },
  row: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 12 },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    height: 28,
    padding: "0 6px 0 12px",
    borderRadius: 10,
    fontSize: 13,
  },
  tagChip: { background: "#e3f1e8", border: "1px solid #9cc7aa", color: "#1f5133" },
  authorChip: { background: "#e6ecfa", border: "1px solid #a5b8e6", color: "#233b80" },
  remove: {
    border: 0,
    background: "transparent",
    color: "inherit",
    fontSize: 16,
    cursor: "pointer",
  },
  addButton: {
    height: 28,
    padding: "0 14px",
    border: "1px solid #cfd5d9",
    borderRadius: 10,
    background: "#fff",
    fontSize: 13,
    cursor: "pointer",
  },
  addButtonDashed: { border: "1px dashed #a5adb2", color: "#4a5257" },
  smallInput: {
    height: 28,
    padding: "0 14px",
    border: "1px solid #2f6fed",
    borderRadius: 10,
    fontSize: 13,
  },
};

export default function RecipeSearchBar({ onSearch = () => {} }) {
  const [query, setQuery] = useState("");
  const [tags, setTags] = useState([]);
  const [author, setAuthor] = useState(null);
  const [adding, setAdding] = useState(null); // "tag", "author", or null
  const [draft, setDraft] = useState("");

  const hasFilters = tags.length > 0 || author !== null;

  function search(next = {}) {
    onSearch({ query, tags, author, ...next });
  }

  function addTag(text) {
    const tag = stripPrefix(text.trim().toLowerCase(), "#");
    if (tag && !tags.includes(tag)) {
      const nextTags = [...tags, tag];
      setTags(nextTags);
      search({ tags: nextTags });
    }
  }

  function setAuthorFromText(text) {
    const name = stripPrefix(text.trim(), "@");
    if (name) {
      setAuthor(name);
      search({ author: name });
    }
  }

  function removeTag(tag) {
    const nextTags = tags.filter((t) => t !== tag);
    setTags(nextTags);
    search({ tags: nextTags });
  }

  function removeAuthor() {
    setAuthor(null);
    search({ author: null });
  }

  function handleDraftKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      if (adding === "tag") addTag(draft);
      else setAuthorFromText(draft);
      setAdding(null);
      setDraft("");
    } else if (event.key === "Escape") {
      setAdding(null);
      setDraft("");
    }
  }

  function startAdding(type) {
    setAdding(type);
    setDraft("");
  }

  useEffect(() => {
    // debounce effect for searching through the query bar
    if (query.endsWith(" ")) return;

    const timeout = setTimeout(() => {
        search();
    }, 500);

    return () => clearTimeout(timeout);
}, [query]);

  const buttonStyle = hasFilters
    ? { ...styles.addButton, ...styles.addButtonDashed }
    : styles.addButton;

  return (
    <form
      style={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        search();
      }}
    >
      <input
        style={styles.searchInput}
        type="search"
        placeholder="Search recipes..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div style={styles.row}>
        {tags.map((tag) => (
          <span key={tag} style={{ ...styles.chip, ...styles.tagChip }}>
            #{tag}
            <button
              type="button"
              style={styles.remove}
              aria-label={`Remove tag ${tag}`}
              onClick={() => removeTag(tag)}
            >
              &times;
            </button>
          </span>
        ))}

        {author && (
          <span style={{ ...styles.chip, ...styles.authorChip }}>
            by @{author}
            <button
              type="button"
              style={styles.remove}
              aria-label={`Remove author ${author}`}
              onClick={removeAuthor}
            >
              &times;
            </button>
          </span>
        )}

        {adding ? (
          <input
            style={styles.smallInput}
            autoFocus
            value={draft}
            placeholder={adding === "tag" ? "Type a tag" : "Type author's username"}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleDraftKeyDown}
            onBlur={() => setAdding(null)}
          />
        ) : (
          <>
            <button type="button" style={buttonStyle} onClick={() => startAdding("tag")}>
              + {hasFilters ? "Tag" : "Add tag"}
            </button>
            {/* Only one author allowed, so hide the button once one is set */}
            {!author && (
              <button type="button" style={buttonStyle} onClick={() => startAdding("author")}>
                + {hasFilters ? "Author" : "Add author"}
              </button>
            )}
          </>
        )}
      </div>
    </form>
  );
}