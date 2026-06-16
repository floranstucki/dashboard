import { Bell } from "lucide-react";
import { useNotifications } from "../context/NotificationsContext";

function NotificationsCard() {
    const {
        notifications,
        unreadCount,
        notificationsLoading,
        notificationsError,
        markAsRead,
    } = useNotifications();

    return (
        <section className="dashboard-card notifications-card">
            <div className="card-header">
                <h2>🔔 Notifications</h2>
                <span className="notification-count">{unreadCount}</span>
            </div>

            <div className="smart-list">
                {notificationsLoading && (
                    <p className="empty-state">Chargement des notifications...</p>
                )}

                {notificationsError && (
                    <p className="empty-state">{notificationsError}</p>
                )}

                {!notificationsLoading &&
                    !notificationsError &&
                    notifications.length === 0 && (
                        <p className="empty-state">Aucune notification.</p>
                    )}

                {!notificationsLoading &&
                    !notificationsError &&
                    notifications.slice(0, 5).map((notification) => (
                        <article
                            className={`smart-item ${notification.isRead ? "notification-read" : ""
                                }`}
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                        >
                            <div className="smart-icon">
                                <Bell size={18} />
                            </div>

                            <div>
                                <h3>{notification.title}</h3>
                                <p>{notification.message}</p>
                            </div>
                        </article>
                    ))}
            </div>
        </section>
    );
}

export default NotificationsCard;