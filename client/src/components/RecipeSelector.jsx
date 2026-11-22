const styles = {
    root: {
        flex: 1,
        minHeight: 0,
        border: "1px dashed #c6cbd3",
        borderRadius: "16px",
        padding: "0px 16px",
        display: "flex",
        flexDirection: "column",
    }
}

export function RecipeSelector() {
    return (
        <div style={styles.root}>
            <h4>Your Favorite Recipes</h4>
            <p>This is where your favorite recipes will be listed.</p>
        </div>
    )
}
