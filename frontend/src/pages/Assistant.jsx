import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import PageHeader from "../components/PageHeader";
import { apiFetch } from "../utils/api";

function Assistant() {
    const [memories, setMemories] = useState([]);
    const [history, setHistory] = useState([]);
    useEffect(() => {
        const loadMemories = async () => {
            const response = await apiFetch("/assistant/memory");

            if (!response.ok) return;

            const data = await response.json();
            setMemories(Array.isArray(data) ? data : []);
        };
        const loadHistory = async () => {
            const response = await apiFetch("/assistant/history");

            if (!response.ok) return;

            const data = await response.json();
            setHistory(Array.isArray(data) ? data.slice(0, 20) : []);
        };

        loadHistory();

        loadMemories();
    }, []);

    return (
        <AppLayout>
            <PageHeader
                title="Assistant"
                subtitle="Historique, mémoire et commandes vocales."
            />

            <section className="dashboard-card assistant-page-card">
                <div className="card-header">
                    <h2>🧠 Mémoire</h2>
                </div>

                <div className="assistant-memory-list">
                    {memories.length > 0 ? (
                        memories.map((memory) => (
                            <article key={memory.id}>
                                <strong>{memory.memoryKey}</strong>
                                <p>{memory.memoryValue}</p>
                            </article>
                        ))
                    ) : (
                        <p className="empty-state">Aucune mémoire enregistrée.</p>
                    )}
                </div>
            </section>
            <section className="dashboard-card assistant-page-card">
                <div className="card-header">
                    <h2>🎙️ Historique vocal</h2>
                </div>

                <div className="assistant-history-list">
                    {history.length > 0 ? (
                        history.map((item) => (
                            <article key={item.id}>
                                <span>
                                    {new Date(item.createdAt).toLocaleString("fr-CH", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>

                                <strong>{item.commandText}</strong>
                                <p>{item.responseText}</p>
                            </article>
                        ))
                    ) : (
                        <p className="empty-state">Aucune commande vocale enregistrée.</p>
                    )}
                </div>
            </section>
            <section className="dashboard-card assistant-page-card">
                <div className="card-header">
                    <h2>🎙️ Commandes disponibles</h2>
                </div>

                <div className="assistant-commands-grid">
                    <article>Ajoute une tâche urgente appeler le médecin demain</article>
                    <article>J’ai dépensé 12 francs pour repas</article>
                    <article>Ajoute un événement demain à 18h entraînement</article>
                    <article>Retiens que mon médecin s’appelle Martin</article>
                    <article>Comment s’appelle mon médecin ?</article>
                    <article>Bonjour Dashboard</article>
                    <article>État du serveur</article>
                    <article>Objectif sport</article>
                </div>
            </section>
        </AppLayout>
    );
}

export default Assistant;