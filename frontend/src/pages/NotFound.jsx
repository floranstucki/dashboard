import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";

function NotFound() {
    return (
        <AppLayout>
            <section className="dashboard-card not-found-card">
                <h1>404</h1>
                <p>Cette page n’existe pas ou a été déplacée.</p>

                <Link to="/dashboard">Retour au dashboard</Link>
            </section>
        </AppLayout>
    );
}

export default NotFound;