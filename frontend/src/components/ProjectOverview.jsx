import {
    BriefcaseBusiness,
    Code2,
    Globe2,
    Server,
    Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useProjects } from "../context/ProjectsContext";

function ProjectsOverview() {
    const { projects } = useProjects();

    const getIcon = (projectName) => {
        const cleanName = projectName.toLowerCase();

        if (cleanName.includes("finscope")) return Code2;
        if (cleanName.includes("signal")) return Globe2;
        if (cleanName.includes("serveur")) return Server;
        if (cleanName.includes("emploi")) return BriefcaseBusiness;
        if (cleanName.includes("sport")) return Trophy;

        return Code2;
    };

    return (
        <section className="dashboard-card projects-overview">
            <div className="card-header">
                <h2>🚀 Projets actifs</h2>
                <Link className="card-header-link" to="/projects">
                    Voir tout
                </Link>
            </div>

            <div className="projects-grid">
                {projects.slice(0, 5).map((project) => {
                    const Icon = getIcon(project.name);

                    return (
                        <article className="project-card" key={project.id}>
                            <div className="project-top">
                                <div className="project-icon">
                                    <Icon size={20} />
                                </div>

                                <span>{project.status}</span>
                            </div>

                            <h3>{project.name}</h3>
                            <p>{project.description}</p>

                            <div className="project-progress-info">
                                <span>Progression</span>
                                <strong>{project.progress}%</strong>
                            </div>

                            <div className="project-progress">
                                <div style={{ width: `${project.progress}%` }} />
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

export default ProjectsOverview;