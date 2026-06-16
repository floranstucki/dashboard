import { useEffect, useMemo, useState } from "react";
import { Bike, Mountain, Timer } from "lucide-react";
import { apiFetch } from "../utils/api";

function StravaWidget() {
    const [activities, setActivities] = useState([]);
    const [connected, setConnected] = useState(true);

    useEffect(() => {
        const loadActivities = async () => {
            const response = await apiFetch("/strava/activities");

            if (response.status === 404) {
                setConnected(false);
                return;
            }

            if (!response.ok) return;

            const data = await response.json();
            setActivities(data);
        };

        loadActivities();
    }, []);

    const latest = activities[0];

    const weeklyStats = useMemo(() => {
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        const weekActivities = activities.filter(
            (activity) => new Date(activity.start_date) >= sevenDaysAgo
        );

        return {
            count: weekActivities.length,
            distance: weekActivities.reduce((sum, item) => sum + item.distance, 0),
            elevation: weekActivities.reduce(
                (sum, item) => sum + item.total_elevation_gain,
                0
            ),
        };
    }, [activities]);

    const formatDistance = (meters) => `${(meters / 1000).toFixed(1)} km`;

    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);

        return h > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${m} min`;
    };

    if (!connected) {
        return (
            <section className="dashboard-card strava-card">
                <div className="card-header">
                    <h2>🏃 Strava</h2>
                </div>

                <p className="empty-state">Strava n’est pas encore connecté.</p>
            </section>
        );
    }

    return (
        <section className="dashboard-card strava-card">
            <div className="card-header">
                <h2>🏃 Strava</h2>
            </div>

            {latest ? (
                <>
                    <div className="strava-latest">
                        <h3>{latest.name}</h3>
                        <p>Dernière activité · {latest.type}</p>
                    </div>

                    <div className="strava-metrics">
                        <div>
                            <Bike size={17} />
                            <strong>{formatDistance(latest.distance)}</strong>
                        </div>

                        <div>
                            <Mountain size={17} />
                            <strong>{Math.round(latest.total_elevation_gain)} m D+</strong>
                        </div>

                        <div>
                            <Timer size={17} />
                            <strong>{formatDuration(latest.moving_time)}</strong>
                        </div>
                    </div>

                    <div className="strava-week">
                        <span>Cette semaine</span>
                        <strong>
                            {weeklyStats.count} activité(s) · {formatDistance(weeklyStats.distance)} ·{" "}
                            {Math.round(weeklyStats.elevation)} m D+
                        </strong>
                    </div>
                </>
            ) : (
                <p className="empty-state">Aucune activité récente.</p>
            )}
        </section>
    );
}

export default StravaWidget;