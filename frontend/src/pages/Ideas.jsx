import { useMemo, useState } from "react";
import { Lightbulb, Trash2 } from "lucide-react";
import { useIdeas } from "../context/IdeasContext";
import AppLayout from "../components/AppLayout";
import PageHeader from "../components/PageHeader";

function Ideas() {
    const {
        ideas,
        ideasLoading,
        ideasError,
        addIdea,
        deleteIdea,
        updateIdeaStatus,
    } = useIdeas();

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("FinScope");
    const [priority, setPriority] = useState("Moyenne");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("Toutes");

    const filteredIdeas = useMemo(() => {
        const cleanSearch = search.toLowerCase().trim();

        return ideas.filter((idea) => {
            const matchesSearch =
                idea.title.toLowerCase().includes(cleanSearch) ||
                idea.category.toLowerCase().includes(cleanSearch) ||
                idea.priority.toLowerCase().includes(cleanSearch) ||
                idea.status.toLowerCase().includes(cleanSearch);

            const matchesFilter =
                filter === "Toutes" ||
                idea.category === filter ||
                idea.priority === filter ||
                idea.status === filter;

            return matchesSearch && matchesFilter;
        });
    }, [ideas, search, filter]);

    const handleAddIdea = () => {
        if (!title.trim()) return;

        addIdea({
            title: title.trim(),
            category,
            priority,
        });

        setTitle("");
        setCategory("FinScope");
        setPriority("Moyenne");
    };

    return (
        <AppLayout>
            <PageHeader
                title="Idées"
                subtitle="Organise tes idées avant de les transformer en tâches ou projets."
            />

            <section className="dashboard-card ideas-form-card">
                <div className="card-header">
                    <h2>💡 Nouvelle idée</h2>
                    <button onClick={handleAddIdea}>+ Ajouter</button>
                </div>

                <div className="ideas-form">
                    <input
                        type="text"
                        placeholder="Nouvelle idée..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddIdea();
                        }}
                    />

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option>FinScope</option>
                        <option>Signal FC</option>
                        <option>Serveur</option>
                        <option>Emploi</option>
                        <option>Sport</option>
                        <option>Perso</option>
                        <option>Autre</option>
                    </select>

                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    >
                        <option>Basse</option>
                        <option>Moyenne</option>
                        <option>Haute</option>
                        <option>Très haute</option>
                    </select>
                </div>
            </section>

            <section className="dashboard-card ideas-list-card">
                <div className="card-header">
                    <h2>🧠 Banque d’idées</h2>

                    <select
                        className="ideas-filter"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option>Toutes</option>
                        <option>FinScope</option>
                        <option>Signal FC</option>
                        <option>Serveur</option>
                        <option>Emploi</option>
                        <option>Sport</option>
                        <option>Perso</option>
                        <option>Autre</option>
                        <option>Basse</option>
                        <option>Moyenne</option>
                        <option>Haute</option>
                        <option>Très haute</option>
                        <option>À explorer</option>
                        <option>Validée</option>
                        <option>Transformée</option>
                    </select>
                </div>

                <input
                    className="ideas-search"
                    type="text"
                    placeholder="Rechercher une idée..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <div className="ideas-page-grid">
                    {ideasLoading ? (
                        <div className="ideas-loader">
                            <div className="spinner"></div>
                            <p>Chargement des idées...</p>
                        </div>
                    ) : ideasError ? (
                        <div className="ideas-error">
                            <p>❌ {ideasError}</p>
                            <button onClick={() => fetchIdeas()}>Réessayer</button>
                        </div>
                    ) : filteredIdeas.length === 0 ? (
                        <div className="ideas-empty">
                            <p>Aucune idée trouvée</p>
                        </div>
                    ) : (
                        filteredIdeas.map((idea) => (
                            <article className="idea-page-card" key={idea.id}>
                                <div className="idea-page-top">
                                    <div className="idea-page-icon">
                                        <Lightbulb size={20} />
                                    </div>

                                    <div>
                                        <h3>{idea.title}</h3>
                                        <span>{idea.category}</span>
                                    </div>

                                    <button onClick={() => deleteIdea(idea.id)}>
                                        <Trash2 size={17} />
                                    </button>
                                </div>

                                <div className="idea-page-meta">
                                    <span>{idea.priority}</span>

                                    <button
                                        onClick={() =>
                                            updateIdeaStatus(
                                                idea.id,
                                                getNextStatus(idea.status)
                                            )
                                        }
                                    >
                                        {idea.status}
                                    </button>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </section>
        </AppLayout>
    );
}

export default Ideas;