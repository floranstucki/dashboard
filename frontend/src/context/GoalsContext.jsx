import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { useAuth } from "./AuthContext";
import { resetSmartNotifications } from "../utils/smartNotifications";
const GoalsContext = createContext(null);

export function GoalsProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [goals, setGoals] = useState([]);
    const [goalsLoading, setGoalsLoading] = useState(true);
    const [goalsError, setGoalsError] = useState("");

    const fetchGoals = async () => {
        try {
            setGoalsLoading(true);
            setGoalsError("");

            const response = await apiFetch(`/goals`);

            if (!response.ok) {
                throw new Error("Impossible de charger les objectifs.");
            }

            const data = await response.json();
            setGoals(Array.isArray(data) ? data : []);
        } catch (error) {
            setGoalsError(error.message);
        } finally {
            setGoalsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchGoals();
        } else {
            setGoalsLoading(false);
        }
    }, [isAuthenticated]);

    const addGoal = async (goal) => {
        const response = await apiFetch(`/goals`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                deadline: "Non définie",
                ...goal,
            }),
        });

        if (!response.ok) {
            throw new Error("Impossible d’ajouter l’objectif.");
        }

        const createdGoal = await response.json();
        resetSmartNotifications();
        setGoals([createdGoal, ...goals]);
    };

    const deleteGoal = async (id) => {
        const response = await apiFetch(`/goals/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Impossible de supprimer l’objectif.");
        }
        resetSmartNotifications();
        setGoals(goals.filter((goal) => goal.id !== id));
    };

    const updateGoalProgress = async (id, progress) => {
        const goal = goals.find((item) => item.id === id);

        if (!goal) return;

        const updatedGoal = {
            ...goal,
            progress: Number(progress),
        };

        const response = await apiFetch(`/goals/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedGoal),
        });

        if (!response.ok) {
            throw new Error("Impossible de modifier l’objectif.");
        }

        const savedGoal = await response.json();
        resetSmartNotifications();
        setGoals(goals.map((item) => (item.id === id ? savedGoal : item)));
    };

    return (
        <GoalsContext.Provider
            value={{
                goals,
                goalsLoading,
                goalsError,
                fetchGoals,
                addGoal,
                deleteGoal,
                updateGoalProgress,
            }}
        >
            {children}
        </GoalsContext.Provider>
    );
}

export function useGoals() {
    const context = useContext(GoalsContext);

    if (!context) {
        throw new Error("useGoals doit être utilisé dans GoalsProvider");
    }

    return context;
}