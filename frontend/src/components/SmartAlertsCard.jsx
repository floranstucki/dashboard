import { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    CloudRain,
    HardDrive,
    ServerCrash,
    Trophy,
} from "lucide-react";
import { apiFetch } from "../utils/api";

const WEEKLY_SPORT_GOAL_KM = 30;

function SmartAlertsCard() {
    const [activities, setActivities] = useState([]);
    const [serverStatus, setServerStatus] = useState(null);
    const [weather, setWeather] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            const [stravaResponse, serverResponse, weatherResponse] =
                await Promise.allSettled([
                    apiFetch("/strava/activities"),
                    apiFetch("/server-status"),
                    apiFetch("/weather"),
                ]);

            if (
                stravaResponse.status === "fulfilled" &&
                stravaResponse.value.ok
            ) {
                setActivities(await stravaResponse.value.json());
            }

            if (
                serverResponse.status === "fulfilled" &&
                serverResponse.value.ok
            ) {
                setServerStatus(await serverResponse.value.json());
            }

            if (
                weatherResponse.status === "fulfilled" &&
                weatherResponse.value.ok
            ) {
                setWeather(await weatherResponse.value.json());
            }
        };

        loadData();
    }, []);

    const alerts = useMemo(() => {
        const items = [];

        const now = new Date();
        const day = now.getDay(); // 0 dimanche, 1 lundi, etc.
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        const weekActivities = activities.filter(
            (activity) => new Date(activity.start_date) >= sevenDaysAgo
        );

        const weeklyDistanceKm =
            weekActivities.reduce(
                (sum, activity) => sum + Number(activity.distance || 0),
                0
            ) / 1000;

        const latestActivity = activities[0];

        if (latestActivity) {
            const daysSinceLastActivity = Math.floor(
                (now - new Date(latestActivity.start_date)) / 86400000
            );

            if (daysSinceLastActivity >= 5) {
                items.push({
                    type: "warning",
                    icon: AlertTriangle,
                    title: "Aucune activité récente",
                    message: `Dernière activité Strava il y a ${daysSinceLastActivity} jours.`,
                });
            }
        }

        if (day >= 4 && weeklyDistanceKm < WEEKLY_SPORT_GOAL_KM * 0.5) {
            items.push({
                type: "warning",
                icon: Trophy,
                title: "Objectif sport en retard",
                message: `${weeklyDistanceKm.toFixed(
                    1
                )} km sur ${WEEKLY_SPORT_GOAL_KM} km cette semaine.`,
            });
        }

        if (serverStatus) {
            if (!serverStatus.online) {
                items.push({
                    type: "danger",
                    icon: ServerCrash,
                    title: "Serveur maison hors ligne",
                    message: "Le serveur ne répond pas actuellement.",
                });
            }

            if (Number(serverStatus.disk) >= 80) {
                items.push({
                    type: "warning",
                    icon: HardDrive,
                    title: "Disque serveur presque plein",
                    message: `Le disque est utilisé à ${serverStatus.disk}%.`,
                });
            }

            if (serverStatus.services) {
                const failedServices = Object.entries(serverStatus.services)
                    .filter(([, ok]) => !ok)
                    .map(([name]) => name.toUpperCase());

                if (failedServices.length > 0) {
                    items.push({
                        type: "danger",
                        icon: ServerCrash,
                        title: "Service serveur arrêté",
                        message: `Service(s) concerné(s) : ${failedServices.join(", ")}.`,
                    });
                }
            }
        }

        const rain = Number(weather?.current?.precipitation || 0);
        const wind = Number(weather?.current?.wind_speed_10m || 0);

        if (rain >= 5) {
            items.push({
                type: "warning",
                icon: CloudRain,
                title: "Forte pluie aujourd’hui",
                message: `${rain} mm de pluie actuellement à Genève.`,
            });
        }

        if (wind >= 35) {
            items.push({
                type: "warning",
                icon: AlertTriangle,
                title: "Vent important",
                message: `Vent actuel : ${wind} km/h. Prudence pour vélo ou trail.`,
            });
        }

        return items;
    }, [activities, serverStatus, weather]);

    return (
        <section className="dashboard-card smart-alerts-card">
            <div className="card-header">
                <h2>🧠 Alertes intelligentes</h2>
            </div>

            <div className="smart-alerts-list">
                {alerts.length > 0 ? (
                    alerts.map((alert, index) => {
                        const Icon = alert.icon;

                        return (
                            <article
                                className={`smart-alert-item ${alert.type}`}
                                key={`${alert.title}-${index}`}
                            >
                                <div className="smart-alert-icon">
                                    <Icon size={18} />
                                </div>

                                <div>
                                    <h3>{alert.title}</h3>
                                    <p>{alert.message}</p>
                                </div>
                            </article>
                        );
                    })
                ) : (
                    <article className="smart-alert-item success">
                        <div className="smart-alert-icon">
                            <CheckCircle2 size={18} />
                        </div>

                        <div>
                            <h3>Aucun problème détecté</h3>
                            <p>Sport, météo et serveur semblent corrects.</p>
                        </div>
                    </article>
                )}
            </div>
        </section>
    );
}

export default SmartAlertsCard;