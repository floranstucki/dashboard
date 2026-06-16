import { useState } from "react";
import { Plus } from "lucide-react";
import { useTasks } from "../context/TasksContext";
import { useIdeas } from "../context/IdeasContext";
import { useCalendar } from "../context/CalendarContext";
import { useNotes } from "../context/NotesContext";
import { useFinances } from "../context/FinancesContext";
import { useNotifications } from "../context/NotificationsContext";

function QuickActions() {
    const { addTask } = useTasks();
    const { addIdea } = useIdeas();
    const { addEvent } = useCalendar();
    const { addNote } = useNotes();
    const { addFinanceItem } = useFinances();
    const { addNotification } = useNotifications();

    const [type, setType] = useState("Tâche");
    const [title, setTitle] = useState("");

    const [project, setProject] = useState("Perso");
    const [priority, setPriority] = useState("Moyenne");
    const [deadline, setDeadline] = useState("");
    const [recurrence, setRecurrence] = useState("Aucune");

    const [category, setCategory] = useState("Perso");

    const [eventDate, setEventDate] = useState("");
    const [eventTime, setEventTime] = useState("");

    const [tag, setTag] = useState("Autre");
    const [content, setContent] = useState("");

    const [financeType, setFinanceType] = useState("Dépense");
    const [financeAmount, setFinanceAmount] = useState("");

    const resetForm = () => {
        setTitle("");
        setProject("Perso");
        setPriority("Moyenne");
        setDeadline("");
        setRecurrence("Aucune");
        setCategory("Perso");
        setEventDate("");
        setEventTime("");
        setTag("Autre");
        setContent("");
        setFinanceType("Dépense");
        setFinanceAmount("");
    };

    const handleSubmit = async () => {
        if (!title.trim()) return;

        if (type === "Finance" && (!financeAmount || Number(financeAmount) <= 0)) {
            return;
        }

        if (type === "Tâche") {
            await addTask({
                title: title.trim(),
                project,
                priority,
                deadline: deadline || "Non définie",
                recurrence,
            });
        }

        if (type === "Idée") {
            await addIdea({
                title: title.trim(),
                category,
                content: content.trim() || "Idée rapide",
            });
        }

        if (type === "Événement") {
            await addEvent({
                title: title.trim(),
                category,
                date: eventDate || new Date().toISOString().split("T")[0],
                time: eventTime || "Toute la journée",
            });
        }

        if (type === "Note") {
            await addNote({
                title: title.trim(),
                tag,
                content: content.trim() || "Note rapide",
            });
        }

        if (type === "Finance") {
            await addFinanceItem({
                description: title.trim(),
                type: financeType,
                category,
                amount: Number(financeAmount),
            });
        }

        await addNotification({
            title: "Action rapide ajoutée",
            message: `${type} "${title.trim()}" ajouté avec succès.`,
        });

        resetForm();
    };

    return (
        <section className="dashboard-card quick-actions-card">
            <div className="card-header">
                <h2>⚡ Actions rapides</h2>
                <button onClick={handleSubmit}>
                    <Plus size={16} />
                    Ajouter
                </button>
            </div>

            <div className="quick-actions-form">
                <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option>Tâche</option>
                    <option>Note</option>
                    <option>Idée</option>
                    <option>Finance</option>
                    <option>Événement</option>
                </select>

                <input
                    type="text"
                    placeholder={
                        type === "Finance"
                            ? "Description..."
                            : type === "Note"
                                ? "Titre de la note..."
                                : type === "Idée"
                                    ? "Titre de l'idée..."
                                    : type === "Événement"
                                        ? "Nom de l'événement..."
                                        : "Nom de la tâche..."
                    }
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSubmit();
                    }}
                />

                {type === "Tâche" && (
                    <>
                        <select value={project} onChange={(e) => setProject(e.target.value)}>
                            <option>FinScope</option>
                            <option>Signal FC</option>
                            <option>Serveur</option>
                            <option>Emploi</option>
                            <option>Sport</option>
                            <option>Perso</option>
                        </select>

                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option>Basse</option>
                            <option>Moyenne</option>
                            <option>Haute</option>
                            <option>Urgente</option>
                        </select>

                        <select
                            value={recurrence}
                            onChange={(e) => setRecurrence(e.target.value)}
                        >
                            <option>Aucune</option>
                            <option>Quotidienne</option>
                            <option>Hebdomadaire</option>
                            <option>Mensuelle</option>
                        </select>

                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                        />
                    </>
                )}

                {type === "Idée" && (
                    <>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option>FinScope</option>
                            <option>Signal FC</option>
                            <option>Serveur</option>
                            <option>Emploi</option>
                            <option>Sport</option>
                            <option>Perso</option>
                            <option>Autre</option>
                        </select>

                        <input
                            type="text"
                            placeholder="Description rapide..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSubmit();
                            }}
                        />
                    </>
                )}

                {type === "Événement" && (
                    <>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option>Projet</option>
                            <option>FinScope</option>
                            <option>Signal FC</option>
                            <option>Serveur</option>
                            <option>Emploi</option>
                            <option>Sport</option>
                            <option>Perso</option>
                        </select>

                        <input
                            type="date"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                        />

                        <input
                            type="time"
                            value={eventTime}
                            onChange={(e) => setEventTime(e.target.value)}
                        />
                    </>
                )}

                {type === "Note" && (
                    <>
                        <select value={tag} onChange={(e) => setTag(e.target.value)}>
                            <option>React</option>
                            <option>Quarkus</option>
                            <option>WordPress</option>
                            <option>Linux</option>
                            <option>CSS</option>
                            <option>FinScope</option>
                            <option>Signal FC</option>
                            <option>Autre</option>
                        </select>

                        <input
                            type="text"
                            placeholder="Contenu rapide..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSubmit();
                            }}
                        />
                    </>
                )}

                {type === "Finance" && (
                    <>
                        <select
                            value={financeType}
                            onChange={(e) => setFinanceType(e.target.value)}
                        >
                            <option>Revenu</option>
                            <option>Dépense</option>
                            <option>Épargne</option>
                            <option>Abonnement</option>
                        </select>

                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option>Perso</option>
                            <option>Alimentation</option>
                            <option>Transport</option>
                            <option>Logement</option>
                            <option>Salaire</option>
                            <option>Sport</option>
                            <option>Projet</option>
                            <option>Autre</option>
                        </select>

                        <input
                            type="number"
                            min="0"
                            step="0.05"
                            placeholder="Montant CHF"
                            value={financeAmount}
                            onChange={(e) => setFinanceAmount(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSubmit();
                            }}
                        />
                    </>
                )}
            </div>
        </section>
    );
}

export default QuickActions;