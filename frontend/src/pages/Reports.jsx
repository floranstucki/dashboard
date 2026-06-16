import AppLayout from "../components/AppLayout";
import PageHeader from "../components/PageHeader";
import { FileText, Download, BarChart3 } from "lucide-react";
import { downloadMonthlyReport } from "../utils/downloadPdf";
import { useNotifications } from "../context/NotificationsContext";
function Reports() {
    const { addNotification } = useNotifications();
    const handleDownloadReport = async () => {
        await downloadMonthlyReport();

        await addNotification({
            title: "Rapport mensuel généré",
            message: "Ton rapport PDF a été téléchargé avec succès.",
        });
    };
    return (
        <AppLayout>
            <PageHeader
                title="Rapports"
                subtitle="Télécharge tes rapports et analyse ton activité."
            />

            <section className="dashboard-card reports-page-card">
                <div className="reports-main-icon">
                    <FileText size={34} />
                </div>

                <div>
                    <h2>Rapport mensuel</h2>
                    <p>
                        Génère un PDF avec tes projets, tâches, objectifs, finances et
                        graphiques.
                    </p>
                </div>

                <button onClick={handleDownloadReport}>
                    <Download size={18} />
                    Télécharger PDF
                </button>
            </section>

            <section className="dashboard-card reports-future-card">
                <div className="card-header">
                    <h2>📊 Prochainement</h2>
                </div>

                <div className="reports-feature-grid">
                    <article>
                        <BarChart3 size={22} />
                        <h3>Rapport annuel</h3>
                        <p>Vue globale sur toute l’année.</p>
                    </article>

                    <article>
                        <BarChart3 size={22} />
                        <h3>Export CSV</h3>
                        <p>Exporter les données brutes.</p>
                    </article>

                    <article>
                        <BarChart3 size={22} />
                        <h3>Historique</h3>
                        <p>Consulter les anciens rapports.</p>
                    </article>
                </div>
            </section>
        </AppLayout>
    );
}

export default Reports;