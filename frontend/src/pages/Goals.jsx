import { useState } from "react";
import { Target, Trash2 } from "lucide-react";
import { useGoals } from "../context/GoalsContext";
import AppLayout from "../components/AppLayout";
import PageHeader from "../components/PageHeader";

function Goals() {
    const {
        goals,
        goalsLoading,
        goalsError,
        addGoal,
        deleteGoal,
        updateGoalProgress,
    } = useGoals();

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Professionnel");
    const [deadline, setDeadline] = useState("");
    const [progress, setProgress] = useState(0);

    const handleAddGoal = () => {
        if (!title.trim()) return;

        addGoal({
            title: title.trim(),
            category,
            deadline: deadline || "Non définie",
            progress: Number(progress),
        });

        setTitle("");
        setCategory("Professionnel");
        setDeadline("");
        setProgress(0);
    };

    return (
        <AppLayout>
            <PageHeader
                title="Objectifs"
                subtitle="Garde tes objectifs importants visibles et mesurables."
            />

            <section className="dashboard-card goals-form-card">
                <div className="card-header">
                    <h2>🎯 Nouvel objectif</h2>
                    <button onClick={handleAddGoal}>+ Ajouter</button>
                </div>

                <div className="goals-form">
                    <input
                        type="text"
                        placeholder="Nom de l’objectif..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option>Professionnel</option>
                        <option>Emploi</option>
                        <option>Projet</option>
                        <option>Sport</option>
                        <option>Finance</option>
                        <option>Personnel</option>
                    </select>

                    <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                    />

                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={(e) => setProgress(e.target.value)}
                        placeholder="Progression"
                    />
                </div>
            </section>

            <section className="dashboard-card goals-list-card">
                <div className="card-header">
                    <h2>📌 Mes objectifs</h2>
                </div>

                <div className="goals-grid">
                    {goalsLoading && <p className="empty-state">Chargement des objectifs...</p>}

                    {goalsError && <p className="empty-state">{goalsError}</p>}

                    {!goalsLoading && !goalsError && goals.length === 0 && (
                        <p className="empty-state">Aucun objectif trouvé.</p>
                    )}

                    {!goalsLoading && !goalsError && goals.map((goal) => (
                        <article className="goal-card" key={goal.id}>
                            <div className="goal-top">
                                <div className="goal-icon">
                                    <Target size={20} />
                                </div>

                                <div>
                                    <h3>{goal.title}</h3>
                                    <span>{goal.category}</span>
                                </div>

                                <button onClick={() => deleteGoal(goal.id)}>
                                    <Trash2 size={17} />
                                </button>
                            </div>

                            <div className="goal-meta">
                                <span>Deadline</span>
                                <strong>{goal.deadline}</strong>
                            </div>

                            <div className="project-progress-info">
                                <span>Progression</span>
                                <strong>{goal.progress}%</strong>
                            </div>

                            <input
                                className="project-range"
                                type="range"
                                min="0"
                                max="100"
                                value={goal.progress}
                                onChange={(e) => updateGoalProgress(goal.id, e.target.value)}
                            />

                            <div className="project-progress">
                                <div style={{ width: `${goal.progress}%` }} />
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </AppLayout>
    );
}

export default Goals;