import { NavLink } from "react-router-dom";
import {
    Home,
    FolderKanban,
    CheckSquare,
    Calendar,
    Lightbulb,
    BookOpen,
    Server,
    Settings,
    Target,
    Wallet,
    User,
    FileText,
    Flame,
} from "lucide-react";

function Sidebar() {
    const items = [
        { label: "Accueil", icon: Home, path: "/dashboard" },
        { label: "Projets", icon: FolderKanban, path: "/projects" },
        { label: "Tâches", icon: CheckSquare, path: "/tasks" },
        { label: "Calendrier", icon: Calendar, path: "/calendar" },
        { label: "Semaine", icon: Calendar, path: "/week" },
        { label: "Idées", icon: Lightbulb, path: "/ideas" },
        { label: "Notes", icon: BookOpen, path: "/notes" },
        { label: "Serveurs", icon: Server, path: "/servers" },
        { label: "Objectifs", icon: Target, path: "/goals" },
        { label: "Habitudes", icon: Flame, path: "/habits" },
        { label: "Rapports", icon: FileText, path: "/reports" },
        { label: "Finances", icon: Wallet, path: "/finances" },
        { label: "Paramètres", icon: Settings, path: "/settings" },
        { label: "Profil", icon: User, path: "/profile" },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-avatar">F</div>
                <span>Mon Dashboard</span>
            </div>

            <nav className="sidebar-nav">
                {items.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.label}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? "active" : ""}`
                            }
                        >
                            <Icon size={18} />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
}

export default Sidebar;