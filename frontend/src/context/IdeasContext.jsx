import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { useAuth } from "./AuthContext";
const IdeasContext = createContext(null);

export function IdeasProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [ideas, setIdeas] = useState([]);
    const [ideasLoading, setIdeasLoading] = useState(true);
    const [ideasError, setIdeasError] = useState("");

    const fetchIdeas = async () => {
        try {
            setIdeasLoading(true);
            setIdeasError("");

            const response = await apiFetch(`/ideas`);

            if (!response.ok) {
                throw new Error("Impossible de charger les idées.");
            }

            const data = await response.json();
            setIdeas(Array.isArray(data) ? data : []);
        } catch (error) {
            setIdeasError(error.message);
        } finally {
            setIdeasLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchIdeas();
        } else {
            setIdeasLoading(false);
        }
    }, [isAuthenticated]);

    const addIdea = async (idea) => {
        const response = await apiFetch(`/ideas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                status: "À explorer",
                createdAt: "Aujourd’hui",
                ...idea,
            }),
        });

        if (!response.ok) {
            throw new Error("Impossible d’ajouter l’idée.");
        }

        const createdIdea = await response.json();
        setIdeas([createdIdea, ...ideas]);
    };

    const deleteIdea = async (id) => {
        const response = await apiFetch(`/ideas/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Impossible de supprimer l’idée.");
        }
        setIdeas(ideas.filter((idea) => idea.id !== id));
    };

    const updateIdeaStatus = async (id, status) => {
        const idea = ideas.find((item) => item.id === id);

        if (!idea) return;

        const updatedIdea = {
            ...idea,
            status,
        };

        const response = await apiFetch(`/ideas/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedIdea),
        });

        if (!response.ok) {
            throw new Error("Impossible de modifier l’idée.");
        }

        const savedIdea = await response.json();
        setIdeas(
            ideas.map((item) =>
                item.id === id ? savedIdea : item
            )
        );
    };

    return (
        <IdeasContext.Provider
            value={{
                ideas,
                ideasLoading,
                ideasError,
                fetchIdeas,
                addIdea,
                deleteIdea,
                updateIdeaStatus,
            }}
        >
            {children}
        </IdeasContext.Provider>
    );
}

export function useIdeas() {
    const context = useContext(IdeasContext);

    if (!context) {
        throw new Error(
            "useIdeas doit être utilisé dans IdeasProvider"
        );
    }

    return context;
}