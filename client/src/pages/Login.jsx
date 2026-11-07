import { useAuth } from "../auth/useAuth";
import { useLocation, useNavigate } from "react-router";
import { SampleSitemap } from "../utils/SampleSitemap";
import { AppHeader } from "../components/AppHeader";
import { Link } from "react-router";
import { useState } from "react";
import { Navigate } from "react-router";

export function Login() {
    // this page is a SAMPLE to test the login flow
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // if we got redirected here, it stashed the original destination
    // this way we can send the user back to where they were trying to go after login
    const redirectTo = location.state?.from?.pathname || "/";

    const [loginError, setLoginError] = useState("");

    async function onSubmit(event) {
        event.preventDefault();

        // Clear any previous error
        setLoginError("");

        const formData = new FormData(event.currentTarget);

        const username = formData.get("username");
        const password = formData.get("password");

        try {
            await auth.login(username, password);

            navigate(redirectTo, { replace: true });
        } catch (error) {
            console.error("Login failed:", error);

            setLoginError(error.message || "Invalid username or password.");
        }
    }

    //To-do: redirect if already logged in, or show a message that they are already logged in
    if (auth.isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div id="container">
            <AppHeader />
            <form onSubmit={onSubmit}>
                <h1>Login</h1>
                <p>Please enter your username and password to login.</p>
                <hr />
                <label htmlFor="username">Username</label>
                <input type="text" placeholder="Enter Username" name="username" required />

                <label htmlFor="password">Password</label>
                <input type="password" placeholder="Enter Password" name="password" required />

                <label>
                    <input
                        className="rememeber-checkbox"
                        type="checkbox"
                        defaultChecked={true}
                        name="remember"
                    />{" "}
                    Remember me
                </label>

                <button type="submit">Login</button>

                <button type="reset">Cancel</button>
                {loginError && (
                    <p role="alert" style={{ color: "red" }}>
                        {loginError}
                    </p>
                )}
                <br />
                <Link to="/forgot-password">Forgot password?</Link>
                <br />
                <Link to="/register">Need to register?</Link>
            </form>
        </div>
    );
}