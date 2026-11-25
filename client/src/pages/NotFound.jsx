import { Link } from "react-router";
import { Layout } from "../components/Layout";

export function NotFound() {
    return (
        <Layout>
            <h1>404: Page Not Found</h1>
            <p>We couldn't find that page.</p>
            <p>
                <Link to="/">Return home?</Link>
            </p>
        </Layout>
    );
}