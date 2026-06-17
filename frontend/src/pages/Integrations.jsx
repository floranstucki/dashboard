import AppLayout from "../components/AppLayout";
import PageHeader from "../components/PageHeader";
import StravaWidget from "../components/StravaWidget";
import ServerStatusWidget from "../components/ServerStatusWidget";
import WeatherWidget from "../components/WeatherWidget";
import { PlugZap } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
function Integrations() {

    const [stravaConnected, setStravaConnected] = useState(false);
    const [githubConnected, setGithubConnected] = useState(false);

    useEffect(() => {
        const loadStatus = async () => {
            const stravaRes = await apiFetch("/strava/status");
            if (stravaRes.ok) {
                const data = await stravaRes.json();
                setStravaConnected(data.connected);
            }

            const githubRes = await apiFetch("/github/status");
            if (githubRes.ok) {
                const data = await githubRes.json();
                setGithubConnected(data.connected);
            }
        };

        loadStatus();
    }, []);

    const connectStrava = async () => {
        const response = await apiFetch("/strava/connect-url");
        const data = await response.json();
        window.location.href = data.url;
    };

    const disconnectStrava = async () => {
        await apiFetch("/strava/disconnect", { method: "DELETE" });
        setStravaConnected(false);
    };

    const connectGitHub = async () => {
        const response = await apiFetch("/github/connect-url");

        console.log("status", response.status);

        const text = await response.text();

        console.log(text);

        if (!response.ok) {
            alert("Erreur " + response.status);
            return;
        }

        const data = JSON.parse(text);

        window.location.href = data.url;
    };

    const disconnectGitHub = async () => {
        await apiFetch("/github/disconnect", { method: "DELETE" });
        setGithubConnected(false);
    };
    return (
        <AppLayout>
            <PageHeader
                title="Intégrations"
                subtitle="Connecte tes services favoris à Home Dashboard."
            />

            <section className="dashboard-card integrations-intro-card">
                <div className="integrations-intro-icon">
                    <PlugZap size={28} />
                </div>

                <div>
                    <h2>Centre d’intégrations</h2>
                    <p>
                        Regroupe ici tes services externes : sport, météo, serveur maison
                        et futurs connecteurs.
                    </p>
                </div>
            </section>
            <section className="dashboard-card integrations-actions-card">
                <div className="card-header">
                    <h2>🔌 Connexions</h2>
                </div>

                <div className="integration-item">
                    <div>
                        <h3>🏃 Strava</h3>
                        <p>{stravaConnected ? "Connecté" : "Non connecté"}</p>
                    </div>

                    {stravaConnected ? (
                        <button className="danger" onClick={disconnectStrava}>
                            Déconnecter
                        </button>
                    ) : (
                        <button onClick={connectStrava}>Connecter</button>
                    )}
                </div>

                <div className="integration-item">
                    <div>
                        <h3>💻 GitHub</h3>
                        <p>{githubConnected ? "Connecté" : "Non connecté"}</p>
                    </div>

                    {githubConnected ? (
                        <button className="danger" onClick={disconnectGitHub}>
                            Déconnecter
                        </button>
                    ) : (
                        <button onClick={connectGitHub}>Connecter</button>
                    )}
                </div>
            </section>
            <div className="dashboard-grid">
                <StravaWidget />
                <WeatherWidget />
                <ServerStatusWidget />
            </div>

            <section className="dashboard-card integrations-future-card">
                <div className="card-header">
                    <h2>🔜 Futures intégrations</h2>
                </div>

                <div className="integrations-future-grid">
                    <article>Garmin</article>
                    <article>GitHub</article>
                    <article>SwissTransport</article>
                    <article>RSS Tech</article>
                    <article>Football.ch</article>
                    <article>Google Drive</article>
                </div>
            </section>
        </AppLayout>
    );
}

export default Integrations;