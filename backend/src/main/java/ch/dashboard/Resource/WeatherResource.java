package ch.dashboard.Resource;

import io.quarkus.security.Authenticated;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Response;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Path("/weather")
@Authenticated
public class WeatherResource {

    @GET
    public Response getWeather(
            @QueryParam("lat") Double lat,
            @QueryParam("lon") Double lon) {
        try {
            double latitude = lat != null ? lat : 46.2044;
            double longitude = lon != null ? lon : 6.1432;

            String url = "https://api.open-meteo.com/v1/forecast"
                    + "?latitude=" + latitude
                    + "&longitude=" + longitude
                    + "&current=temperature_2m,precipitation,wind_speed_10m"
                    + "&daily=precipitation_sum,temperature_2m_max,temperature_2m_min"
                    + "&timezone=Europe/Zurich";

            HttpClient client = HttpClient.newHttpClient();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(
                    request,
                    HttpResponse.BodyHandlers.ofString());

            return Response.ok(response.body()).build();

        } catch (Exception e) {
            return Response.serverError()
                    .entity("Erreur météo : " + e.getMessage())
                    .build();
        }
    }
}