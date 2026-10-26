import { AppIcon } from "./AppIcon";

export function Logo() {
    return (
        <div className="logo">
            <AppIcon />
            <span>
                <span style={{ color: "#1F1B2E" }}>
                    Turbo&nbsp;
                </span>
                <span style={{ color: "#FF6B2C" }}>
                    Recipe
                </span>
            </span>
        </div>
    );
}
