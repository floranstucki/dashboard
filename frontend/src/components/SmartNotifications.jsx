import { useEffect } from "react";
import { useNotifications } from "../context/NotificationsContext";
import { useTasks } from "../context/TasksContext";
import { useGoals } from "../context/GoalsContext";
import { useCalendar } from "../context/CalendarContext";
import { useFinances } from "../context/FinancesContext";

function SmartNotifications() {
    const { addNotification } = useNotifications();

    const { tasks = [] } = useTasks();
    const { goals = [] } = useGoals();
    const { sortedEvents = [] } = useCalendar();
    const { items = [] } = useFinances();

    useEffect(() => {
        const shown = JSON.parse(
            localStorage.getItem("smart-notifications") || "[]"
        );

        const push = (id, title, message) => {
            if (shown.includes(id)) return;

            addNotification({
                title,
                message,
            });

            localStorage.setItem(
                "smart-notifications",
                JSON.stringify([...shown, id])
            );
        };

        tasks.forEach((task) => {
            if (task.priority === "Haute" && task.status !== "Terminé") {
                push(
                    `task-${task.id}`,
                    "Tâche prioritaire",
                    `"${task.title}" nécessite votre attention.`
                );
            }
        });

        goals.forEach((goal) => {
            if (Number(goal.progress) >= 80 && Number(goal.progress) < 100) {
                push(
                    `goal-${goal.id}`,
                    "Objectif presque atteint",
                    `${goal.title} est à ${goal.progress}%`
                );
            }
        });

        const today = new Date().toISOString().split("T")[0];

        sortedEvents.forEach((event) => {
            if (event.date === today) {
                push(
                    `event-${event.id}`,
                    "Événement aujourd'hui",
                    event.title
                );
            }
        });

        const balance = items.reduce((total, item) => {
            const amount = Number(item.amount);

            if (item.type === "Revenu") return total + amount;
            if (item.type === "Dépense") return total - amount;
            if (item.type === "Épargne") return total - amount;

            return total;
        }, 0);

        if (balance < 0) {
            push(
                "negative-balance",
                "Attention",
                "Votre solde est actuellement négatif."
            );
        }
    }, [tasks, goals, sortedEvents, items, addNotification]);

    return null;
}

export default SmartNotifications;