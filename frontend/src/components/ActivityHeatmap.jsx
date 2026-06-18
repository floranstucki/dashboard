import { useEffect, useMemo, useState } from "react";
import { useTasks } from "../context/TasksContext";
import { useHabits } from "../context/HabitsContext";
import { apiFetch } from "../utils/api";

function ActivityHeatmap() {
    const { tasks } = useTasks();
    const { habits } = useHabits();
    const [activities, setActivities] = useState([]);

    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const safeHabits = Array.isArray(habits) ? habits : [];
    const safeActivities = Array.isArray(activities) ? activities : [];

    useEffect(() => {
        const loadActivities = async () => {
            try {
                const response = await apiFetch("/strava/activities");

                if (!response.ok) {
                    setActivities([]);
                    return;
                }

                const data = await response.json();
                setActivities(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Erreur heatmap Strava :", error);
                setActivities([]);
            }
        };

        loadActivities();
    }, []);

    const heatmapData = useMemo(() => {
        const data = [];
        const todayString = new Date().toISOString().split("T")[0];

        for (let i = 41; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            const dateString = date.toISOString().split("T")[0];

            const completedTasks = safeTasks.filter(
                (task) =>
                    task.status === "Terminé" &&
                    task.updatedAt?.startsWith(dateString)
            ).length;

            const completedHabits = safeHabits.filter(
                (habit) =>
                    habit.lastDoneDate === dateString ||
                    (habit.doneToday && dateString === todayString)
            ).length;

            const stravaPoints =
                safeActivities.filter((activity) =>
                    activity.start_date?.startsWith(dateString)
                ).length * 3;

            data.push({
                date: dateString,
                count: completedTasks + completedHabits + stravaPoints,
            });
        }

        return data;
    }, [safeTasks, safeHabits, safeActivities]);

    const getClass = (count) => {
        if (count === 0) return "heatmap-0";
        if (count <= 2) return "heatmap-1";
        if (count <= 4) return "heatmap-2";
        return "heatmap-3";
    };

    return (
        <section className="dashboard-card heatmap-card">
            <div className="card-header">
                <h2>🔥 Activité globale</h2>
            </div>

            <div className="heatmap-grid">
                {heatmapData.map((day) => (
                    <div
                        key={day.date}
                        className={`heatmap-cell ${getClass(day.count)}`}
                        title={`${day.date} : ${day.count} point(s) d’activité`}
                    />
                ))}
            </div>
        </section>
    );
}

export default ActivityHeatmap;