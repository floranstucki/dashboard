import { useEffect, useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { apiFetch } from "../utils/api";

const WEEKLY_GOAL_KM = 30;

function SportGoalWidget() {
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const loadActivities = async () => {
            const response = await apiFetch("/strava/activities");

            if (!response.ok) return;

            const data = await response.json();
            setActivities(data);
        };

        loadActivities();
    }, []);

    const weeklyDistanceKm = useMemo(() => {
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        const meters = activities
            .filter((activity) => new Date(activity.start_date) >= sevenDaysAgo)
            .reduce((sum, activity) => sum + activity.distance, 0);

        return meters / 1000;
    }, [activities]);

    const progress = Math.min(
        100,
        Math.round((weeklyDistanceKm / WEEKLY_GOAL_KM) * 100)
    );

    const remaining = Math.max(0, WEEKLY_GOAL_KM - weeklyDistanceKm);

    return (
        <section className="dashboard-card sport-goal-card">
            <div className="card-header">
                <h2>🏃 Objectif sport</h2>
            </div>

            <div className="sport-goal-main">
                <div className="sport-goal-icon">
                    <Trophy size={24} />
                </div>

                <div>
                    <h3>{weeklyDistanceKm.toFixed(1)} km / {WEEKLY_GOAL_KM} km</h3>
                    <p>Objectif hebdomadaire Strava</p>
                </div>
            </div>

            <div className="sport-goal-progress">
                <div style={{ width: `${progress}%` }} />
            </div>

            <div className="sport-goal-footer">
                <span>{progress}% atteint</span>
                <strong>Reste {remaining.toFixed(1)} km</strong>
            </div>
        </section>
    );
}

export default SportGoalWidget;