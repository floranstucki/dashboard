import { useMemo, useState } from "react";
import { useNotes } from "../context/NotesContext";
import AppLayout from "../components/AppLayout";
import PageHeader from "../components/PageHeader";
function Notes() {
    const {
        notes,
        notesLoading,
        notesError,
        addNote,
        deleteNote,
    } = useNotes();

    const [title, setTitle] = useState("");
    const [tag, setTag] = useState("React");
    const [content, setContent] = useState("");
    const [search, setSearch] = useState("");

    const filteredNotes = useMemo(() => {
        const cleanSearch = search.toLowerCase().trim();

        if (!cleanSearch) return notes;

        return notes.filter((note) => {
            return (
                note.title.toLowerCase().includes(cleanSearch) ||
                note.tag.toLowerCase().includes(cleanSearch) ||
                note.content.toLowerCase().includes(cleanSearch)
            );
        });
    }, [notes, search]);

    const handleAddNote = () => {
        if (!title.trim() || !content.trim()) return;

        addNote({
            title: title.trim(),
            tag,
            content: content.trim(),
        });

        setTitle("");
        setContent("");
    };

    return (
        <AppLayout>
            <PageHeader
                title="Notes techniques"
                subtitle="Ta base de connaissances personnelle."
            />

            <section className="dashboard-card notes-form-card">
                <div className="card-header">
                    <h2>✍️ Nouvelle note</h2>
                    <button onClick={handleAddNote}>+ Ajouter</button>
                </div>

                <div className="notes-form">
                    <input
                        type="text"
                        placeholder="Titre de la note..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

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
                </div>

                <textarea
                    className="notes-textarea"
                    placeholder="Contenu, commande, erreur, solution..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </section>

            <section className="dashboard-card notes-list-card">
                <div className="card-header">
                    <h2>📚 Mes notes</h2>
                </div>

                <input
                    className="notes-search"
                    type="text"
                    placeholder="Rechercher une note..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <div className="notes-grid">
                    {notesLoading && (
                        <p className="empty-state">Chargement des notes...</p>
                    )}

                    {notesError && (
                        <p className="empty-state">{notesError}</p>
                    )}

                    {!notesLoading &&
                        !notesError &&
                        filteredNotes.length === 0 && (
                            <p className="empty-state">Aucune note trouvée.</p>
                        )}

                    {!notesLoading &&
                        !notesError &&
                        filteredNotes.map((note) => (
                            <article className="note-card" key={note.id}>
                                <div className="note-top">
                                    <span>{note.tag}</span>
                                    <button onClick={() => deleteNote(note.id)}>×</button>
                                </div>

                                <h3>{note.title}</h3>
                                <p>{note.content}</p>
                                <small>{note.createdAt}</small>
                            </article>
                        ))}
                </div>
            </section>
        </AppLayout>
    );
}

export default Notes;