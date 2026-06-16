package ch.dashboard.Resource;

import ch.dashboard.Entity.Idea;
import ch.dashboard.Entity.User;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

import ch.dashboard.Service.JwtService;
import io.quarkus.security.Authenticated;

@Path("/ideas")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class IdeaResource {

    @Inject
    JwtService jwtService;

    @GET
    public List<Idea> getAll() {
        return Idea.list("user.id", jwtService.getUserId());
    }

    @GET
    @Path("/{id}")
    public Idea getById(@PathParam("id") Long id) {
        Idea idea = Idea.find("id = ?1 and user.id = ?2", id, jwtService.getUserId()).firstResult();

        if (idea == null) {
            throw new NotFoundException("Idée introuvable");
        }

        return idea;
    }

    @POST
    @Transactional
    public Response create(@Valid Idea idea) {

        if (idea.createdAt == null || idea.createdAt.isBlank()) {
            idea.createdAt = "Aujourd’hui";
        }

        if (idea.status == null || idea.status.isBlank()) {
            idea.status = "À explorer";
        }

        User user = User.findById(jwtService.getUserId());

        if (user == null) {
            throw new NotAuthorizedException("Utilisateur introuvable");
        }
        idea.user = user;

        idea.persist();

        return Response.status(Response.Status.CREATED)
                .entity(idea)
                .build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Idea update(
            @PathParam("id") Long id,
            @Valid Idea updatedIdea) {

        Idea idea = Idea.find("id = ?1 and user.id = ?2", id, jwtService.getUserId()).firstResult();

        if (idea == null) {
            throw new NotFoundException("Idée introuvable");
        }

        idea.title = updatedIdea.title;
        idea.category = updatedIdea.category;
        idea.content = updatedIdea.content;
        idea.status = updatedIdea.status;
        idea.createdAt = updatedIdea.createdAt;

        return idea;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {

        boolean deleted = Idea.deleteById(id);

        if (!deleted) {
            throw new NotFoundException("Idée introuvable");
        }

        return Response.noContent().build();
    }
}