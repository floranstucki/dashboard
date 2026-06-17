import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

function DailyScoreHistory() {
    const [scores, setScores] = useState([]);

    useEffect(() => {
        const loadScores = async () => {
            const response = await apiFetch("/daily-scores");

            if (!response.ok) return;

            const data = await response.json();

            setScores(data.slice(0, 7).reverse());
        };

        loadScores();
    }, []);

    return (
        <section className="dashboard-card daily-score-history-card">
            <div className="card-header">
                <h2>📈 Historique du score</h2>
            </div>

            <div className="score-history-bars">
                {scores.map((item) => (
                    <div className="score-history-item" key={item.id}>
                        <div className="score-history-bar">
                            <div style={{ height: `${item.score}%` }} />
                        </div>

                        <span>
                            {new Date(item.date).toLocaleDateString("fr-CH", {
                                weekday: "short",
                            })}
                        </span>

                        <strong>{item.score}</strong>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default DailyScoreHistory;