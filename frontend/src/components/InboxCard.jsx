import { Lightbulb } from "lucide-react";
import { useIdeas } from "../context/IdeasContext";

function InboxCard() {
    const { ideas, updateIdeaStatus } = useIdeas();

    const latestIdeas = ideas.slice(0, 4);

    return (
        <section className="dashboard-card inbox-card">
            <div className="card-header">
                <h2>💡 Inbox / idées rapides</h2>
            </div>

            <div className="inbox-list">
                {latestIdeas.length > 0 ? (
                    latestIdeas.map((idea) => (
                        <article className="inbox-item" key={idea.id}>
                            <div className="smart-icon">
                                <Lightbulb size={17} />
                            </div>

                            <div>
                                <h3>{idea.title}</h3>
                                <p>
                                    {idea.category} · {idea.status}
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    updateIdeaStatus(
                                        idea.id,
                                        idea.status === "À explorer"
                                            ? "Validée"
                                            : idea.status === "Validée"
                                                ? "Transformée"
                                                : "À explorer"
                                    )
                                }
                            >
                                {idea.status}
                            </button>
                        </article>
                    ))
                ) : (
                    <p className="empty-state">Aucune idée pour le moment.</p>
                )}
            </div>
        </section>
    );
}

export default InboxCard;