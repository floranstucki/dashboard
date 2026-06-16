package ch.dashboard.Resource;

import io.quarkus.security.Authenticated;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Response;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.Map;

@Path("/server-status")
@Authenticated
public class ServerStatusResource {

    @GET
    public Response getStatus() {
        try {
            String serverUrl = "http://100.79.99.105:5050/status";

            HttpClient client = HttpClient.newHttpClient();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(serverUrl))
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(
                    request,
                    HttpResponse.BodyHandlers.ofString());

            return Response.ok(response.body()).build();

        } catch (Exception e) {
            return Response.ok(Map.of(
                    "name", "Serveur Debian",
                    "online", false,
                    "cpu", 0,
                    "ram", 0,
                    "disk", 0,
                    "checkedAt", LocalDateTime.now().toString())).build();
        }
    }
}