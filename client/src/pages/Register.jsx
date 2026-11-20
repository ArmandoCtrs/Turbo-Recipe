import { useAuth } from "../auth/useAuth";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { AppHeader } from "../components/AppHeader";
import { Link, Navigate } from "react-router";

export function Register() {
    // this page is a SAMPLE to test the registration flow
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [registrationError, setRegistrationError] = useState("");

    // if we got redirected here, it stashed the original destination
    // this way we can send the user back to where they were trying to go after login
    const redirectTo = location.state?.from?.pathname || "/";

    async function onSubmit(event) {
        event.preventDefault();
        setRegistrationError("");
        const formData = new FormData(event.currentTarget);

        const username = formData.get("username");
        const email = formData.get("email");
        const password = formData.get("password");
        const passwordRepeat = formData.get("password-repeat");
        const firstName = formData.get("firstName");
        const lastName = formData.get("lastName");

        if (password !== passwordRepeat) {
            setRegistrationError("Passwords do not match.");
            return;
        }

        try {
            await auth.register({
                username,
                email,
                password,
                firstName,
                lastName
            });

            navigate(redirectTo, { replace: true });
        } catch (error) {
            console.error("Registration failed:", error);
            setRegistrationError(error.message || "Unable to register.");
        }
    };

    if (auth.isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div id="container">
            <AppHeader />
            <form onSubmit={onSubmit}>
                <div>
                    <h1>Sign Up</h1>
                    <p>Please fill in this form to create an account.</p>
                    <hr />
                    <label htmlFor="username">Username</label>
                    <input type="text" placeholder="Enter Username" name="username" required />

                    <label htmlFor="firstName">First name</label>
                    <input type="text" placeholder="Enter First Name" name="firstName" required />

                    <label htmlFor="lastName">Last name</label>
                    <input type="text" placeholder="Enter Last Name" name="lastName" required />

                    <label htmlFor="email">Email</label>
                    <input type="email" placeholder="Enter Email" name="email" required />
                    
                    <label htmlFor="password">Password</label>
                    <input type="password" placeholder="Enter Password" name="password" required />

                    <label htmlFor="password-repeat">Repeat Password</label>
                    <input type="password" placeholder="Repeat Password" name="password-repeat" required/>
                    
                    <button type="submit">Sign Up</button>
                    
                    <label>
                    <input
                        type="checkbox"
                        defaultChecked={true}
                        name="remember"
                    />{" "}
                    Remember me
                    </label>
                    <p>
                        By creating an account you agree to our{" "}
                        <a href="#" style={{ color: "dodgerblue" }}>Terms &amp; Privacy</a>.
                    </p>

                    <button type="reset">Cancel</button>
                    <br />
                    <Link to="/login">Already have an account? Login here</Link>
                    {registrationError && (
                        <p role="alert" style={{ color: "red" }}>
                            {registrationError}
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
}