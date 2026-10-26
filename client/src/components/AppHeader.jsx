import { AppIcon } from "./AppIcon";
import { useAuth } from "../auth/useAuth";

export function AppHeader() {
    const user = useAuth().user;

    return (
        <header>
            <div id="page-title">
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
            <div>({user.firstName} {user.lastName})</div>
        </header>
    );
}