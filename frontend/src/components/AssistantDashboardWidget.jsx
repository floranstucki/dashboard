import { useMemo } from "react";
import { Bot, Mic } from "lucide-react";
import { useTasks } from "../context/TasksContext";
import { useHabits } from "../context/HabitsContext";
import { useCalendar } from "../context/CalendarContext";

function AssistantDashboardWidget() {
    const { tasks } = useTasks();
    const { habits } = useHabits();
    const { sortedEvents } = useCalendar();

    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const safeHabits = Array.isArray(habits) ? habits : [];
    const safeEvents = Array.isArray(sortedEvents) ? sortedEvents : [];


    const data = useMemo(() => {
        const today = new Date().toISOString().split("T")[0];

        const urgentTasks = safeTasks.filter(
            (task) =>
                task.status !== "Terminé" &&
                (task.priority === "Haute" || task.priority === "Urgente")
        );

        const eventsToday = safeEvents.filter((event) => event.date === today);

        const habitsLeft = safeHabits.filter((habit) => !habit.doneToday);

        const recommendations = [];

        if (urgentTasks.length > 0) {
            recommendations.push(`Commencer par : ${urgentTasks[0].title}`);
        }

        if (eventsToday.length > 0) {
            recommendations.push(`Préparer ${eventsToday.length} événement(s)`);
        }

        if (habitsLeft.length > 0) {
            recommendations.push(`Valider ${habitsLeft.length} habitude(s)`);
        }

        if (recommendations.length === 0) {
            recommendations.push("Tout est calme, avance sur un projet important.");
        }

        return {
            urgentTasks,
            eventsToday,
            habitsLeft,
            recommendations: recommendations.slice(0, 3),
        };
    }, [safeTasks, safeHabits, safeEvents]);

    const launchVoiceBriefing = () => {
        window.dispatchEvent(
            new CustomEvent("assistant-voice-command", {
                detail: "bonjour dashboard",
            })
        );
    };

    return (
        <section className="dashboard-card assistant-dashboard-widget">
            <div className="card-header">
                <h2>🤖 Assistant</h2>

                <button onClick={launchVoiceBriefing}>
                    <Mic size={16} />
                    Briefing
                </button>
            </div>

            <div className="assistant-widget-main">
                <div className="assistant-widget-icon">
                    <Bot size={26} />
                </div>

                <div>
                    <h3>Bonjour Flo</h3>
                    <p>Voici mes recommandations pour aujourd’hui.</p>
                </div>
            </div>

            <div className="assistant-widget-recommendations">
                {data.recommendations.map((item, index) => (
                    <article key={index}>
                        <span>{index + 1}</span>
                        <p>{item}</p>
                    </article>
                ))}
            </div>

            <div className="assistant-widget-stats">
                <div>
                    <span>Tâches urgentes</span>
                    <strong>{data.urgentTasks.length}</strong>
                </div>

                <div>
                    <span>Événements</span>
                    <strong>{data.eventsToday.length}</strong>
                </div>

                <div>
                    <span>Habitudes</span>
                    <strong>{data.habitsLeft.length}</strong>
                </div>
            </div>
        </section>
    );
}

export default AssistantDashboardWidget;