import { useState } from "react";
import AppLayout from "../components/AppLayout";
import { Download, RotateCcw, Upload } from "lucide-react";
import {
    DEFAULT_SETTINGS,
    getSettings,
    saveSettings,
    SETTINGS_KEY,
} from "../utils/settings";
import PageHeader from "../components/PageHeader";
const DATA_KEYS = [
    "home-dashboard-settings",
    "smart-notifications",
];

const DASHBOARD_WIDGETS = [
    { key: "morningBriefing", label: "Briefing du matin" },
    { key: "personalAssistant", label: "Assistant personnel" },
    { key: "mainGoal", label: "Objectif principal" },
    { key: "weather", label: "Météo trail" },
    { key: "serverStatus", label: "Serveur maison" },
    { key: "strava", label: "Strava" },
    { key: "sportGoal", label: "Objectif sport" },
    { key: "smartAlerts", label: "Alertes intelligentes" },
    { key: "habits", label: "Habitudes" },
    { key: "priority", label: "Priorités" },
    { key: "productivity", label: "Score productivité" },
    { key: "notifications", label: "Notifications" },
    { key: "assistant", label: "Assistant" },
    { key: "search", label: "Recherche globale" },
    { key: "quickActions", label: "Actions rapides" },
    { key: "focus", label: "Focus du jour" },
    { key: "github", label: "GitHub" },
    { key: "inbox", label: "Inbox idées" },
    { key: "projects", label: "Projets" },
    { key: "planning", label: "Planning" },
    { key: "attention", label: "À surveiller" },
    { key: "upcomingEvents", label: "Événements à venir" },
    { key: "metrics", label: "Métriques" },
    { key: "advancedStats", label: "Stats avancées" },
    { key: "charts", label: "Graphiques" },
    { key: "goalForecast", label: "Prévision objectifs" },
    { key: "signalFc", label: "Signal FC" },
    { key: "heatmap", label: "Heatmap activité" },
    { key: "dailyScore", label: "Score du jour" },
    { key: "dailyScoreHistory", label: "Historique du score" },
];
function Settings() {

    const [settings, setSettings] = useState(getSettings());
    const updateSettings = (newSettings) => {
        setSettings(newSettings);
        saveSettings(newSettings);
        window.dispatchEvent(new Event("dashboard-settings-updated"));
    };


    const handleExport = () => {
        const exportData = {
            settings,
            data: {},
        };

        DATA_KEYS.forEach((key) => {
            exportData.data[key] = localStorage.getItem(key);
        });

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: "application/json",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "home-dashboard-backup.json";
        link.click();

        URL.revokeObjectURL(url);
    };

    const handleImport = (event) => {
        const file = event.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            const importedData = JSON.parse(reader.result);

            if (importedData.settings) {
                saveSettings(importedData.settings);
            }

            if (importedData.data) {
                Object.entries(importedData.data).forEach(([key, value]) => {
                    if (value) {
                        localStorage.setItem(key, value);
                    }
                });
            }

            window.location.reload();
        };

        reader.readAsText(file);
    };

    const handleReset = () => {
        const confirmReset = window.confirm(
            "Tu es sûr de vouloir supprimer toutes les données du dashboard ?"
        );

        if (!confirmReset) return;

        DATA_KEYS.forEach((key) => localStorage.removeItem(key));
        localStorage.removeItem(SETTINGS_KEY);

        saveSettings(DEFAULT_SETTINGS);
        window.location.reload();
    };

    const toggleWidget = (key) => {
        updateSettings({
            ...settings,
            dashboardWidgets: {
                ...settings.dashboardWidgets,
                [key]: !settings.dashboardWidgets?.[key],
            },
        });
    };

    return (
        <AppLayout>
            <PageHeader
                title="Paramètres"
                subtitle="Personnalise ton dashboard et gère tes données locales."
            />

            <section className="dashboard-card settings-card">
                <div className="card-header">
                    <h2>⚙️ Préférences</h2>
                </div>

                <div className="settings-form">
                    <label>
                        <span>Nom affiché</span>
                        <input
                            type="text"
                            value={settings.displayName}
                            onChange={(e) =>
                                updateSettings({
                                    ...settings,
                                    displayName: e.target.value,
                                })
                            }
                        />
                    </label>

                    <label>
                        <span>Couleur principale</span>
                        <input
                            type="color"
                            value={settings.accentColor}
                            onChange={(e) =>
                                updateSettings({
                                    ...settings,
                                    accentColor: e.target.value,
                                })
                            }
                        />
                    </label>

                    <label className="settings-checkbox">
                        <input
                            type="checkbox"
                            checked={settings.compactMode}
                            onChange={(e) =>
                                updateSettings({
                                    ...settings,
                                    compactMode: e.target.checked,
                                })
                            }
                        />
                        <span>Mode compact</span>
                    </label>
                </div>
            </section>
            <section className="dashboard-card settings-card">
                <div className="card-header">
                    <h2>🧩 Widgets du dashboard</h2>
                </div>

                <div className="settings-widgets-grid">
                    {DASHBOARD_WIDGETS.map((widget) => (
                        <label className="settings-checkbox" key={widget.key}>
                            <input
                                type="checkbox"
                                checked={settings.dashboardWidgets?.[widget.key] ?? true}
                                onChange={() => toggleWidget(widget.key)}
                            />
                            <span>{widget.label}</span>
                        </label>
                    ))}
                </div>
            </section>
            <section className="dashboard-card settings-card">
                <div className="card-header">
                    <h2>Thème</h2>
                </div>
                <select
                    value={settings.theme || "violet"}
                    onChange={(e) =>
                        updateSettings({
                            ...settings,
                            theme: e.target.value,
                        })
                    }
                >
                    <option value="violet">Violet</option>
                    <option value="blue">Blue</option>
                    <option value="sport">Sport</option>
                    <option value="minimal">Minimal</option>
                </select>
            </section>
            <section className="dashboard-card settings-card">
                <div className="card-header">
                    <h2>💾 Données locales</h2>
                </div>

                <div className="settings-actions">
                    <button onClick={handleExport}>
                        <Download size={18} />
                        Exporter mes données
                    </button>

                    <label className="settings-upload">
                        <Upload size={18} />
                        Importer une sauvegarde
                        <input
                            type="file"
                            accept="application/json"
                            onChange={handleImport}
                        />
                    </label>

                    <button className="danger" onClick={handleReset}>
                        <RotateCcw size={18} />
                        Réinitialiser
                    </button>
                </div>
            </section>
        </AppLayout >
    );
}

export default Settings;