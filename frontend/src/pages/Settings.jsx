import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { Download, RotateCcw, Upload } from "lucide-react";
import {
    DEFAULT_SETTINGS,
    getSettings,
    saveSettings,
    SETTINGS_KEY,
} from "../utils/settings";
import PageHeader from "../components/PageHeader";
import { apiFetch } from "../utils/api";
const DATA_KEYS = [
    "home-dashboard-settings",
    "smart-notifications",
];

const DASHBOARD_WIDGETS = [
    { key: "mainGoal", label: "Objectif principal" },
    { key: "weather", label: "Météo trail" },
    { key: "serverStatus", label: "Serveur maison" },
    { key: "strava", label: "Strava" },
    { key: "habits", label: "Habitudes" },
    { key: "priority", label: "Priorités" },
    { key: "productivity", label: "Score productivité" },
    { key: "notifications", label: "Notifications" },
    { key: "assistant", label: "Assistant" },
    { key: "search", label: "Recherche globale" },
    { key: "quickActions", label: "Actions rapides" },
    { key: "focus", label: "Focus du jour" },
    { key: "inbox", label: "Inbox idées" },
    { key: "projects", label: "Projets" },
    { key: "planning", label: "Planning" },
    { key: "attention", label: "À surveiller" },
    { key: "upcomingEvents", label: "Événements à venir" },
    { key: "metrics", label: "Métriques" },
    { key: "advancedStats", label: "Stats avancées" },
    { key: "charts", label: "Graphiques" },
];
function Settings() {

    const [settings, setSettings] = useState(getSettings());
    const [stravaConnected, setStravaConnected] = useState(false);
    const updateSettings = (newSettings) => {
        setSettings(newSettings);
        saveSettings(newSettings);
        window.dispatchEvent(new Event("dashboard-settings-updated"));
    };

    useEffect(() => {
        const loadStravaStatus = async () => {
            const response = await apiFetch("/strava/status");

            if (!response.ok) return;

            const data = await response.json();

            setStravaConnected(data.connected);
        };

        loadStravaStatus();
    }, []);
    const connectStrava = async () => {
        const response = await apiFetch("/strava/connect-url");

        console.log(response.status);

        const data = await response.json();

        console.log(data);

        window.location.href = data.url;
    };

    const disconnectStrava = async () => {
        const response = await apiFetch("/strava/disconnect", {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Impossible de déconnecter Strava.");
        }
        setStravaConnected(false);
        alert("Strava déconnecté.");
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
                    <h2>🔌 Intégrations</h2>
                </div>

                <div className="integration-item">
                    <div>
                        <h3>🏃 Strava</h3>
                        <p>{stravaConnected ? "Connecté" : "Non connecté"}</p>
                    </div>

                    {stravaConnected ? (
                        <button className="danger" onClick={disconnectStrava}>
                            Déconnecter
                        </button>
                    ) : (
                        <button onClick={connectStrava}>
                            Connecter
                        </button>
                    )}
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
        </AppLayout>
    );
}

export default Settings;