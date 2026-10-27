import { AppHeader } from "./AppHeader";

export function Layout({ children }) {
    return (
        <div id="container">
            <AppHeader />
            <div id="content">
                {children}
            </div>
        </div>
    );
}