import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { CheckCircle2, Copy, Server, ShieldCheck, Terminal } from "lucide-react";
import { getStorageData, setStorageData } from "../utils/storage";
import PageHeader from "../components/PageHeader";

const STORAGE_KEY = "home-dashboard-servers-checklist";

function Servers() {
    const defaultChecklist = [
        { id: crypto.randomUUID(), text: "Vérifier les mises à jour Debian", done: false },
        { id: crypto.randomUUID(), text: "Contrôler les backups WordPress", done: false },
        { id: crypto.randomUUID(), text: "Vérifier l’espace disque", done: false },
        { id: crypto.randomUUID(), text: "Contrôler les certificats SSL", done: false },
    ];

    const [checklist, setChecklist] = useState(() =>
        getStorageData(STORAGE_KEY, defaultChecklist)
    );

    const services = [
        { name: "Debian Server", status: "OK", detail: "Serveur principal" },
        { name: "WordPress", status: "OK", detail: "Site Signal FC" },
        { name: "Tailscale", status: "OK", detail: "Accès distant privé" },
        { name: "Backups", status: "À vérifier", detail: "Sauvegardes automatiques" },
    ];

    const commands = [
        {
            label: "Connexion SSH",
            command: "ssh flo@100.79.99.105",
        },
        {
            label: "Mise à jour Debian",
            command: "sudo apt update && sudo apt upgrade -y",
        },
        {
            label: "Espace disque",
            command: "df -h",
        },
        {
            label: "Services actifs",
            command: "systemctl --type=service --state=running",
        },
        {
            label: "Logs Nginx",
            command: "sudo journalctl -u nginx -f",
        },
    ];

    useEffect(() => {
        setStorageData(STORAGE_KEY, checklist);
    }, [checklist]);

    const toggleChecklist = (id) => {
        setChecklist(
            checklist.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        done: !item.done,
                    }
                    : item
            )
        );
    };

    const copyCommand = async (command) => {
        await navigator.clipboard.writeText(command);
    };

    return (
        <AppLayout>
            <PageHeader
                title="Serveurs"
                subtitle="Maintenance, commandes et suivi de ton infrastructure maison."
            />

            <section className="dashboard-card server-status-card">
                <div className="card-header">
                    <h2>🖥️ État des services</h2>
                </div>

                <div className="server-status-grid">
                    {services.map((service) => (
                        <article className="server-status-item" key={service.name}>
                            <div className="server-status-icon">
                                <Server size={20} />
                            </div>

                            <div>
                                <h3>{service.name}</h3>
                                <p>{service.detail}</p>
                            </div>

                            <span
                                className={
                                    service.status === "OK"
                                        ? "server-pill ok"
                                        : "server-pill warning"
                                }
                            >
                                {service.status}
                            </span>
                        </article>
                    ))}
                </div>
            </section>

            <div className="dashboard-grid server-page-grid">
                <section className="dashboard-card">
                    <div className="card-header">
                        <h2>✅ Checklist maintenance</h2>
                    </div>

                    <div className="server-checklist">
                        {checklist.map((item) => (
                            <button
                                key={item.id}
                                className={`server-check-item ${item.done ? "done" : ""}`}
                                onClick={() => toggleChecklist(item.id)}
                            >
                                <CheckCircle2 size={18} />
                                <span>{item.text}</span>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="dashboard-card">
                    <div className="card-header">
                        <h2>🛡️ Sécurité rapide</h2>
                    </div>

                    <div className="security-list">
                        <article>
                            <ShieldCheck size={19} />
                            <div>
                                <h3>Accès distant</h3>
                                <p>Privilégier Tailscale plutôt qu’exposer SSH publiquement.</p>
                            </div>
                        </article>

                        <article>
                            <ShieldCheck size={19} />
                            <div>
                                <h3>Permissions</h3>
                                <p>Éviter de travailler directement en root dans WordPress.</p>
                            </div>
                        </article>

                        <article>
                            <ShieldCheck size={19} />
                            <div>
                                <h3>Backups</h3>
                                <p>Garder au moins une sauvegarde externe ou hors serveur.</p>
                            </div>
                        </article>
                    </div>
                </section>
            </div>

            <section className="dashboard-card commands-card">
                <div className="card-header">
                    <h2>⌨️ Commandes utiles</h2>
                </div>

                <div className="commands-list">
                    {commands.map((item) => (
                        <article className="command-item" key={item.label}>
                            <div className="command-icon">
                                <Terminal size={18} />
                            </div>

                            <div>
                                <h3>{item.label}</h3>
                                <code>{item.command}</code>
                            </div>

                            <button onClick={() => copyCommand(item.command)}>
                                <Copy size={17} />
                            </button>
                        </article>
                    ))}
                </div>
            </section>
        </AppLayout>
    );
}

export default Servers;