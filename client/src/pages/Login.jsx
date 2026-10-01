import { useAuth } from "../auth/useAuth";
import { useLocation, useNavigate } from "react-router";
import { SampleSitemap } from "../utils/SampleSitemap";

export function Login() {
    // this page is a SAMPLE to test the login flow
    const auth = useAuth();
    const navigate = useNavigate();

    // if we got redirected here, it stashed the original destination
    // this way we can send the user back to where they were trying to go after login
    const redirectTo = location.state?.from?.pathname || "/";

    async function onClick() {
        await auth.login("sample@example.com", "password");
        navigate(redirectTo, { replace: true });
    };

    return (
        <div>
            <p>Login as <code>sample@example.com</code>:{" "}
                <button onClick={onClick}>Click here</button>
            </p>
            <p>
                The links below should not work because you're not logged in.
                (You'll get redirected right back to this login page.)
            </p>
            <SampleSitemap />
        </div>
    );
}