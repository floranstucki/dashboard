package ch.dashboard.Resource;

import io.quarkus.security.Authenticated;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Response;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Path("/signal-fc")
@Authenticated
public class SignalFcResource {

    @GET
    @Path("/posts")
    public Response posts() {
        try {
            String url = "https://openmediavault.tail041bcd.ts.net/wp-json/wp/v2/posts?per_page=5&_embed";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();

            HttpClient client = HttpClient.newHttpClient();

            HttpResponse<String> response = client.send(
                    request,
                    HttpResponse.BodyHandlers.ofString());

            return Response.ok(response.body()).build();

        } catch (Exception e) {
            return Response.serverError()
                    .entity("Erreur Signal FC : " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/manifestations")
    public Response manifestations() {
        try {
            String url = "https://openmediavault.tail041bcd.ts.net/wp-json/wp/v2/club_manifestation?per_page=5";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();

            HttpClient client = HttpClient.newHttpClient();

            HttpResponse<String> response = client.send(
                    request,
                    HttpResponse.BodyHandlers.ofString());

            return Response.ok(response.body()).build();

        } catch (Exception e) {
            return Response.serverError()
                    .entity("Erreur manifestations Signal FC : " + e.getMessage())
                    .build();
        }
    }
}