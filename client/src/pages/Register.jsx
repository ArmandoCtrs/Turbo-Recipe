import { useAuth } from "../auth/useAuth";
import { useLocation, useNavigate } from "react-router";
import { SampleSitemap } from "../utils/SampleSitemap";
import { AppHeader } from "../components/AppHeader";
import { Link } from "react-router";
import { useState } from "react";

export function Register() {
    // this page is a SAMPLE to test the registration flow
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // if we got redirected here, it stashed the original destination
    // this way we can send the user back to where they were trying to go after login
    const redirectTo = location.state?.from?.pathname || "/";

    const [loginError, setLoginError] = useState("");

    async function onSubmit(event) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        const username = formData.get("username");
        const firstName = formData.get("firstName");
        const lastName = formData.get("lastName");
        const password = formData.get("password");
        const passwordVerify = formData.get("password-verify");
        const email = formData.get("email");


        try {
            await auth.register(username, firstName, lastName, password, passwordVerify, email);

            navigate(redirectTo, { replace: true });
        } catch (error) {
            console.error("Registration failed:", error);

            setLoginError(error.message || "Invalid username or password.");
        }
    };

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

                    <label htmlFor="firstName">First Name</label>
                    <input type="text" placeholder="Enter Your First Name" name="firstName" required />

                    <label htmlFor="lastName">Last Name</label>
                    <input type="text" placeholder="Enter Your Last Name" name="lastName" required />

                    <label htmlFor="email">Email</label>
                    <input type="text" placeholder="Enter Email" name="email" required />
                    
                    <label htmlFor="password">Password</label>
                    <input type="password" placeholder="Enter Password" name="password" required />

                    <label htmlFor="password-verify">Repeat Password</label>
                    <input type="password" placeholder="Repeat Password" name="password-verify" required/>
                    
                    <label>
                        <input
                            type="checkbox"
                            defaultChecked={true}
                            name="remember"
                        />{" "}
                        Remember me
                    </label>

                    <button type="submit">Sign Up</button>
                    <button type="reset">Cancel</button>

                    {loginError && (
                        <p role="alert" style={{ color: "red" }}>
                            {loginError}
                        </p>
                    )}

                    <p>
                        By creating an account you agree to our{" "}
                        <a href="#" style={{ color: "dodgerblue" }}>Terms &amp; Privacy</a>.
                    </p>
                    <br />
                    <Link to="/login">Already have an account? Login here</Link>
                </div>
            </form>
        </div>
    );
}