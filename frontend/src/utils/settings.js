export const SETTINGS_KEY = "home-dashboard-settings";

export const DEFAULT_SETTINGS = {
    displayName: "Flo",
    accentColor: "#5b4df7",
    theme: "violet",
    compactMode: false,

    dashboardWidgets: {
        morningBriefing: true,
        personalAssistant: true,
        mainGoal: true,
        weather: true,
        serverStatus: true,
        strava: true,
        sportGoal: true,
        smartAlerts: true,
        habits: true,
        priority: true,
        productivity: true,
        notifications: true,
        assistant: true,
        search: true,
        quickActions: true,
        github: true,
        focus: true,
        inbox: true,
        projects: true,
        planning: true,
        attention: true,
        upcomingEvents: true,
        metrics: true,
        advancedStats: true,
        charts: true,
        goalForecast: true,
        signalFc: true,
        heatmap: true,
        dailyScore: true,
        dailyScoreHistory: true,
        assistantDashboard: true,
    },
};

export function getSettings() {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);

    if (!savedSettings) {
        return DEFAULT_SETTINGS;
    }

    const parsedSettings = JSON.parse(savedSettings);

    return {
        ...DEFAULT_SETTINGS,
        ...parsedSettings,
        dashboardWidgets: {
            ...DEFAULT_SETTINGS.dashboardWidgets,
            ...parsedSettings.dashboardWidgets,
        },
    };
}

export function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    applySettings(settings);
}

export function applySettings(settings) {
    document.documentElement.style.setProperty(
        "--accent-color",
        settings.accentColor
    );

    document.body.classList.remove(
        "theme-violet",
        "theme-blue",
        "theme-sport",
        "theme-minimal"
    );

    document.body.classList.add(`theme-${settings.theme || "violet"}`);

    document.body.classList.toggle("compact-mode", settings.compactMode);
}