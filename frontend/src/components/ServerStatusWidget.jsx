import { useEffect, useState } from "react";
import { Server, WifiOff } from "lucide-react";
import { apiFetch } from "../utils/api";

function ServerStatusWidget() {
    const [status, setStatus] = useState(null);

    useEffect(() => {
        const loadStatus = async () => {
            try {
                const response = await apiFetch("/server-status");

                if (!response.ok) {
                    throw new Error("Impossible de charger le statut serveur.");
                }

                const data = await response.json();
                setStatus(data);
            } catch {
                setStatus({
                    name: "Serveur Debian",
                    online: false,
                });
            }
        };

        loadStatus();
    }, []);

    if (!status) {
        return (
            <section className="dashboard-card server-status-card">
                <p>Chargement serveur...</p>
            </section>
        );
    }

    return (
        <section className="dashboard-card server-status-card">
            <div className="card-header">
                <h2>🖥️ Serveur maison</h2>
            </div>

            <div className="server-status-main">
                <div className={status.online ? "server-online" : "server-offline"}>
                    {status.online ? <Server size={30} /> : <WifiOff size={30} />}
                </div>

                <div>
                    <h3>{status.name}</h3>
                    <p>{status.online ? "🟢 En ligne" : "🔴 Hors ligne"}</p>
                </div>
            </div>

            {status.online && (
                <div className="server-metrics">
                    <div>
                        <span>CPU</span>
                        <strong>{status.cpu}%</strong>
                    </div>

                    <div>
                        <span>RAM</span>
                        <strong>{status.ram}%</strong>
                    </div>

                    <div>
                        <span>Disque</span>
                        <strong>{status.disk}%</strong>
                    </div>
                </div>
            )}

            <div className="server-status-detail">
                Dernière vérification : {status.checkedAt || "Non disponible"}
            </div>
        </section>
    );
}

export default ServerStatusWidget;