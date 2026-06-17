import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { useTasks } from "../context/TasksContext";
import { useGoals } from "../context/GoalsContext";
import { useHabits } from "../context/HabitsContext";
import { useCalendar } from "../context/CalendarContext";
import { apiFetch } from "../utils/api";

function PersonalAssistantCard() {
    const { tasks = [] } = useTasks();
    const { goals = [] } = useGoals();
    const { habits = [] } = useHabits();
    const { sortedEvents = [] } = useCalendar();

    const [weather, setWeather] = useState(null);
    const [serverStatus, setServerStatus] = useState(null);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const loadExternalData = async () => {
            const [weatherRes, serverRes, stravaRes] = await Promise.allSettled([
                apiFetch("/weather"),
                apiFetch("/server-status"),
                apiFetch("/strava/activities"),
            ]);

            if (weatherRes.status === "fulfilled" && weatherRes.value.ok) {
                setWeather(await weatherRes.value.json());
            }

            if (serverRes.status === "fulfilled" && serverRes.value.ok) {
                setServerStatus(await serverRes.value.json());
            }

            if (stravaRes.status === "fulfilled" && stravaRes.value.ok) {
                setActivities(await stravaRes.value.json());
            }
        };

        loadExternalData();
    }, []);

    const insights = useMemo(() => {
        const result = [];

        const today = new Date().toISOString().split("T")[0];

        const urgentTasks = tasks.filter(
            (task) =>
                task.status !== "Terminé" &&
                (task.priority === "Haute" || task.priority === "Urgente")
        );

        if (urgentTasks.length > 0) {
            result.push({
                title: "Priorité du jour",
                text: `Tu as ${urgentTasks.length} tâche(s) importante(s) à traiter.`,
            });
        }
        const lateTasks = tasks.filter(
            (task) => {
                if (!task.deadline || task.deadline === "Non terminé") return false;

                return (task.status !== "Terminé" && new Date(task.deadline) < new Date());
            });

        if (lateTasks.length > 0) {
            result.push({
                title: "Tâches en retard",
                text: `${lateTasks.length} tâche(s) non terminée(s) et dont la date limite est dépassée.`,
            });
        }

        const weakHabits = habits.filter((habit) => !habit.doneToday);

        if (weakHabits.length >= 3) {
            result.push({
                title: "Habitudes fragiles",
                text: `${weakHabits.length} habitudes à risque, mets-toi au travail !`,
            });
        }


        const now = new Date();
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(now.getDate() - 7);

        const weeklyKm = activities.filter((activity) => new Date(activity.start_date) >= sevenDaysAgo)
            .reduce((sum, activity) => sum + Number(activity.distance || 0), 0) / 1000;

        if (weeklyKm < 15) {
            result.push({
                title: "Sport",
                text: `Seulement ${weeklyKm.toFixed(1)} km cette semaine. Une sortie légère pourrait aider.`,
            });
        }

        const todayEvents = sortedEvents.filter((event) => event.date === today);

        if (todayEvents.length > 0) {
            result.push({
                title: "Agenda",
                text: `${todayEvents.length} événement(s) prévu(s) aujourd’hui.`,
            });
        }

        const undoneHabits = habits.filter((habit) => !habit.doneToday);

        if (undoneHabits.length > 0) {
            result.push({
                title: "Habitudes",
                text: `${undoneHabits.length} habitude(s) restent à valider aujourd’hui.`,
            });
        }

        const almostGoals = goals.filter(
            (goal) => Number(goal.progress) >= 80 && Number(goal.progress) < 100
        );

        if (almostGoals.length > 0) {
            result.push({
                title: "Objectifs",
                text: `${almostGoals.length} objectif(s) sont presque atteints.`,
            });
        }

        const rain = Number(weather?.current?.precipitation || 0);
        const wind = Number(weather?.current?.wind_speed_10m || 0);
        const temp = weather?.current?.temperature_2m;

        if (weather) {
            if (rain < 1 && wind < 25) {
                result.push({
                    title: "Météo sport",
                    text: `Conditions favorables pour courir ou faire du vélo : ${temp}°C.`,
                });
            } else {
                result.push({
                    title: "Météo sport",
                    text: `Conditions moyennes : pluie ${rain} mm, vent ${wind} km/h.`,
                });
            }
        }

        if (serverStatus) {
            if (!serverStatus.online) {
                result.push({
                    title: "Serveur",
                    text: "Ton serveur maison semble hors ligne.",
                });
            } else if (Number(serverStatus.disk) >= 80) {
                result.push({
                    title: "Serveur",
                    text: `Attention, disque utilisé à ${serverStatus.disk}%.`,
                });
            } else {
                result.push({
                    title: "Serveur",
                    text: "Serveur maison opérationnel.",
                });
            }
        }

        if (activities.length > 0) {
            const last = activities[0];
            const daysSince = Math.floor(
                (new Date() - new Date(last.start_date)) / 86400000
            );

            if (daysSince >= 5) {
                result.push({
                    title: "Sport",
                    text: `Dernière activité Strava il y a ${daysSince} jours.`,
                });
            }
        }

        if (result.length === 0) {
            result.push({
                title: "Tout est calme",
                text: "Aucune alerte particulière pour aujourd’hui.",
            });
        }

        return result.slice(0, 6);
    }, [tasks, goals, habits, sortedEvents, weather, serverStatus, activities]);

    return (
        <section className="dashboard-card personal-assistant-card">
            <div className="card-header">
                <h2>🧠 Assistant personnel</h2>
            </div>

            <div className="assistant-summary">
                <div className="assistant-summary-icon">
                    <Sparkles size={24} />
                </div>

                <div>
                    <h3>Résumé du jour</h3>
                    <p>Analyse automatique de ton dashboard.</p>
                </div>
            </div>

            <div className="assistant-insights">
                {insights.map((insight, index) => (
                    <article key={index}>
                        <strong>{insight.title}</strong>
                        <span>{insight.text}</span>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default PersonalAssistantCard;