import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../utils/api";
import { useAuth } from "./AuthContext";
import { resetSmartNotifications } from "../utils/smartNotifications";
const CalendarContext = createContext(null);

export function CalendarProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState("");

    const fetchEvents = async () => {
        try {
            setEventsLoading(true);
            setEventsError("");

            const response = await apiFetch(`/calendar`);

            if (!response.ok) {
                throw new Error("Impossible de charger les événements.");
            }

            const data = await response.json();
            setEvents(data);
        } catch (error) {
            setEventsError(error.message);
        } finally {
            setEventsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchEvents();
        } else {
            setEventsLoading(false);
        }
    }, [isAuthenticated]);

    const sortedEvents = useMemo(() => {
        return [...events].sort((a, b) => {
            return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
        });
    }, [events]);

    const addEvent = async (event) => {
        const response = await apiFetch(`/calendar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                time: "Toute la journée",
                ...event,
            }),
        });

        if (!response.ok) {
            throw new Error("Impossible d’ajouter l’événement.");
        }

        const createdEvent = await response.json();
        resetSmartNotifications();
        setEvents([createdEvent, ...events]);
    };

    const deleteEvent = async (id) => {
        const response = await apiFetch(`/calendar/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Impossible de supprimer l’événement.");
        }
        resetSmartNotifications();
        setEvents(events.filter((event) => event.id !== id));
    };

    return (
        <CalendarContext.Provider
            value={{
                events,
                sortedEvents,
                eventsLoading,
                eventsError,
                fetchEvents,
                addEvent,
                deleteEvent,
            }}
        >
            {children}
        </CalendarContext.Provider>
    );
}

export function useCalendar() {
    const context = useContext(CalendarContext);

    if (!context) {
        throw new Error("useCalendar doit être utilisé dans CalendarProvider");
    }

    return context;
}