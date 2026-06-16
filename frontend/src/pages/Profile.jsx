import AppLayout from "../components/AppLayout";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";

function Profile() {
    const { auth, logout } = useAuth();

    return (
        <AppLayout>
            <PageHeader
                title="Profil"
                subtitle="Informations de ton compte utilisateur."
            />

            <section className="dashboard-card profile-card">
                <h2>👤 {auth?.username}</h2>
                <p>{auth?.email}</p>

                <button onClick={logout}>Se déconnecter</button>
            </section>
        </AppLayout>
    );
}

export default Profile;