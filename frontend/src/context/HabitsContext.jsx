import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { useAuth } from "./AuthContext";

const HabitsContext = createContext(null);

export function HabitsProvider({ children }) {
    const { isAuthenticated } = useAuth();

    const [habits, setHabits] = useState([]);
    const [habitsLoading, setHabitsLoading] = useState(true);
    const [habitsError, setHabitsError] = useState("");

    const fetchHabits = async () => {
        try {
            setHabitsLoading(true);
            setHabitsError("");

            const response = await apiFetch("/habits");

            if (!response.ok) {
                throw new Error("Impossible de charger les habitudes.");
            }

            const data = await response.json();
            setHabits(Array.isArray(data) ? data : []);
        } catch (error) {
            setHabitsError(error.message);
        } finally {
            setHabitsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchHabits();
        } else {
            setHabits([]);
            setHabitsLoading(false);
        }
    }, [isAuthenticated]);

    const addHabit = async ({ title, frequency }) => {
        const response = await apiFetch("/habits", {
            method: "POST",
            body: JSON.stringify({
                title,
                frequency,
            }),
        });

        if (!response.ok) {
            throw new Error("Impossible d’ajouter l’habitude.");
        }

        const createdHabit = await response.json();
        setHabits([createdHabit, ...habits]);
    };

    const toggleHabitToday = async (id) => {
        const response = await apiFetch(`/habits/${id}/toggle`, {
            method: "PUT",
        });

        if (!response.ok) {
            throw new Error("Impossible de modifier l’habitude.");
        }

        const updatedHabit = await response.json();

        setHabits(
            habits.map((habit) =>
                habit.id === id ? updatedHabit : habit
            )
        );
    };

    const deleteHabit = async (id) => {
        const response = await apiFetch(`/habits/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Impossible de supprimer l’habitude.");
        }

        setHabits(habits.filter((habit) => habit.id !== id));
    };

    return (
        <HabitsContext.Provider
            value={{
                habits,
                habitsLoading,
                habitsError,
                fetchHabits,
                addHabit,
                toggleHabitToday,
                deleteHabit,
            }}
        >
            {children}
        </HabitsContext.Provider>
    );
}

export function useHabits() {
    const context = useContext(HabitsContext);

    if (!context) {
        throw new Error("useHabits doit être utilisé dans HabitsProvider");
    }

    return context;
}