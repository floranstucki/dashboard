package ch.dashboard.Resource;

import ch.dashboard.Entity.Project;
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

@Path("/projects")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProjectResource {

    @Inject
    JwtService jwtService;

    @GET
    public List<Project> getAll() {
        return Project.list("user.id", jwtService.getUserId());
    }

    @GET
    @Path("/{id}")
    public Project getById(@PathParam("id") Long id) {
        Project project = Project.find("id = ?1 and user.id = ?2", id, jwtService.getUserId()).firstResult();

        if (project == null) {
            throw new NotFoundException("Projet introuvable");
        }

        return project;
    }

    @POST
    @Transactional
    public Response create(@Valid Project project) {

        User user = User.findById(jwtService.getUserId());

        if (user == null) {
            throw new NotAuthorizedException("Utilisateur introuvable");
        }
        project.user = user;

        project.persist();

        return Response.status(Response.Status.CREATED).entity(project).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Project update(@PathParam("id") Long id, @Valid Project updatedProject) {
        Project project = Project.find("id = ?1 and user.id = ?2", id, jwtService.getUserId()).firstResult();

        if (project == null) {
            throw new NotFoundException("Projet introuvable");
        }

        project.name = updatedProject.name;
        project.status = updatedProject.status;
        project.progress = updatedProject.progress;
        project.description = updatedProject.description;

        return project;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = Project.deleteById(id);

        if (!deleted) {
            throw new NotFoundException("Projet introuvable");
        }

        return Response.noContent().build();
    }
}