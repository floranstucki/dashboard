import { useEffect, useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { useTasks } from "../context/TasksContext";
import { useHabits } from "../context/HabitsContext";
import { useGoals } from "../context/GoalsContext";
import { useCalendar } from "../context/CalendarContext";
import { apiFetch } from "../utils/api";

function DailyScoreCard() {
    const { tasks = [] } = useTasks();
    const { habits = [] } = useHabits();
    const { goals = [] } = useGoals();
    const { sortedEvents = [] } = useCalendar();

    const [activities, setActivities] = useState([]);
    const [serverStatus, setServerStatus] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            const [stravaRes, serverRes] = await Promise.allSettled([
                apiFetch("/strava/activities"),
                apiFetch("/server-status"),
            ]);

            if (stravaRes.status === "fulfilled" && stravaRes.value.ok) {
                setActivities(await stravaRes.value.json());
            }

            if (serverRes.status === "fulfilled" && serverRes.value.ok) {
                setServerStatus(await serverRes.value.json());
            }
        };

        loadData();
    }, []);

    const scoreData = useMemo(() => {
        const today = new Date().toISOString().split("T")[0];

        const doneTasks = tasks.filter((task) => task.status === "Terminé").length;
        const taskScore = Math.min(30, doneTasks * 10);

        const doneHabits = habits.filter((habit) => habit.doneToday).length;
        const habitScore = habits.length
            ? Math.round((doneHabits / habits.length) * 20)
            : 0;

        const sportToday = activities.some((activity) =>
            activity.start_date?.startsWith(today)
        );
        const sportScore = sportToday ? 20 : 0;

        const eventsToday = sortedEvents.filter((event) => event.date === today);
        const calendarScore = eventsToday.length > 0 ? 10 : 5;

        const serverScore = serverStatus?.online ? 10 : 0;

        const goalScore = goals.some(
            (goal) => Number(goal.progress) >= 80 && Number(goal.progress) < 100
        )
            ? 10
            : 0;

        const total =
            taskScore +
            habitScore +
            sportScore +
            calendarScore +
            serverScore +
            goalScore;

        return {
            total,
            items: [
                { label: "Tâches", value: taskScore, max: 30 },
                { label: "Habitudes", value: habitScore, max: 20 },
                { label: "Sport", value: sportScore, max: 20 },
                { label: "Agenda", value: calendarScore, max: 10 },
                { label: "Serveur", value: serverScore, max: 10 },
                { label: "Objectifs", value: goalScore, max: 10 },
            ],
        };
    }, [tasks, habits, goals, sortedEvents, activities, serverStatus]);


    useEffect(() => {
        const saveScore = async () => {
            if (scoreData.total === undefined) return;

            await apiFetch("/daily-scores/today", {
                method: "POST",
                body: JSON.stringify({
                    score: scoreData.total,
                }),
            });
        };

        saveScore();
    }, [scoreData.total]);
    const getLabel = () => {
        if (scoreData.total >= 85) return "Excellente journée";
        if (scoreData.total >= 65) return "Bonne journée";
        if (scoreData.total >= 45) return "Journée correcte";
        return "À améliorer";
    };

    return (
        <section className="dashboard-card daily-score-card">
            <div className="card-header">
                <h2>🏆 Score du jour</h2>
            </div>

            <div className="daily-score-main">
                <div className="daily-score-icon">
                    <Trophy size={26} />
                </div>

                <div>
                    <h3>{scoreData.total}/100</h3>
                    <p>{getLabel()}</p>
                </div>
            </div>

            <div className="daily-score-progress">
                <div style={{ width: `${scoreData.total}%` }} />
            </div>

            <div className="daily-score-details">
                {scoreData.items.map((item) => (
                    <div key={item.label}>
                        <span>{item.label}</span>
                        <strong>
                            {item.value}/{item.max}
                        </strong>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default DailyScoreCard;