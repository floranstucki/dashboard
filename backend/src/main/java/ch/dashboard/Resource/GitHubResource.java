package ch.dashboard.Resource;

import ch.dashboard.Entity.Integration;
import ch.dashboard.Entity.OAuthState;
import ch.dashboard.Entity.User;
import ch.dashboard.Service.JwtService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.StringReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import java.util.UUID;

@Path("/github")
public class GitHubResource {

        @ConfigProperty(name = "GITHUB_CLIENT_ID")
        String clientId;

        @ConfigProperty(name = "GITHUB_CLIENT_SECRET")
        String clientSecret;

        @ConfigProperty(name = "GITHUB_REDIRECT_URI")
        String redirectUri;

        @Inject
        JwtService jwtService;

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

                String url = "https://github.com/login/oauth/authorize"
                                + "?client_id=" + clientId
                                + "&redirect_uri=" + redirectUri
                                + "&scope=repo read:user"
                                + "&state=" + state;

                return Response.ok(Map.of("url", url)).build();
        }

        @GET
        @Path("/callback")
        @Transactional
        public Response callback(
                        @QueryParam("code") String code,
                        @QueryParam("state") String state) {
                try {
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

                        String body = "client_id=" + clientId
                                        + "&client_secret=" + clientSecret
                                        + "&code=" + code
                                        + "&redirect_uri=" + redirectUri;

                        HttpRequest request = HttpRequest.newBuilder()
                                        .uri(URI.create("https://github.com/login/oauth/access_token"))
                                        .header("Accept", "application/json")
                                        .header("Content-Type", "application/x-www-form-urlencoded")
                                        .POST(HttpRequest.BodyPublishers.ofString(body))
                                        .build();

                        HttpResponse<String> response = HttpClient.newHttpClient().send(
                                        request,
                                        HttpResponse.BodyHandlers.ofString());

                        JsonObject json = Json.createReader(new StringReader(response.body())).readObject();

                        if (!json.containsKey("access_token")) {
                                return Response.status(Response.Status.BAD_REQUEST)
                                                .entity(response.body())
                                                .build();
                        }

                        Integration integration = Integration.find(
                                        "provider = ?1 and user.id = ?2",
                                        "GITHUB",
                                        user.id).firstResult();

                        if (integration == null) {
                                integration = new Integration();
                                integration.provider = "GITHUB";
                                integration.user = user;
                        }

                        integration.accessToken = json.getString("access_token");
                        integration.refreshToken = null;
                        integration.expiresAt = null;
                        integration.persist();

                        oauthState.delete();

                        return Response.seeOther(
                                        URI.create("http://localhost:8080/integrations?github=connected")).build();

                } catch (Exception e) {
                        return Response.serverError()
                                        .entity("Erreur GitHub OAuth : " + e.getMessage())
                                        .build();
                }
        }

        @GET
        @Path("/status")
        @Authenticated
        public Response status() {
                Integration integration = Integration.find(
                                "provider = ?1 and user.id = ?2",
                                "GITHUB",
                                jwtService.getUserId()).firstResult();

                return Response.ok(Map.of("connected", integration != null)).build();
        }

        @DELETE
        @Path("/disconnect")
        @Authenticated
        @Transactional
        public Response disconnect() {
                Integration integration = Integration.find(
                                "provider = ?1 and user.id = ?2",
                                "GITHUB",
                                jwtService.getUserId()).firstResult();

                if (integration != null) {
                        integration.delete();
                }

                return Response.noContent().build();
        }

        @GET
        @Path("/repos")
        @Authenticated
        public Response repos() {
                try {
                        Integration integration = Integration.find(
                                        "provider = ?1 and user.id = ?2",
                                        "GITHUB",
                                        jwtService.getUserId()).firstResult();

                        if (integration == null) {
                                return Response.status(Response.Status.NOT_FOUND)
                                                .entity("GitHub non connecté")
                                                .build();
                        }

                        HttpRequest request = HttpRequest.newBuilder()
                                        .uri(URI.create("https://api.github.com/user/repos?sort=updated&per_page=8"))
                                        .header("Accept", "application/vnd.github+json")
                                        .header("Authorization", "Bearer " + integration.accessToken)
                                        .GET()
                                        .build();

                        HttpResponse<String> response = HttpClient.newHttpClient().send(
                                        request,
                                        HttpResponse.BodyHandlers.ofString());

                        return Response.ok(response.body()).build();

                } catch (Exception e) {
                        return Response.serverError()
                                        .entity("Erreur GitHub : " + e.getMessage())
                                        .build();
                }
        }

        @GET
        @Path("/activity")
        @Authenticated
        public Response activity() {
                try {
                        Integration integration = Integration.find(
                                        "provider = ?1 and user.id = ?2",
                                        "GITHUB",
                                        jwtService.getUserId()).firstResult();

                        if (integration == null) {
                                return Response.status(Response.Status.NOT_FOUND)
                                                .entity("GitHub non connecté")
                                                .build();
                        }

                        HttpClient client = HttpClient.newHttpClient();

                        HttpRequest issuesRequest = HttpRequest.newBuilder()
                                        .uri(URI.create("https://api.github.com/issues?filter=assigned&state=open&per_page=10"))
                                        .header("Accept", "application/vnd.github+json")
                                        .header("Authorization", "Bearer " + integration.accessToken)
                                        .GET()
                                        .build();

                        HttpRequest prsRequest = HttpRequest.newBuilder()
                                        .uri(URI.create("https://api.github.com/search/issues?q=is:pr+is:open+author:@me&per_page=10"))
                                        .header("Accept", "application/vnd.github+json")
                                        .header("Authorization", "Bearer " + integration.accessToken)
                                        .GET()
                                        .build();

                        HttpResponse<String> issuesResponse = client.send(
                                        issuesRequest,
                                        HttpResponse.BodyHandlers.ofString());

                        HttpResponse<String> prsResponse = client.send(
                                        prsRequest,
                                        HttpResponse.BodyHandlers.ofString());

                        return Response.ok(java.util.Map.of(
                                        "issues", issuesResponse.body(),
                                        "pullRequests", prsResponse.body())).build();

                } catch (Exception e) {
                        return Response.serverError()
                                        .entity("Erreur activité GitHub : " + e.getMessage())
                                        .build();
                }
        }

        @GET
        @Path("/events")
        @Authenticated
        public Response events() {
                try {
                        Integration integration = Integration.find(
                                        "provider = ?1 and user.id = ?2",
                                        "GITHUB",
                                        jwtService.getUserId()).firstResult();

                        if (integration == null) {
                                return Response.status(Response.Status.NOT_FOUND)
                                                .entity("GitHub non connecté")
                                                .build();
                        }

                        HttpRequest request = HttpRequest.newBuilder()
                                        .uri(URI.create("https://api.github.com/users/floranstucki/events?per_page=10"))
                                        .header("Accept", "application/vnd.github+json")
                                        .header("Authorization", "Bearer " + integration.accessToken)
                                        .GET()
                                        .build();

                        HttpResponse<String> response = HttpClient.newHttpClient().send(
                                        request,
                                        HttpResponse.BodyHandlers.ofString());

                        return Response.ok(response.body()).build();

                } catch (Exception e) {
                        return Response.serverError()
                                        .entity("Erreur events GitHub : " + e.getMessage())
                                        .build();
                }
        }
}