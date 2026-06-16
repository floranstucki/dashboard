import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { useAuth } from "./AuthContext";
const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [notificationsLoading, setNotificationsLoading] = useState(true);
    const [notificationsError, setNotificationsError] = useState("");

    const fetchNotifications = async () => {
        try {
            setNotificationsLoading(true);
            setNotificationsError("");

            const response = await apiFetch("/notifications");

            if (!response.ok) {
                throw new Error("Impossible de charger les notifications.");
            }

            const data = await response.json();
            setNotifications(data);
        } catch (error) {
            setNotificationsError(error.message);
        } finally {
            setNotificationsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
        } else {
            setNotificationsLoading(false);
        }
    }, [isAuthenticated]);

    const addNotification = async ({ title, message }) => {
        const response = await apiFetch("/notifications", {
            method: "POST",
            body: JSON.stringify({
                title,
                message,
                isRead: false,
            }),
        });

        if (!response.ok) {
            throw new Error("Impossible d’ajouter la notification.");
        }

        const createdNotification = await response.json();
        setNotifications([createdNotification, ...notifications]);
    };

    const markAsRead = async (id) => {
        const response = await apiFetch(`/notifications/${id}/read`, {
            method: "PUT",
        });

        if (!response.ok) {
            throw new Error("Impossible de marquer la notification comme lue.");
        }

        const updatedNotification = await response.json();

        setNotifications(
            notifications.map((notification) =>
                notification.id === id ? updatedNotification : notification
            )
        );
    };

    const unreadCount = notifications.filter(
        (notification) => !notification.isRead
    ).length;

    return (
        <NotificationsContext.Provider
            value={{
                notifications,
                unreadCount,
                notificationsLoading,
                notificationsError,
                fetchNotifications,
                addNotification,
                markAsRead,
            }}
        >
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationsContext);

    if (!context) {
        throw new Error(
            "useNotifications doit être utilisé dans NotificationsProvider"
        );
    }

    return context;
}