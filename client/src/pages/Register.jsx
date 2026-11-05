import { useAuth } from "../auth/useAuth";
import { useLocation, useNavigate } from "react-router";
import { SampleSitemap } from "../utils/SampleSitemap";
import { AppHeader } from "../components/AppHeader";
import { Link } from "react-router";

export function Register() {
    // this page is a SAMPLE to test the registration flow
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // if we got redirected here, it stashed the original destination
    // this way we can send the user back to where they were trying to go after login
    const redirectTo = location.state?.from?.pathname || "/";

    async function onSubmit(event) {
        event.preventDefault();


        const formData = new FormData(event.currentTarget);

        const username = formData.get("username");
        const password = formData.get("password");


        try {
            await auth.register(username, password);

            navigate(redirectTo, { replace: true });
        } catch (error) {
            console.error("Registration failed:", error);
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

                    <label htmlFor="email">Email</label>
                    <input type="text" placeholder="Enter Email" name="email" required />
                    
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
                </div>
            </form>
        </div>
    );
}