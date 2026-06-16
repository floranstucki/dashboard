import { useState } from "react";
import AppLayout from "../components/AppLayout";
import { BriefcaseBusiness, Code2, Globe2, Server, Trophy } from "lucide-react";
import { useProjects } from "../context/ProjectsContext";
import PageHeader from "../components/PageHeader";

function Projects() {
    const {
        projects,
        projectsLoading,
        projectsError,
        addProject,
        deleteProject,
        updateProjectProgress,
    } = useProjects();

    const [name, setName] = useState("");
    const [status, setStatus] = useState("Actif");
    const [progress, setProgress] = useState(0);
    const [description, setDescription] = useState("");

    const getIcon = (projectName) => {
        const cleanName = projectName.toLowerCase();

        if (cleanName.includes("finscope")) return Code2;
        if (cleanName.includes("signal")) return Globe2;
        if (cleanName.includes("serveur")) return Server;
        if (cleanName.includes("emploi")) return BriefcaseBusiness;
        if (cleanName.includes("sport")) return Trophy;

        return Code2;
    };

    const handleAddProject = () => {
        if (!name.trim() || !description.trim()) return;

        addProject({
            name: name.trim(),
            status,
            progress: Number(progress),
            description: description.trim(),
        });

        setName("");
        setStatus("Actif");
        setProgress(0);
        setDescription("");
    };

    return (
        <AppLayout>
            <PageHeader
                title="Projets"
                subtitle="Gère tous tes projets actifs au même endroit."
            />

            <section className="dashboard-card projects-form-card">
                <div className="card-header">
                    <h2>🚀 Nouveau projet</h2>
                    <button onClick={handleAddProject}>+ Ajouter</button>
                </div>

                <div className="projects-form">
                    <input
                        type="text"
                        placeholder="Nom du projet..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option>Actif</option>
                        <option>Prioritaire</option>
                        <option>En cours</option>
                        <option>Maintenance</option>
                        <option>Personnel</option>
                        <option>En pause</option>
                    </select>

                    <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Progression"
                        value={progress}
                        onChange={(e) => setProgress(e.target.value)}
                    />
                </div>

                <textarea
                    className="projects-textarea"
                    placeholder="Description du projet..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </section>

            <section className="dashboard-card projects-list-card">
                <div className="card-header">
                    <h2>📂 Mes projets</h2>
                </div>
                {projectsLoading && <p className="empty-state">Chargement des projets...</p>}

                {projectsError && <p className="empty-state">{projectsError}</p>}
                <div className="projects-page-grid">
                    {!projectsLoading &&
                        !projectsError &&
                        projects.map((project) => {
                            const Icon = getIcon(project.name);

                            return (
                                <article className="project-page-card" key={project.id}>
                                    <div className="project-page-top">
                                        <div className="project-icon">
                                            <Icon size={20} />
                                        </div>

                                        <div>
                                            <h3>{project.name}</h3>
                                            <span>{project.status}</span>
                                        </div>

                                        <button onClick={() => deleteProject(project.id)}>×</button>
                                    </div>

                                    <p>{project.description}</p>

                                    <div className="project-progress-info">
                                        <span>Progression</span>
                                        <strong>{project.progress}%</strong>
                                    </div>

                                    <input
                                        className="project-range"
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={project.progress}
                                        onChange={(e) =>
                                            updateProjectProgress(project.id, e.target.value)
                                        }
                                    />

                                    <div className="project-progress">
                                        <div style={{ width: `${project.progress}%` }} />
                                    </div>
                                </article>
                            );
                        })}
                </div>
            </section>
        </AppLayout>
    );
}

export default Projects;