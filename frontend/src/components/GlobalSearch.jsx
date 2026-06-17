import { useEffect, useMemo, useState } from "react";
import {
    Calendar,
    FileText,
    Home,
    Lightbulb,
    Plus,
    Search,
    Settings,
    Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../context/ProjectsContext";
import { useTasks } from "../context/TasksContext";
import { useGoals } from "../context/GoalsContext";
import { useNotes } from "../context/NotesContext";
import { useIdeas } from "../context/IdeasContext";
import { useFinances } from "../context/FinancesContext";
import { downloadMonthlyReport } from "../utils/downloadPdf";

function GlobalSearch() {
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);

    const { projects } = useProjects();
    const { tasks, addTask } = useTasks();
    const { goals } = useGoals();
    const { notes } = useNotes();
    const { ideas } = useIdeas();
    const { items } = useFinances();

    useEffect(() => {
        const handleShortcut = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setOpen(true);
            }

            if (event.key === "Escape") {
                setOpen(false);
                setQuery("");
            }
        };

        window.addEventListener("keydown", handleShortcut);

        return () => window.removeEventListener("keydown", handleShortcut);
    }, []);

    const commands = useMemo(
        () => [
            {
                type: "Commande",
                title: "Aller au dashboard",
                detail: "Ouvrir la page d’accueil",
                icon: Home,
                action: () => navigate("/dashboard"),
            },
            {
                type: "Commande",
                title: "Créer une tâche rapide",
                detail: "Ajoute une tâche avec le texte recherché",
                icon: Plus,
                action: async () => {
                    if (!query.trim()) return;

                    await addTask({
                        title: query.trim(),
                        project: "Perso",
                        priority: "Moyenne",
                        deadline: "Non définie",
                        recurrence: "Aucune",
                    });

                    setQuery("");
                    setOpen(false);
                },
            },
            {
                type: "Commande",
                title: "Exporter le rapport PDF",
                detail: "Télécharger le rapport mensuel",
                icon: FileText,
                action: () => downloadMonthlyReport(),
            },
            {
                type: "Commande",
                title: "Ouvrir les paramètres",
                detail: "Personnaliser le dashboard",
                icon: Settings,
                action: () => navigate("/settings"),
            },
            {
                type: "Commande",
                title: "Ouvrir les intégrations",
                detail: "Strava, météo, serveur, GitHub",
                icon: Lightbulb,
                action: () => navigate("/integrations"),
            },
        ],
        [navigate, query, addTask]
    );

    const results = useMemo(() => {
        const cleanQuery = query.toLowerCase().trim();

        const searchable = [
            ...commands,

            ...projects.map((item) => ({
                type: "Projet",
                title: item.name,
                detail: item.description || "Projet",
                icon: Target,
                action: () => navigate("/projects"),
            })),

            ...tasks.map((item) => ({
                type: "Tâche",
                title: item.title,
                detail: `${item.project} · ${item.priority} · ${item.status}`,
                icon: Calendar,
                action: () => navigate("/tasks"),
            })),

            ...goals.map((item) => ({
                type: "Objectif",
                title: item.title,
                detail: `${item.category} · ${item.progress}%`,
                icon: Target,
                action: () => navigate("/goals"),
            })),

            ...notes.map((item) => ({
                type: "Note",
                title: item.title,
                detail: `${item.tag} · ${item.content}`,
                icon: FileText,
                action: () => navigate("/notes"),
            })),

            ...ideas.map((item) => ({
                type: "Idée",
                title: item.title,
                detail: `${item.category} · ${item.status}`,
                icon: Lightbulb,
                action: () => navigate("/ideas"),
            })),

            ...items.map((item) => ({
                type: "Finance",
                title: item.description,
                detail: `${item.type} · ${item.category} · CHF ${item.amount}`,
                icon: FileText,
                action: () => navigate("/finances"),
            })),
        ];

        if (!cleanQuery) {
            return searchable.slice(0, 8);
        }

        return searchable
            .filter((item) => {
                return (
                    item.title?.toLowerCase().includes(cleanQuery) ||
                    item.detail?.toLowerCase().includes(cleanQuery) ||
                    item.type?.toLowerCase().includes(cleanQuery)
                );
            })
            .slice(0, 10);
    }, [query, projects, tasks, goals, notes, ideas, items, commands, navigate]);

    const execute = async (result) => {
        await result.action();
        setOpen(false);
        setQuery("");
    };

    return (
        <>
            <div className="global-search" onClick={() => setOpen(true)}>
                <div className="global-search-input">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Ctrl + K pour rechercher ou lancer une commande..."
                        readOnly
                    />
                </div>
            </div>

            {open && (
                <div className="command-palette-overlay">
                    <div className="command-palette">
                        <div className="command-palette-input">
                            <Search size={19} />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Rechercher, ouvrir une page, créer une tâche..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>

                        <div className="command-results">
                            {results.length > 0 ? (
                                results.map((result, index) => {
                                    const Icon = result.icon || Search;

                                    return (
                                        <button
                                            key={`${result.type}-${result.title}-${index}`}
                                            onClick={() => execute(result)}
                                        >
                                            <div className="command-icon">
                                                <Icon size={17} />
                                            </div>

                                            <div>
                                                <span>{result.type}</span>
                                                <strong>{result.title}</strong>
                                                <p>{result.detail}</p>
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <p className="empty-state">Aucun résultat.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default GlobalSearch;