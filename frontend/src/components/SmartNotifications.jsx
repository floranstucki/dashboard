import { useEffect } from "react";
import { useNotifications } from "../context/NotificationsContext";
import { useTasks } from "../context/TasksContext";
import { useGoals } from "../context/GoalsContext";
import { useCalendar } from "../context/CalendarContext";
import { useFinances } from "../context/FinancesContext";

function SmartNotifications() {
    const { addNotification } = useNotifications();

    const { tasks } = useTasks();
    const { goals } = useGoals();
    const { sortedEvents } = useCalendar();
    const { items } = useFinances();


    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const safeGoals = Array.isArray(goals) ? goals : [];
    const safeSortedEvents = Array.isArray(sortedEvents) ? sortedEvents : [];
    const safeItems = Array.isArray(items) ? items : [];

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

        safeTasks.forEach((task) => {
            if (task.priority === "Haute" && task.status !== "Terminé") {
                push(
                    `task-${task.id}`,
                    "Tâche prioritaire",
                    `"${task.title}" nécessite votre attention.`
                );
            }
        });

        safeGoals.forEach((goal) => {
            if (Number(goal.progress) >= 80 && Number(goal.progress) < 100) {
                push(
                    `goal-${goal.id}`,
                    "Objectif presque atteint",
                    `${goal.title} est à ${goal.progress}%`
                );
            }
        });

        const today = new Date().toISOString().split("T")[0];

        safeSortedEvents.forEach((event) => {
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
    }, [safeTasks, safeGoals, safeSortedEvents, safeItems, addNotification]);

    return null;
}

export default SmartNotifications;