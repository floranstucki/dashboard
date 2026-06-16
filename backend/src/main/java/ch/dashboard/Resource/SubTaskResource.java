package ch.dashboard.Resource;

import ch.dashboard.Entity.SubTask;
import ch.dashboard.Entity.Task;
import ch.dashboard.Entity.User;
import ch.dashboard.Service.JwtService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/tasks/{taskId}/subtasks")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SubTaskResource {

    @Inject
    JwtService jwtService;

    @GET
    public List<SubTask> getByTask(@PathParam("taskId") Long taskId) {
        return SubTask.list(
                "task.id = ?1 and user.id = ?2",
                taskId,
                jwtService.getUserId());
    }

    @POST
    @Transactional
    public Response create(
            @PathParam("taskId") Long taskId,
            SubTask subTask) {
        Task task = Task.find(
                "id = ?1 and user.id = ?2",
                taskId,
                jwtService.getUserId()).firstResult();

        if (task == null) {
            throw new NotFoundException("Tâche introuvable");
        }

        User user = User.findById(jwtService.getUserId());

        subTask.task = task;
        subTask.user = user;
        subTask.done = false;

        subTask.persist();

        return Response.status(Response.Status.CREATED)
                .entity(subTask)
                .build();
    }

    @PUT
    @Path("/{subTaskId}/toggle")
    @Transactional
    public SubTask toggle(
            @PathParam("taskId") Long taskId,
            @PathParam("subTaskId") Long subTaskId) {
        SubTask subTask = SubTask.find(
                "id = ?1 and task.id = ?2 and user.id = ?3",
                subTaskId,
                taskId,
                jwtService.getUserId()).firstResult();

        if (subTask == null) {
            throw new NotFoundException("Sous-tâche introuvable");
        }

        subTask.done = !subTask.done;

        return subTask;
    }

    @DELETE
    @Path("/{subTaskId}")
    @Transactional
    public Response delete(
            @PathParam("taskId") Long taskId,
            @PathParam("subTaskId") Long subTaskId) {
        SubTask subTask = SubTask.find(
                "id = ?1 and task.id = ?2 and user.id = ?3",
                subTaskId,
                taskId,
                jwtService.getUserId()).firstResult();

        if (subTask == null) {
            throw new NotFoundException("Sous-tâche introuvable");
        }

        subTask.delete();

        return Response.noContent().build();
    }
}