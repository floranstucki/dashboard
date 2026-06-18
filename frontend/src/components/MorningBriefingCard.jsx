import { useEffect, useMemo, useState } from "react";
import { Coffee } from "lucide-react";
import { useTasks } from "../context/TasksContext";
import { useCalendar } from "../context/CalendarContext";
import { apiFetch } from "../utils/api";

function MorningBriefingCard() {
    const { tasks } = useTasks();
    const { sortedEvents } = useCalendar();
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const safeEvents = Array.isArray(sortedEvents) ? sortedEvents : [];

    const [weather, setWeather] = useState(null);
    const [serverStatus, setServerStatus] = useState(null);
    const [activities, setActivities] = useState([]);

    const safeWeather = Array.isArray(weather) ? weather : [];
    const safeServerStatus = Array.isArray(serverStatus) ? serverStatus : [];
    const safeActivities = Array.isArray(activities) ? activities : [];

    useEffect(() => {
        const loadData = async () => {
            try {
                const [weatherRes, serverRes, stravaRes] =
                    await Promise.allSettled([
                        apiFetch("/weather"),
                        apiFetch("/server-status"),
                        apiFetch("/strava/activities"),
                    ]);

                if (
                    weatherRes.status === "fulfilled" &&
                    weatherRes.value.ok
                ) {
                    setWeather(await weatherRes.value.json());
                }

                if (
                    serverRes.status === "fulfilled" &&
                    serverRes.value.ok
                ) {
                    setServerStatus(await serverRes.value.json());
                }

                if (
                    stravaRes.status === "fulfilled" &&
                    stravaRes.value.ok
                ) {
                    setActivities(await stravaRes.value.json());
                }
            } catch (error) {
                console.error("Erreur briefing :", error);
            }
        };

        loadData();
    }, []);

    const briefing = useMemo(() => {
        const items = [];

        const today = new Date().toISOString().split("T")[0];

        const urgentTasks = safeTasks.filter(
            (task) =>
                task.status !== "Terminé" &&
                (task.priority === "Haute" ||
                    task.priority === "Urgente")
        );

        if (urgentTasks.length > 0) {
            items.push(
                `🎯 ${urgentTasks.length} tâche(s) prioritaire(s)`
            );
        }

        const todayEvents = safeEvents.filter(
            (event) => event.date === today
        );

        if (todayEvents.length > 0) {
            items.push(
                `📅 ${todayEvents.length} événement(s) prévu(s)`
            );
        }

        if (safeWeather?.current) {
            const rain =
                safeWeather.current.precipitation ?? 0;

            if (rain < 1) {
                items.push(
                    "🌤️ Conditions idéales pour le sport"
                );
            } else {
                items.push(
                    `☔ ${rain} mm de pluie annoncés`
                );
            }
        }

        if (safeServerStatus?.online) {
            items.push(
                safeServerStatus.online
                    ? "🖥️ Serveur opérationnel"
                    : "🚨 Serveur hors ligne"
            );
        }

        if (safeActivities.length > 0) {
            const last = safeActivities[0];

            const daysSince = Math.floor(
                (new Date() -
                    new Date(last.start_date)) /
                86400000
            );

            if (daysSince <= 2) {
                items.push(
                    `🏃 Dernière activité il y a ${daysSince} jour(s)`
                );
            } else {
                items.push(
                    `🏃 Pense à reprendre l'entraînement`
                );
            }
        }

        if (items.length === 0) {
            items.push(
                "✅ Tout semble calme aujourd'hui"
            );
        }

        return items;
    }, [
        safeTasks,
        safeEvents,
        safeWeather,
        safeServerStatus,
        safeActivities,
    ]);

    const currentHour = new Date().getHours();

    const greeting =
        currentHour < 12
            ? "Bonjour"
            : currentHour < 18
                ? "Bon après-midi"
                : "Bonsoir";

    return (
        <section className="dashboard-card morning-briefing-card">
            <div className="card-header">
                <h2>☀️ Briefing du jour</h2>
            </div>

            <div className="morning-briefing-header">
                <div className="morning-briefing-icon">
                    <Coffee size={24} />
                </div>

                <div>
                    <h3>{greeting} Flo 👋</h3>
                    <p>
                        Voici les informations importantes
                        du jour.
                    </p>
                </div>
            </div>

            <div className="morning-briefing-list">
                {briefing.map((item, index) => (
                    <div
                        key={index}
                        className="morning-briefing-item"
                    >
                        {item}
                    </div>
                ))}
            </div>
        </section>
    );
}

export default MorningBriefingCard;