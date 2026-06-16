import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { useAuth } from "./AuthContext";
import { useNotifications } from "./NotificationsContext";
import { resetSmartNotifications } from "../utils/smartNotifications";
const TasksContext = createContext(null);

export function TasksProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [tasksLoading, setTasksLoading] = useState(true);
    const [tasksError, setTasksError] = useState("");
    const { addNotification } = useNotifications();

    const fetchTasks = async () => {
        try {
            setTasksLoading(true);
            setTasksError("");

            const response = await apiFetch(`/tasks`);

            if (!response.ok) {
                throw new Error("Impossible de charger les tâches.");
            }

            const data = await response.json();
            setTasks(data);
        } catch (error) {
            setTasksError(error.message);
        } finally {
            setTasksLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchTasks();
        } else {
            setTasksLoading(false);
        }
    }, [isAuthenticated]);

    const addTask = async (task) => {
        const response = await apiFetch(`/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                status: "À faire",
                deadline: "Non définie",
                recurrence: "Aucune",
                ...task,
            }),
        });

        if (!response.ok) {
            throw new Error("Impossible d’ajouter la tâche.");
        }

        const createdTask = await response.json();
        resetSmartNotifications();
        setTasks([createdTask, ...tasks]);
    };

    const deleteTask = async (id) => {
        const response = await apiFetch(`/tasks/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Impossible de supprimer la tâche.");
        }
        resetSmartNotifications();
        setTasks(tasks.filter((task) => task.id !== id));
    };
    const getNextDeadline = (deadline, recurrence) => {
        if (!deadline || deadline === "Non définie" || recurrence === "Aucune") {
            return "Non définie";
        }

        const date = new Date(deadline);

        if (Number.isNaN(date.getTime())) {
            return "Non définie";
        }

        if (recurrence === "Quotidienne") {
            date.setDate(date.getDate() + 1);
        }

        if (recurrence === "Hebdomadaire") {
            date.setDate(date.getDate() + 7);
        }

        if (recurrence === "Mensuelle") {
            date.setMonth(date.getMonth() + 1);
        }

        return date.toISOString().split("T")[0];
    };

    const changeTaskStatus = async (id) => {
        const task = tasks.find((item) => item.id === id);

        if (!task) return;

        const nextStatus =
            task.status === "À faire"
                ? "En cours"
                : task.status === "En cours"
                    ? "Terminé"
                    : "À faire";

        const updatedTask = {
            ...task,
            status: nextStatus,
        };

        const response = await apiFetch(`/tasks/${id}`, {
            method: "PUT",
            body: JSON.stringify(updatedTask),
        });

        if (!response.ok) {
            throw new Error("Impossible de modifier la tâche.");
        }

        const savedTask = await response.json();

        let updatedTasks = tasks.map((item) =>
            item.id === id ? savedTask : item
        );

        if (
            nextStatus === "Terminé" &&
            task.recurrence &&
            task.recurrence !== "Aucune"
        ) {
            const nextTask = {
                title: task.title,
                project: task.project,
                priority: task.priority,
                status: "À faire",
                deadline: getNextDeadline(task.deadline, task.recurrence),
                recurrence: task.recurrence,
            };

            const createResponse = await apiFetch("/tasks", {
                method: "POST",
                body: JSON.stringify(nextTask),
            });

            if (createResponse.ok) {
                const createdTask = await createResponse.json();
                resetSmartNotifications();
                updatedTasks = [createdTask, ...updatedTasks];

                await addNotification({
                    title: "Tâche récurrente créée",
                    message: `"${task.title}" a été replanifiée au ${createdTask.deadline}.`,
                });
            }
        }

        setTasks(updatedTasks);
    };

    const fetchSubTasks = async (taskId) => {
        const response = await apiFetch(`/tasks/${taskId}/subtasks`);

        if (!response.ok) {
            throw new Error("Impossible de charger les sous-tâches.");
        }

        return await response.json();
    };

    const addSubTask = async (taskId, title) => {
        const response = await apiFetch(`/tasks/${taskId}/subtasks`, {
            method: "POST",
            body: JSON.stringify({ title }),
        });

        if (!response.ok) {
            throw new Error("Impossible d’ajouter la sous-tâche.");
        }

        return await response.json();
    };

    const toggleSubTask = async (taskId, subTaskId) => {
        const response = await apiFetch(
            `/tasks/${taskId}/subtasks/${subTaskId}/toggle`,
            {
                method: "PUT",
            }
        );

        if (!response.ok) {
            throw new Error("Impossible de modifier la sous-tâche.");
        }

        return await response.json();
    };

    const deleteSubTask = async (taskId, subTaskId) => {
        const response = await apiFetch(`/tasks/${taskId}/subtasks/${subTaskId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Impossible de supprimer la sous-tâche.");
        }
    };
    return (
        <TasksContext.Provider
            value={{
                tasks,
                tasksLoading,
                tasksError,
                fetchTasks,
                addTask,
                deleteTask,
                changeTaskStatus,
                fetchSubTasks,
                addSubTask,
                toggleSubTask,
                deleteSubTask,
            }}
        >
            {children}
        </TasksContext.Provider>
    );
}

export function useTasks() {
    const context = useContext(TasksContext);

    if (!context) {
        throw new Error("useTasks doit être utilisé dans TasksProvider");
    }

    return context;
}