import { CalendarClock, TrendingUp } from "lucide-react";
import { useGoals } from "../context/GoalsContext";

function GoalForecastCard() {
    const { goals = [] } = useGoals();

    const activeGoals = goals.filter((goal) => Number(goal.progress) < 100);

    const getForecast = (goal) => {
        if (!goal.deadline || goal.deadline === "Non définie") {
            return {
                status: "neutral",
                label: "Deadline non définie",
                detail: "Impossible d’estimer la progression.",
            };
        }

        const today = new Date();
        const deadline = new Date(goal.deadline);

        if (Number.isNaN(deadline.getTime())) {
            return {
                status: "neutral",
                label: "Deadline invalide",
                detail: "Impossible d’estimer la progression.",
            };
        }

        const daysLeft = Math.ceil((deadline - today) / 86400000);
        const progress = Number(goal.progress || 0);

        if (daysLeft < 0) {
            return {
                status: "danger",
                label: "Deadline dépassée",
                detail: `Objectif à ${progress}%.`,
            };
        }

        if (progress >= 80) {
            return {
                status: "success",
                label: "Très bien parti",
                detail: `${daysLeft} jour(s) restant(s).`,
            };
        }

        if (progress >= 50 && daysLeft >= 7) {
            return {
                status: "success",
                label: "Dans les temps",
                detail: `${daysLeft} jour(s) restant(s).`,
            };
        }

        if (progress < 50 && daysLeft <= 14) {
            return {
                status: "danger",
                label: "À risque",
                detail: `${daysLeft} jour(s) restant(s), progression ${progress}%.`,
            };
        }

        return {
            status: "warning",
            label: "À surveiller",
            detail: `${daysLeft} jour(s) restant(s).`,
        };
    };

    return (
        <section className="dashboard-card goal-forecast-card">
            <div className="card-header">
                <h2>🔮 Prévision objectifs</h2>
            </div>

            <div className="goal-forecast-list">
                {activeGoals.length > 0 ? (
                    activeGoals.slice(0, 5).map((goal) => {
                        const forecast = getForecast(goal);

                        return (
                            <article
                                className={`goal-forecast-item ${forecast.status}`}
                                key={goal.id}
                            >
                                <div className="goal-forecast-icon">
                                    <TrendingUp size={18} />
                                </div>

                                <div>
                                    <h3>{goal.title}</h3>
                                    <p>{forecast.label}</p>
                                    <span>{forecast.detail}</span>
                                </div>

                                <strong>{goal.progress}%</strong>
                            </article>
                        );
                    })
                ) : (
                    <p className="empty-state">Aucun objectif actif.</p>
                )}
            </div>
        </section>
    );
}

export default GoalForecastCard;