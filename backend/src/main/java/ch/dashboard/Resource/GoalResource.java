package ch.dashboard.Resource;

import ch.dashboard.Entity.Goal;
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

@Path("/goals")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GoalResource {

    @Inject
    JwtService jwtService;

    @GET
    public List<Goal> getAll() {
        return Goal.list("user.id", jwtService.getUserId());
    }

    @GET
    @Path("/{id}")
    public Goal getById(@PathParam("id") Long id) {
        Goal goal = Goal.find("id = ?1 and user.id = ?2", id, jwtService.getUserId()).firstResult();

        if (goal == null) {
            throw new NotFoundException("Objectif introuvable");
        }

        return goal;
    }

    @POST
    @Transactional
    public Response create(@Valid Goal goal) {
        if (goal.deadline == null || goal.deadline.isBlank()) {
            goal.deadline = "Non définie";
        }

        User user = User.findById(jwtService.getUserId());

        if (user == null) {
            throw new NotAuthorizedException("Utilisateur introuvable");
        }
        goal.user = user;

        goal.persist();

        return Response.status(Response.Status.CREATED).entity(goal).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Goal update(@PathParam("id") Long id, @Valid Goal updatedGoal) {
        Goal goal = Goal.find("id = ?1 and user.id = ?2", id, jwtService.getUserId()).firstResult();

        if (goal == null) {
            throw new NotFoundException("Objectif introuvable");
        }

        goal.title = updatedGoal.title;
        goal.category = updatedGoal.category;
        goal.deadline = updatedGoal.deadline;
        goal.progress = updatedGoal.progress;

        return goal;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = Goal.deleteById(id);

        if (!deleted) {
            throw new NotFoundException("Objectif introuvable");
        }

        return Response.noContent().build();
    }
}