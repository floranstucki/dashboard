import { Target } from "lucide-react";
import { useGoals } from "../context/GoalsContext";

function MainGoalCard() {
    const { goals } = useGoals();

    const activeGoals = goals
        .filter((goal) => Number(goal.progress) < 100)
        .sort((a, b) => {
            if (!a.deadline || a.deadline === "Non définie") return 1;
            if (!b.deadline || b.deadline === "Non définie") return -1;

            return new Date(a.deadline) - new Date(b.deadline);
        });

    const goal = activeGoals[0];

    if (!goal) {
        return (
            <section className="dashboard-card main-goal-card">
                <div className="card-header">
                    <h2>🎯 Objectif principal</h2>
                </div>

                <p className="empty-state">Aucun objectif actif.</p>
            </section>
        );
    }

    return (
        <section className="dashboard-card main-goal-card">
            <div className="card-header">
                <h2>🎯 Objectif principal</h2>
            </div>

            <div className="main-goal-content">
                <div className="main-goal-icon">
                    <Target size={24} />
                </div>

                <div>
                    <h3>{goal.title}</h3>
                    <p>{goal.category}</p>
                </div>
            </div>

            <div className="main-goal-info">
                <span>Progression</span>
                <strong>{goal.progress}%</strong>
            </div>

            <div className="main-goal-progress">
                <div style={{ width: `${goal.progress}%` }} />
            </div>

            <div className="main-goal-deadline">
                <span>Deadline</span>
                <strong>{goal.deadline || "Non définie"}</strong>
            </div>
        </section>
    );
}

export default MainGoalCard;