package ch.dashboard.Resource;

import ch.dashboard.Entity.AssistantMemory;
import ch.dashboard.Entity.User;
import ch.dashboard.Service.JwtService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/assistant/memory")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AssistantMemoryResource {

    @Inject
    JwtService jwtService;

    @GET
    public List<AssistantMemory> getAll() {
        return AssistantMemory.list(
                "user.id = ?1 order by memoryKey",
                jwtService.getUserId());
    }

    @POST
    @Transactional
    public Response save(AssistantMemory request) {
        Long userId = jwtService.getUserId();

        AssistantMemory memory = AssistantMemory.find(
                "user.id = ?1 and memoryKey = ?2",
                userId,
                request.memoryKey).firstResult();

        if (memory == null) {
            User user = User.findById(userId);

            memory = new AssistantMemory();
            memory.user = user;
            memory.memoryKey = request.memoryKey;
        }

        memory.memoryValue = request.memoryValue;
        memory.persist();

        return Response.ok(memory).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        AssistantMemory memory = AssistantMemory.find(
                "id = ?1 and user.id = ?2",
                id,
                jwtService.getUserId()).firstResult();

        if (memory == null) {
            throw new NotFoundException("Mémoire introuvable");
        }

        memory.delete();

        return Response.noContent().build();
    }
}