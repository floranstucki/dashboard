import { useEffect, useState } from "react";
import { Server, WifiOff } from "lucide-react";
import { apiFetch } from "../utils/api";

function ServerStatusWidget() {
    const [status, setStatus] = useState(null);

    const safeStatus = Array.isArray(status) ? status : [];
    useEffect(() => {
        const loadStatus = async () => {
            try {
                const response = await apiFetch("/server-status");

                if (!response.ok) {
                    throw new Error("Impossible de charger le statut serveur.");
                }

                const data = await response.json();
                setStatus(Array.isArray(data) ? data : []);
            } catch {
                setStatus({
                    name: "Serveur Debian",
                    online: false,
                });
            }
        };

        loadStatus();
    }, []);

    if (!safeStatus) {
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
                <div className={safeStatus.online ? "server-online" : "server-offline"}>
                    {safeStatus.online ? <Server size={30} /> : <WifiOff size={30} />}
                </div>

                <div>
                    <h3>{safeStatus.name}</h3>
                    <p>{safeStatus.online ? "🟢 En ligne" : "🔴 Hors ligne"}</p>
                </div>
            </div>

            {safeStatus.online && (
                <>
                    <div className="server-metrics">
                        <div>
                            <span>CPU</span>
                            <strong>{safeStatus.cpu}%</strong>
                        </div>

                        <div>
                            <span>RAM</span>
                            <strong>{safeStatus.ram}%</strong>
                        </div>

                        <div>
                            <span>Disque</span>
                            <strong>{safeStatus.disk}%</strong>
                        </div>
                    </div>

                    <div className="server-extra">
                        <div>
                            <span>Uptime</span>
                            <strong>{safeStatus.uptime || "N/A"}</strong>
                        </div>

                        <div>
                            <span>Dernier backup</span>
                            <strong>{safeStatus.lastBackup || "N/A"}</strong>
                        </div>
                    </div>

                    <div className="server-services">
                        <span className={safeStatus.services?.nginx ? "ok" : "ko"}>
                            Nginx
                        </span>

                        <span className={safeStatus.services?.php ? "ok" : "ko"}>
                            PHP-FPM
                        </span>

                        <span className={safeStatus.services?.mysql ? "ok" : "ko"}>
                            MySQL
                        </span>
                    </div>
                </>
            )}

            <div className="server-status-detail">
                Dernière vérification : {safeStatus.checkedAt || "Non disponible"}
            </div>
        </section>
    );
}

export default ServerStatusWidget;