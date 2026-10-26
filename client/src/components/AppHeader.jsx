import { AppIcon } from "./AppIcon";

export function AppHeader() {
    return (
        <header>
            <div id="page-title">
                <AppIcon />
                <span>Turbo Recipe</span>
            </div>
            {" – "}
            <div>({user.firstName} {user.lastName})</div>
        </header>
    );
}