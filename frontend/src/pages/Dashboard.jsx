import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import FocusCard from "../components/FocusCard";
import InboxCard from "../components/InboxCard";
import ProjectsOverview from "../components/ProjectOverview";
import PlanningCard from "../components/PlanningCard";
import AttentionCard from "../components/AttentionCard";
import MetricsCard from "../components/MetricsCard";
import DashboardCharts from "../components/DashboardCharts";
import GlobalSearch from "../components/GlobalSearch";
import UpcomingEventsCard from "../components/UpcomingEventsCard";
import QuickActions from "../components/QuickActions";
import PageHeader from "../components/PageHeader";
import PriorityCard from "../components/PriorityCard";
import ProductivityScore from "../components/ProductivityScore";
import NotificationsCard from "../components/NotificationCard";
import AssistantCard from "../components/AssistantCard";
import { getSettings } from "../utils/settings";
import AdvancedStatsCard from "../components/AdvancedStatsCard";
import MainGoalCard from "../components/MainGoalCard";
import HabitsCard from "../components/HabitsCard";
import WeatherWidget from "../components/WeatherWidget";
import ServerStatusWidget from "../components/ServerStatusWidget";
import StravaWidget from "../components/StravaWidget";
function Dashboard() {
    const [settings, setSettings] = useState(getSettings());
    const widgets = settings.dashboardWidgets || {};
    useEffect(() => {
        const handleStorageChange = () => {
            setSettings(getSettings());
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("dashboard-settings-updated", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener(
                "dashboard-settings-updated",
                handleStorageChange
            );
        };
    }, []);

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <AppLayout>
            <PageHeader
                title={`Bonjour, ${settings.displayName} 👋`}
                subtitle="Voici ton centre de productivité personnel."
            >
                <div className="dashboard-header-actions">
                    <div className="dashboard-time">
                        <strong>
                            {currentTime.toLocaleTimeString("fr-CH", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </strong>
                        <span>
                            {currentTime.toLocaleDateString("fr-CH", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                            })}
                        </span>
                    </div>
                </div>
            </PageHeader>

            {widgets.quickActions && <QuickActions />}

            {widgets.mainGoal && (
                <div className="dashboard-grid ">
                    <MainGoalCard />
                </div>
            )}

            {(widgets.weather || widgets.serverStatus || widgets.strava) && (
                <div className="dashboard-grid dashboard-grid-bottom">
                    {widgets.weather && <WeatherWidget />}
                    {widgets.serverStatus && <ServerStatusWidget />}
                    {widgets.strava && <StravaWidget />}
                </div>
            )}

            {widgets.habits && (
                <div className="dashboard-grid">
                    <HabitsCard />
                </div>
            )}
            {(widgets.priority ||
                widgets.productivity ||
                widgets.notifications) && (
                    <div className="dashboard-grid intelligence-grid">
                        {widgets.priority && <PriorityCard />}
                        {widgets.productivity && <ProductivityScore />}
                        {widgets.notifications && <NotificationsCard />}
                    </div>
                )}

            {widgets.assistant && <AssistantCard />}

            {widgets.search && <GlobalSearch />}

            {(widgets.focus || widgets.inbox) && (
                <div className="dashboard-grid dashboard-grid-top">
                    {widgets.focus && <FocusCard />}
                    {widgets.inbox && <InboxCard />}
                </div>
            )}

            {widgets.projects && (
                <div className="dashboard-grid">
                    <ProjectsOverview />
                </div>
            )}

            {(widgets.planning ||
                widgets.attention ||
                widgets.upcomingEvents) && (
                    <div className="dashboard-grid dashboard-grid-bottom">
                        {widgets.planning && <PlanningCard />}
                        {widgets.attention && <AttentionCard />}
                        {widgets.upcomingEvents && <UpcomingEventsCard />}
                    </div>
                )}

            {widgets.metrics && (
                <div className="dashboard-grid">
                    <MetricsCard />
                </div>
            )}

            {widgets.advancedStats && (
                <div className="dashboard-grid">
                    <AdvancedStatsCard />
                </div>
            )}

            {widgets.charts && <DashboardCharts />}
        </AppLayout>
    );
}

export default Dashboard;