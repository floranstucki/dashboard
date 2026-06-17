import { useEffect, useMemo, useState } from "react";
import { useTasks } from "../context/TasksContext";
import { useHabits } from "../context/HabitsContext";
import { apiFetch } from "../utils/api";

function ActivityHeatmap() {
    const { tasks = [] } = useTasks();
    const { habits = [] } = useHabits();
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

    const heatmapData = useMemo(() => {
        const data = [];

        for (let i = 41; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            const dateString = date.toISOString().split("T")[0];

            const completedTasks = tasks.filter(
                (task) =>
                    task.status === "Terminé" &&
                    task.updatedAt?.startsWith(dateString)
            ).length;

            const completedHabits = habits.filter(
                (habit) =>
                    habit.lastDoneDate === dateString ||
                    (habit.doneToday && dateString === new Date().toISOString().split("T")[0])
            ).length;

            const stravaPoints = activities.filter((activity) =>
                activity.start_date?.startsWith(dateString)
            ).length * 3;

            const count = completedTasks + completedHabits + stravaPoints;

            data.push({
                date: dateString,
                count,
            });
        }

        return data;
    }, [tasks, habits, activities]);

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