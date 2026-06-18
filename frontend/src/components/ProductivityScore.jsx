import { Gauge } from "lucide-react";
import { useTasks } from "../context/TasksContext";
import { useProjects } from "../context/ProjectsContext";
import { useGoals } from "../context/GoalsContext";

function ProductivityScore() {
    const { tasks } = useTasks();
    const { projects } = useProjects();
    const { goals } = useGoals();


    const safeTasks = Array.isArray(tasks) ? tasks : []
    const safeProjects = Array.isArray(projects) ? projects : []
    const safeGoals = Array.isArray(goals) ? goals : []

    const taskScore = safeTasks.length
        ? Math.round(
            (safeTasks.filter((task) => task.status === "Terminé").length /
                safeTasks.length) *
            100
        )
        : 0;

    const projectScore = safeProjects.length
        ? Math.round(
            safeProjects.reduce((sum, project) => sum + Number(project.progress), 0) /
            safeProjects.length
        )
        : 0;

    const goalScore = safeGoals.length
        ? Math.round(
            safeGoals.reduce((sum, goal) => sum + Number(goal.progress), 0) /
            safeGoals.length
        )
        : 0;

    const globalScore = Math.round((taskScore + projectScore + goalScore) / 3);

    return (
        <section className="dashboard-card productivity-card">
            <div className="card-header">
                <h2>📈 Score productivité</h2>
            </div>

            <div className="score-main">
                <div className="score-circle">
                    <Gauge size={30} />
                    <strong>{globalScore}%</strong>
                </div>

                <div className="score-details">
                    <p>Tâches <span>{taskScore}%</span></p>
                    <p>Projets <span>{projectScore}%</span></p>
                    <p>Objectifs <span>{goalScore}%</span></p>
                </div>
            </div>
        </section>
    );
}

export default ProductivityScore;