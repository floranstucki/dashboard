package ch.dashboard.Resource;

import ch.dashboard.Entity.Integration;
import ch.dashboard.Service.JwtService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import ch.dashboard.Entity.User;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import ch.dashboard.Entity.OAuthState;
import java.util.UUID;
import java.io.StringReader;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;

@Path("/strava")
public class StravaResource {

        @ConfigProperty(name = "strava.client-id")
        String clientId;

        @ConfigProperty(name = "strava.client-secret")
        String clientSecret;

        @ConfigProperty(name = "strava.redirect-uri")
        String redirectUri;
        @Inject
        JwtService jwtService;

        @GET
        @Path("/status")
        @Authenticated
        public Response status() {
                Long userId = jwtService.getUserId();

                Integration integration = Integration.find(
                                "provider = ?1 and user.id = ?2",
                                "STRAVA",
                                userId).firstResult();

                return Response.ok(java.util.Map.of(
                                "connected", integration != null)).build();
        }

        @GET
        @Path("/connect")
        @Authenticated
        public Response connect() {

                String url = "https://www.strava.com/oauth/authorize"
                                + "?client_id=" + clientId
                                + "&response_type=code"
                                + "&redirect_uri=" + redirectUri
                                + "&approval_prompt=force"
                                + "&scope=read,activity:read_all";

                return Response.seeOther(URI.create(url)).build();
        }

        @GET
        @Path("/connect-url")
        @Authenticated
        @Transactional
        public Response connectUrl() {
                Long userId = jwtService.getUserId();

                String state = UUID.randomUUID().toString();

                OAuthState oauthState = new OAuthState();
                oauthState.state = state;
                oauthState.userId = userId;
                oauthState.expiresAt = System.currentTimeMillis() + 10 * 60 * 1000;
                oauthState.persist();

                String url = "https://www.strava.com/oauth/authorize"
                                + "?client_id=" + clientId
                                + "&response_type=code"
                                + "&redirect_uri=" + redirectUri
                                + "&approval_prompt=force"
                                + "&scope=read,activity:read_all"
                                + "&state=" + state;

                return Response.ok(java.util.Map.of("url", url)).build();
        }

        @GET
        @Path("/callback")
        @Transactional
        public Response callback(@QueryParam("code") String code, @QueryParam("state") String state) {
                if (code == null || code.isBlank()) {
                        return Response.status(Response.Status.BAD_REQUEST)
                                        .entity("Code Strava manquant")
                                        .build();
                }

                try {
                        String form = "client_id=" + clientId
                                        + "&client_secret=" + clientSecret
                                        + "&code=" + code
                                        + "&grant_type=authorization_code";

                        HttpRequest request = HttpRequest.newBuilder()
                                        .uri(URI.create("https://www.strava.com/oauth/token"))
                                        .header("Content-Type", "application/x-www-form-urlencoded")
                                        .POST(HttpRequest.BodyPublishers.ofString(form))
                                        .build();

                        HttpClient client = HttpClient.newHttpClient();

                        HttpResponse<String> response = client.send(
                                        request,
                                        HttpResponse.BodyHandlers.ofString());

                        if (response.statusCode() >= 400) {
                                return Response.status(Response.Status.BAD_REQUEST)
                                                .entity(response.body())
                                                .build();
                        }

                        JsonObject json = Json.createReader(
                                        new StringReader(response.body())).readObject();

                        String accessToken = json.getString("access_token");
                        String refreshToken = json.getString("refresh_token");
                        Long expiresAt = json.getJsonNumber("expires_at").longValue();

                        OAuthState oauthState = OAuthState.find("state", state).firstResult();

                        if (oauthState == null || oauthState.expiresAt < System.currentTimeMillis()) {
                                return Response.status(Response.Status.UNAUTHORIZED)
                                                .entity("State OAuth invalide ou expiré")
                                                .build();
                        }

                        User user = User.findById(oauthState.userId);

                        if (user == null) {
                                return Response.status(Response.Status.UNAUTHORIZED)
                                                .entity("Utilisateur introuvable")
                                                .build();
                        }

                        oauthState.delete();

                        Integration integration = Integration.find(
                                        "provider = ?1 and user.id = ?2",
                                        "STRAVA",
                                        user.id).firstResult();

                        if (integration == null) {
                                integration = new Integration();
                                integration.provider = "STRAVA";
                                integration.user = user;
                        }

                        integration.accessToken = accessToken;
                        integration.refreshToken = refreshToken;
                        integration.expiresAt = expiresAt;
                        integration.persist();

                        return Response.seeOther(
                                        URI.create("http://localhost:8080/settings?strava=connected")).build();

                } catch (Exception e) {
                        return Response.serverError()
                                        .entity("Erreur callback Strava : " + e.getMessage())
                                        .build();
                }
        }

        @GET
        @Path("/activities")
        @Authenticated
        public Response activities() {
                Long userId = jwtService.getUserId();

                Integration integration = Integration.find(
                                "provider = ?1 and user.id = ?2",
                                "STRAVA",
                                userId).firstResult();

                if (integration == null) {
                        return Response.status(Response.Status.NOT_FOUND)
                                        .entity("Strava non connecté")
                                        .build();
                }

                try {
                        integration = refreshStravaTokenIfNeeded(integration);
                        HttpRequest request = HttpRequest.newBuilder()
                                        .uri(URI.create("https://www.strava.com/api/v3/athlete/activities?per_page=10"))
                                        .header("Authorization", "Bearer " + integration.accessToken)
                                        .GET()
                                        .build();

                        HttpClient client = HttpClient.newHttpClient();

                        HttpResponse<String> response = client.send(
                                        request,
                                        HttpResponse.BodyHandlers.ofString());

                        return Response.ok(response.body()).build();

                } catch (Exception e) {
                        return Response.serverError()
                                        .entity("Erreur Strava : " + e.getMessage())
                                        .build();
                }
        }

        private Integration refreshStravaTokenIfNeeded(Integration integration) throws Exception {
                long now = System.currentTimeMillis() / 1000;

                if (integration.expiresAt != null && integration.expiresAt > now + 300) {
                        return integration;
                }

                String form = "client_id=" + clientId
                                + "&client_secret=" + clientSecret
                                + "&grant_type=refresh_token"
                                + "&refresh_token=" + integration.refreshToken;

                HttpRequest request = HttpRequest.newBuilder()
                                .uri(URI.create("https://www.strava.com/oauth/token"))
                                .header("Content-Type", "application/x-www-form-urlencoded")
                                .POST(HttpRequest.BodyPublishers.ofString(form))
                                .build();

                HttpClient client = HttpClient.newHttpClient();

                HttpResponse<String> response = client.send(
                                request,
                                HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() >= 400) {
                        throw new RuntimeException("Impossible de rafraîchir le token Strava : " + response.body());
                }

                JsonObject json = Json.createReader(
                                new StringReader(response.body())).readObject();

                integration.accessToken = json.getString("access_token");
                integration.refreshToken = json.getString("refresh_token");
                integration.expiresAt = json.getJsonNumber("expires_at").longValue();

                return integration;
        }

        @DELETE
        @Path("/disconnect")
        @Authenticated
        @Transactional
        public Response disconnect() {
                Long userId = jwtService.getUserId();

                Integration integration = Integration.find(
                                "provider = ?1 and user.id = ?2",
                                "STRAVA",
                                userId).firstResult();

                if (integration != null) {
                        integration.delete();
                }

                return Response.noContent().build();
        }

}