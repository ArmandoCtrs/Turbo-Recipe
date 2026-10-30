import { useState } from "react";
import { ProfileIcon } from "./ProfileIcon";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router";

import { AppIcon } from "./AppIcon";

export function AppLogo() {
    const navigate = useNavigate();
    
    return (
        <div id="logo" onClick={() => navigate("/")}>
            <AppIcon />
            <span id="logo-text">
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

const styles = {
    dropdown: {
        position: "relative",
        display: "inline-block",
        fontFamily: "system-ui, sans-serif",
    },
    button: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 10px",
        background: "none",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
    },
    readout: {
        display: "flex",
        flexDirection: "column",
        lineHeight: 1.25,
    },
    name: {
        fontSize: 15,
        fontWeight: 600,
        color: "#1F1B2E",
    },
    username: {
        fontSize: 13,
        color: "#6B6880",
    },
    menu: {
        position: "absolute",
        top: "100%",
        right: 0,
        minWidth: 180,
        padding: 6,
        background: "#fff",
        border: "1px solid #E4E2EA",
        borderRadius: 12,
    },
};

export function ProfileDropdown({ user }) {
    const [open, setOpen] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div style={styles.dropdown}>
            <button
                onClick={() => setOpen(!open)}
                style={styles.button}
            >
                <ProfileIcon />
                <div style={styles.readout}>
                    <span style={styles.name}>
                        {user.firstName} {user.lastName}
                    </span>
                    <span style={styles.username}>
                        @{user.username}
                    </span>
                </div>
            </button>

            {open && (
                <div style={styles.menu}>
                    <button className="menu-button" onClick={() => navigate("/shopping-list/export")}>Shopping List</button>
                    <button className="menu-button" onClick={() => logout()}>Log Out</button>
                </div>
            )}
        </div>
    );
}

export function AppHeader() {
    const user = useAuth().user;

    return (
        <header>
            <AppLogo />
            <ProfileDropdown user={user} />
        </header>
    );
}