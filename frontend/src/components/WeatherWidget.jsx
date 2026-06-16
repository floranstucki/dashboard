import { useEffect, useState } from "react";
import { CloudSun, Wind, CloudRain } from "lucide-react";
import { apiFetch } from "../utils/api";

function WeatherWidget() {
    const [weather, setWeather] = useState(null);

    useEffect(() => {
        const loadWeather = async () => {
            try {
                const response = await apiFetch("/weather");

                if (!response.ok) {
                    throw new Error();
                }

                const data = await response.json();

                setWeather(data);
            } catch (error) {
                console.error("Erreur météo :", error);
            }
        };

        loadWeather();
    }, []);

    if (!weather) {
        return (
            <section className="dashboard-card">
                <p>Chargement météo...</p>
            </section>
        );
    }

    const temp = weather.current?.temperature_2m;
    const rain = weather.current?.precipitation;
    const wind = weather.current?.wind_speed_10m;

    let condition = "🟢 Idéal pour courir";

    if (rain > 2) {
        condition = "🔴 Mauvaises conditions";
    } else if (wind > 25) {
        condition = "🟠 Vent important";
    }

    return (
        <section className="dashboard-card weather-card">
            <div className="card-header">
                <h2>🌦️ Conditions Trail</h2>
            </div>

            <div className="weather-main">
                <CloudSun size={42} />

                <div>
                    <h3>{temp}°C</h3>
                    <p>Genève</p>
                </div>
            </div>

            <div className="weather-stats">
                <div>
                    <CloudRain size={16} />
                    <span>{rain} mm</span>
                </div>

                <div>
                    <Wind size={16} />
                    <span>{wind} km/h</span>
                </div>
            </div>

            <div className="weather-condition">
                {condition}
            </div>
        </section>
    );
}

export default WeatherWidget;