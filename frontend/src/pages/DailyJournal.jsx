import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import PageHeader from "../components/PageHeader";
import { useTasks } from "../context/TasksContext";
import { useHabits } from "../context/HabitsContext";
import { apiFetch } from "../utils/api";

function DailyJournal() {
    const { tasks = [] } = useTasks();
    const { habits = [] } = useHabits();
    const [history, setHistory] = useState([]);
    const [activities, setActivities] = useState([]);
    const [weather, setWeather] = useState(null);
    const [serverStatus, setServerStatus] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            const [stravaRes, weatherRes, serverRes] = await Promise.allSettled([
                apiFetch("/strava/activities"),
                apiFetch("/weather"),
                apiFetch("/server-status"),
            ]);

            if (stravaRes.status === "fulfilled" && stravaRes.value.ok) {
                setActivities(await stravaRes.value.json());
            }

            if (weatherRes.status === "fulfilled" && weatherRes.value.ok) {
                setWeather(await weatherRes.value.json());
            }

            if (serverRes.status === "fulfilled" && serverRes.value.ok) {
                setServerStatus(await serverRes.value.json());
            }

            const journalRes = await apiFetch("/daily-journal");

            if (journalRes.ok) {
                const data = await journalRes.json();
                setHistory(Array.isArray(data) ? data.slice(0, 7) : []);
            }

        };



        loadData();
    }, []);

    const journal = useMemo(() => {
        const today = new Date().toISOString().split("T")[0];

        const doneTasks = tasks.filter((task) => task.status === "Terminé");

        const doneHabits = habits.filter((habit) => habit.doneToday);

        const todayActivities = activities.filter((activity) =>
            activity.start_date?.startsWith(today)
        );

        const sportDistanceKm =
            todayActivities.reduce(
                (sum, activity) => sum + Number(activity.distance || 0),
                0
            ) / 1000;

        const rain = Number(weather?.current?.precipitation || 0);
        const temp = weather?.current?.temperature_2m;

        return [
            {
                label: "Tâches terminées",
                value: doneTasks.length,
                detail: doneTasks.length
                    ? doneTasks.slice(0, 3).map((task) => task.title).join(", ")
                    : "Aucune tâche terminée aujourd’hui.",
            },
            {
                label: "Sport",
                value: `${sportDistanceKm.toFixed(1)} km`,
                detail: todayActivities.length
                    ? `${todayActivities.length} activité(s) Strava aujourd’hui.`
                    : "Aucune activité Strava aujourd’hui.",
            },
            {
                label: "Habitudes",
                value: `${doneHabits.length}/${habits.length}`,
                detail: doneHabits.length
                    ? doneHabits.map((habit) => habit.title).join(", ")
                    : "Aucune habitude validée aujourd’hui.",
            },
            {
                label: "Serveur",
                value: serverStatus?.online ? "OK" : "Hors ligne",
                detail: serverStatus?.online
                    ? `CPU ${serverStatus.cpu}% · RAM ${serverStatus.ram}% · Disque ${serverStatus.disk}%`
                    : "Serveur non disponible.",
            },
            {
                label: "Météo",
                value: temp ? `${temp}°C` : "N/A",
                detail: `Pluie : ${rain} mm`,
            },
        ];
    }, [tasks, habits, activities, weather, serverStatus]);


    useEffect(() => {
        const saveJournal = async () => {
            if (!journal || journal.length === 0) return;

            const getValue = (label) =>
                journal.find((item) => item.label === label)?.value;

            const getDetail = (label) =>
                journal.find((item) => item.label === label)?.detail;

            await apiFetch("/daily-journal/today", {
                method: "POST",
                body: JSON.stringify({
                    summary: journal
                        .map((item) => `${item.label}: ${item.value}`)
                        .join(" | "),
                    tasksDone: Number(getValue("Tâches terminées")) || 0,
                    habitsDone: Number(String(getValue("Habitudes")).split("/")[0]) || 0,
                    sportKm:
                        Number(String(getValue("Sport")).replace(" km", "")) || 0,
                    serverOk: getValue("Serveur") === "OK",
                    weatherSummary: getDetail("Météo") || "N/A",
                }),
            });
        };

        saveJournal();
    }, [journal]);
    return (
        <AppLayout>
            <PageHeader
                title="Journal de bord"
                subtitle="Résumé automatique de ta journée."
            />

            <section className="dashboard-card daily-journal-card">
                <div className="card-header">
                    <h2>📔 Aujourd’hui</h2>
                </div>

                <div className="daily-journal-grid">
                    {journal.map((item) => (
                        <article className="daily-journal-item" key={item.label}>
                            <span>{item.label}</span>
                            <strong>{item.value}</strong>
                            <p>{item.detail}</p>
                        </article>
                    ))}
                </div>
            </section>
            <section className="dashboard-card daily-journal-card">
                <div className="card-header">
                    <h2>📚 Historique</h2>
                </div>

                <div className="daily-journal-history">
                    {history.map((entry) => (
                        <article key={entry.id}>
                            <strong>
                                {new Date(entry.date).toLocaleDateString("fr-CH", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                })}
                            </strong>

                            <p>{entry.summary}</p>
                        </article>
                    ))}
                </div>
            </section>
        </AppLayout>
    );
}

export default DailyJournal;