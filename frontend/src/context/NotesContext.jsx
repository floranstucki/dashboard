import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { useAuth } from "./AuthContext";
const NotesContext = createContext(null);

export function NotesProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [notes, setNotes] = useState([]);
    const [notesLoading, setNotesLoading] = useState(true);
    const [notesError, setNotesError] = useState("");

    const fetchNotes = async () => {
        try {
            setNotesLoading(true);
            setNotesError("");

            const response = await apiFetch(`/notes`);

            if (!response.ok) {
                throw new Error("Impossible de charger les notes.");
            }

            const data = await response.json();
            setNotes(Array.isArray(data) ? data : []);
        } catch (error) {
            setNotesError(error.message);
        } finally {
            setNotesLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotes();
        } else {
            setNotesLoading(false);
        }
    }, [isAuthenticated]);

    const addNote = async (note) => {
        const response = await apiFetch(`/notes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                createdAt: "Aujourd’hui",
                ...note,
            }),
        });

        if (!response.ok) {
            throw new Error("Impossible d’ajouter la note.");
        }

        const createdNote = await response.json();
        setNotes([createdNote, ...notes]);
    };

    const deleteNote = async (id) => {
        const response = await apiFetch(`/notes/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Impossible de supprimer la note.");
        }

        setNotes(notes.filter((note) => note.id !== id));
    };

    return (
        <NotesContext.Provider
            value={{
                notes,
                notesLoading,
                notesError,
                fetchNotes,
                addNote,
                deleteNote,
            }}
        >
            {children}
        </NotesContext.Provider>
    );
}

export function useNotes() {
    const context = useContext(NotesContext);

    if (!context) {
        throw new Error("useNotes doit être utilisé dans NotesProvider");
    }

    return context;
}