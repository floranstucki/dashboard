import {
    Bar,
    BarChart,
    CartesianGrid,
    Pie,
    PieChart,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { useProjects } from "../context/ProjectsContext";
import { useGoals } from "../context/GoalsContext";
import { useFinances } from "../context/FinancesContext";

function DashboardCharts() {
    const { projects } = useProjects();
    const { goals } = useGoals();
    const { totals } = useFinances();

    const projectData = projects.map((project) => ({
        name: project.name,
        progression: Number(project.progress),
    }));

    const goalsData = goals.map((goal) => ({
        name: goal.title,
        progression: Number(goal.progress),
    }));

    const financeData = [
        { name: "Revenus", value: totals.revenus },
        { name: "Dépenses", value: totals.depenses + totals.abonnements },
        { name: "Épargne", value: totals.epargne },
    ].filter((item) => item.value > 0);

    return (
        <div className="dashboard-grid charts-grid">
            <section className="dashboard-card chart-card">
                <div className="card-header">
                    <h2>📈 Progression des projets</h2>
                </div>

                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={projectData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="progression" fill="var(--accent-color)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </section>

            <section className="dashboard-card chart-card">
                <div className="card-header">
                    <h2>🎯 Objectifs</h2>
                </div>

                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={goalsData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="progression" fill="var(--accent-color)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </section>

            <section className="dashboard-card chart-card">
                <div className="card-header">
                    <h2>💰 Répartition financière</h2>
                </div>

                <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                        <Pie
                            data={financeData}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={90}
                            label
                        >
                            {financeData.map((_, index) => (
                                <Cell key={index} fill="var(--accent-color)" />
                            ))}
                        </Pie>

                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </section>
        </div>
    );
}

export default DashboardCharts;