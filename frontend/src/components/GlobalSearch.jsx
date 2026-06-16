import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useProjects } from "../context/ProjectsContext";
import { useTasks } from "../context/TasksContext";
import { useGoals } from "../context/GoalsContext";
import { useNotes } from "../context/NotesContext";
import { useIdeas } from "../context/IdeasContext";
import { useFinances } from "../context/FinancesContext";

function GlobalSearch() {
    const [query, setQuery] = useState("");

    const { projects } = useProjects();
    const { tasks } = useTasks();
    const { goals } = useGoals();
    const { notes } = useNotes();
    const { ideas } = useIdeas();
    const { items } = useFinances();

    const results = useMemo(() => {
        const cleanQuery = query.toLowerCase().trim();

        if (!cleanQuery) return [];

        const allResults = [
            ...projects.map((item) => ({
                type: "Projet",
                title: item.name,
                detail: item.description,
                link: "/projects",
            })),

            ...tasks.map((item) => ({
                type: "Tâche",
                title: item.title,
                detail: `${item.project} · ${item.priority} · ${item.status}`,
                link: "/tasks",
            })),

            ...goals.map((item) => ({
                type: "Objectif",
                title: item.title,
                detail: `${item.category} · ${item.progress}%`,
                link: "/goals",
            })),

            ...notes.map((item) => ({
                type: "Note",
                title: item.title,
                detail: `${item.tag} · ${item.content}`,
                link: "/notes",
            })),

            ...ideas.map((item) => ({
                type: "Idée",
                title: item.title,
                detail: `${item.category} · ${item.priority} · ${item.status}`,
                link: "/ideas",
            })),

            ...items.map((item) => ({
                type: "Finance",
                title: item.description,
                detail: `${item.type} · ${item.category} · CHF ${item.amount}`,
                link: "/finances",
            })),
        ];

        return allResults
            .filter((item) => {
                return (
                    item.title.toLowerCase().includes(cleanQuery) ||
                    item.detail.toLowerCase().includes(cleanQuery) ||
                    item.type.toLowerCase().includes(cleanQuery)
                );
            })
            .slice(0, 8);
    }, [query, projects, tasks, goals, notes, ideas, items]);

    return (
        <div className="global-search">
            <div className="global-search-input">
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Rechercher partout..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            {results.length > 0 && (
                <div className="global-search-results">
                    {results.map((result, index) => (
                        <a href={result.link} key={`${result.type}-${index}`}>
                            <span>{result.type}</span>
                            <strong>{result.title}</strong>
                            <p>{result.detail}</p>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

export default GlobalSearch;