package ch.dashboard.Resource;

import ch.dashboard.Dto.AssistantIntentDto;
import io.quarkus.security.Authenticated;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.time.LocalDate;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import java.io.StringReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Path("/assistant")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AssistantIntentResource {
    @ConfigProperty(name = "ollama.url")
    String ollamaUrl;

    @ConfigProperty(name = "ollama.model")
    String ollamaModel;

    @POST
    @Path("/intent")
    public AssistantIntentDto parseIntent(AssistantIntentDto request) {
        String text = request.text == null ? "" : request.text.toLowerCase();

        AssistantIntentDto response = new AssistantIntentDto();
        response.text = request.text;
        response.intent = "UNKNOWN";
        response.priority = "Moyenne";
        response.deadline = "Non définie";

        if (text.contains("urgent") || text.contains("urgente")) {
            response.priority = "Urgente";
        } else if (text.contains("important") || text.contains("haute")) {
            response.priority = "Haute";
        } else if (text.contains("basse") || text.contains("faible")) {
            response.priority = "Basse";
        }

        if (text.contains("demain")) {
            response.deadline = LocalDate.now().plusDays(1).toString();
        } else if (text.contains("aujourd'hui") || text.contains("aujourdhui")) {
            response.deadline = LocalDate.now().toString();
        }

        if (text.contains("pense à") ||
                text.contains("penser à") ||
                text.contains("rappelle-moi") ||
                text.contains("rappelle moi") ||
                text.contains("il faut que") ||
                text.contains("je dois")) {
            response.intent = "CREATE_TASK";
            response.title = cleanTitle(text);
        }

        if (text.contains("événement") ||
                text.contains("evenement") ||
                text.contains("calendrier") ||
                text.contains("rendez-vous") ||
                text.contains("rdv")) {
            response.intent = "CREATE_EVENT";
            response.title = cleanEventTitle(text);
            response.priority = null;
            response.deadline = null;
        }

        if (text.contains("dépense") ||
                text.contains("depense") ||
                text.contains("revenu") ||
                text.contains("épargne") ||
                text.contains("epargne")) {
            response.intent = "CREATE_FINANCE";
            response.title = cleanFinanceTitle(text);
            response.priority = null;
            response.deadline = null;
        }

        return response;
    }

    private String cleanTitle(String text) {
        return text
                .replace("pense à", "")
                .replace("penser à", "")
                .replace("rappelle-moi", "")
                .replace("rappelle moi", "")
                .replace("il faut que", "")
                .replace("je dois", "")
                .replace("absolument", "")
                .replace("urgent", "")
                .replace("urgente", "")
                .replace("important", "")
                .replace("haute", "")
                .replace("basse", "")
                .replace("faible", "")
                .replace("demain", "")
                .replace("aujourd'hui", "")
                .replace("aujourdhui", "")
                .trim();
    }

    private String cleanFinanceTitle(String text) {
        return text
                .replace("ajoute", "")
                .replace("ajouter", "")
                .replace("une", "")
                .replace("un", "")
                .replace("dépense", "")
                .replace("depense", "")
                .replace("revenu", "")
                .replace("épargne", "")
                .replace("epargne", "")
                .replace("francs", "")
                .replace("franc", "")
                .replace("chf", "")
                .replaceAll("\\d+", "")
                .trim();
    }

    private String cleanEventTitle(String text) {
        return text
                .replace("ajoute", "")
                .replace("ajouter", "")
                .replace("crée", "")
                .replace("créer", "")
                .replace("un", "")
                .replace("une", "")
                .replace("événement", "")
                .replace("evenement", "")
                .replace("calendrier", "")
                .replace("rendez-vous", "")
                .replace("rdv", "")
                .replace("demain", "")
                .replace("aujourd'hui", "")
                .replace("aujourdhui", "")
                .replaceAll("à \\d{1,2}h", "")
                .replaceAll("\\d{1,2}h", "")
                .trim();
    }

    @POST
    @Path("/ai-intent")
    public AssistantIntentDto parseIntentWithAi(AssistantIntentDto request) {
        try {
            String prompt = """
                    Tu es un assistant qui transforme une commande vocale en JSON.

                    Réponds uniquement avec un JSON valide.
                    Aucun texte autour.

                    Intents possibles :
                    CREATE_TASK, CREATE_FINANCE, CREATE_EVENT, CREATE_NOTE, CREATE_IDEA, UNKNOWN

                    Format obligatoire :
                    {
                      "intent": "...",
                      "title": "...",
                      "priority": "Moyenne",
                      "deadline": "Non définie"
                    }

                    Règles :
                    - Si l'utilisateur dit qu'il doit faire quelque chose, intent CREATE_TASK.
                    - Si l'utilisateur parle d'argent, dépense, revenu, épargne, intent CREATE_FINANCE.
                    - Si l'utilisateur parle de rendez-vous, événement, calendrier, intent CREATE_EVENT.
                    - Si demain est mentionné, deadline = DEMAIN.
                    - Si aujourd'hui est mentionné, deadline = AUJOURDHUI.
                    - Priority : Basse, Moyenne, Haute, Urgente.

                    Commande utilisateur :
                    "%s"
                    """.formatted(request.text);

            String body = Json.createObjectBuilder()
                    .add("model", ollamaModel)
                    .add("prompt", prompt)
                    .add("stream", false)
                    .build()
                    .toString();

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(ollamaUrl + "/api/generate"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> httpResponse = HttpClient.newHttpClient().send(
                    httpRequest,
                    HttpResponse.BodyHandlers.ofString());

            JsonObject ollamaJson = Json.createReader(
                    new StringReader(httpResponse.body())).readObject();

            String aiResponse = ollamaJson.getString("response")
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();

            JsonObject json = Json.createReader(
                    new StringReader(aiResponse)).readObject();

            AssistantIntentDto response = new AssistantIntentDto();
            response.text = request.text;
            response.intent = json.getString("intent", "UNKNOWN");
            response.title = json.getString("title", "");
            response.priority = json.getString("priority", "Moyenne");
            response.source = "AI";
            String deadline = json.getString("deadline", "Non définie");

            if ("DEMAIN".equalsIgnoreCase(deadline)) {
                response.deadline = LocalDate.now().plusDays(1).toString();
            } else if ("AUJOURDHUI".equalsIgnoreCase(deadline)) {
                response.deadline = LocalDate.now().toString();
            } else {
                response.deadline = deadline;
            }

            return response;

        } catch (Exception e) {
            AssistantIntentDto fallback = new AssistantIntentDto();
            fallback.text = request.text;
            fallback.intent = "UNKNOWN";
            fallback.title = "";
            fallback.priority = "Moyenne";
            fallback.deadline = "Non définie";
            fallback.source = "AI";
            return fallback;
        }
    }
}