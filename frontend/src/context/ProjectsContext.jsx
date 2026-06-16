import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { useAuth } from "./AuthContext";
import { resetSmartNotifications } from "../utils/smartNotifications";
const ProjectsContext = createContext(null);

export function ProjectsProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [projects, setProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [projectsError, setProjectsError] = useState("");

    const fetchProjects = async () => {
        try {
            setProjectsLoading(true);
            setProjectsError("");

            const response = await apiFetch(`/projects`);

            if (!response.ok) {
                throw new Error("Impossible de charger les projets.");
            }

            const data = await response.json();
            setProjects(data);
        } catch (error) {
            setProjectsError(error.message);
        } finally {
            setProjectsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchProjects();
        } else {
            setProjectsLoading(false);
        }
    }, [isAuthenticated]);

    const addProject = async (project) => {
        const response = await apiFetch(`/projects`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(project),
        });

        if (!response.ok) {
            throw new Error("Impossible d’ajouter le projet.");
        }

        const createdProject = await response.json();
        resetSmartNotifications();
        setProjects([createdProject, ...projects]);
    };

    const deleteProject = async (id) => {
        const response = await apiFetch(`/projects/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Impossible de supprimer le projet.");
        }
        resetSmartNotifications();

        setProjects(projects.filter((project) => project.id !== id));
    };

    const updateProjectProgress = async (id, progress) => {
        const project = projects.find((item) => item.id === id);

        if (!project) return;

        const updatedProject = {
            ...project,
            progress: Number(progress),
        };

        const response = await apiFetch(`/projects/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedProject),
        });

        if (!response.ok) {
            throw new Error("Impossible de modifier le projet.");
        }

        const savedProject = await response.json();
        resetSmartNotifications();
        setProjects(
            projects.map((item) => (item.id === id ? savedProject : item))
        );
    };

    return (
        <ProjectsContext.Provider
            value={{
                projects,
                projectsLoading,
                projectsError,
                fetchProjects,
                addProject,
                deleteProject,
                updateProjectProgress,
            }}
        >
            {children}
        </ProjectsContext.Provider>
    );
}

export function useProjects() {
    const context = useContext(ProjectsContext);

    if (!context) {
        throw new Error("useProjects doit être utilisé dans ProjectsProvider");
    }

    return context;
}