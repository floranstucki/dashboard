package ch.dashboard.Resource;

import ch.dashboard.Entity.AssistantHistory;
import ch.dashboard.Entity.User;
import ch.dashboard.Service.JwtService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDateTime;
import java.util.List;

@Path("/assistant/history")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AssistantHistoryResource {

    @Inject
    JwtService jwtService;

    @GET
    public List<AssistantHistory> getHistory() {
        return AssistantHistory.list(
                "user.id = ?1 order by createdAt desc",
                jwtService.getUserId());
    }

    @POST
    @Transactional
    public Response save(AssistantHistory request) {
        User user = User.findById(jwtService.getUserId());

        AssistantHistory history = new AssistantHistory();
        history.user = user;
        history.commandText = request.commandText;
        history.responseText = request.responseText;
        history.intent = request.intent;
        history.createdAt = LocalDateTime.now();

        history.persist();

        return Response.ok(history).build();
    }

    @DELETE
    @Transactional
    public Response clear() {
        AssistantHistory.delete(
                "user.id = ?1",
                jwtService.getUserId());

        return Response.noContent().build();
    }
}