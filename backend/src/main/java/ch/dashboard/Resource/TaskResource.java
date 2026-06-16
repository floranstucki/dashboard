package ch.dashboard.Resource;

import ch.dashboard.Entity.SubTask;
import ch.dashboard.Entity.Task;
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

@Path("/tasks")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TaskResource {

    @Inject
    JwtService jwtService;

    @GET
    public List<Task> getAll() {
        return Task.list("user.id", jwtService.getUserId());
    }

    @GET
    @Path("/{id}")
    public Task getById(@PathParam("id") Long id) {
        Task task = Task.find("id = ?1 and user.id = ?2", id, jwtService.getUserId()).firstResult();

        if (task == null) {
            throw new NotFoundException("Tâche introuvable");
        }

        return task;
    }

    @POST
    @Transactional
    public Response create(@Valid Task task) {
        if (task.status == null || task.status.isBlank()) {
            task.status = "À faire";
        }

        if (task.deadline == null || task.deadline.isBlank()) {
            task.deadline = "Non définie";
        }
        User user = User.findById(jwtService.getUserId());

        if (user == null) {
            throw new NotAuthorizedException("Utilisateur introuvable");
        }
        task.user = user;
        if (task.recurrence == null || task.recurrence.isBlank()) {
            task.recurrence = "Aucune";
        }
        task.persist();

        return Response.status(Response.Status.CREATED).entity(task).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Task update(@PathParam("id") Long id, @Valid Task updatedTask) {
        Task task = Task.find("id = ?1 and user.id = ?2", id, jwtService.getUserId()).firstResult();

        if (task == null) {
            throw new NotFoundException("Tâche introuvable");
        }

        task.title = updatedTask.title;
        task.project = updatedTask.project;
        task.priority = updatedTask.priority;
        task.status = updatedTask.status;
        task.deadline = updatedTask.deadline;
        task.recurrence = updatedTask.recurrence;

        return task;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        Long userId = jwtService.getUserId();

        Task task = Task.find(
                "id = ?1 and user.id = ?2",
                id,
                userId).firstResult();

        if (task == null) {
            throw new NotFoundException("Tâche introuvable");
        }

        SubTask.delete(
                "task.id = ?1 and user.id = ?2",
                id,
                userId);

        task.delete();

        return Response.noContent().build();
    }
}