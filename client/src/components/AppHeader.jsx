import { useState } from "react";
import { Logo } from "./Logo";
import { ProfileIcon } from "./ProfileIcon";
import { useAuth } from "../auth/useAuth";

export function ProfileDropdown({ user }) {
    const [open, setOpen] = useState(false);

    return (
        <div id="profile-dropdown">
            <button
                onClick={() => setOpen(!open)}
                id="profile-dropdown-button"
            >
                <ProfileIcon />
                <div id="profile-dropdown-readout">
                    <span id="profile-dropdown-name">{user.firstName} {user.lastName}</span>
                    <span id="profile-dropdown-username">@{user.username}</span>
                </div>
            </button>

            {open && (
                <div id="profile-dropdown-menu">
                    <button>Shopping List</button>
                    <button>Log Out</button>
                </div>
            )}
        </div>
    );
}

export function AppHeader() {
    const user = useAuth().user;

    return (
        <header>
            <Logo />
            <ProfileDropdown user={user} />
        </header>
    );
}