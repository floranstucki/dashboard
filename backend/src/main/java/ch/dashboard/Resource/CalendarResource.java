package ch.dashboard.Resource;

import ch.dashboard.Entity.CalendarEvent;
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

@Path("/calendar")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CalendarResource {

    @Inject
    JwtService jwtService;

    @GET
    public List<CalendarEvent> getAll() {
        return CalendarEvent.list("user.id", jwtService.getUserId());
    }

    @GET
    @Path("/{id}")
    public CalendarEvent getById(@PathParam("id") Long id) {
        CalendarEvent event = CalendarEvent.find("id = ?1 and user.id = ?2", id, jwtService.getUserId()).firstResult();

        if (event == null) {
            throw new NotFoundException("Événement introuvable");
        }

        return event;
    }

    @POST
    @Transactional
    public Response create(@Valid CalendarEvent event) {
        if (event.time == null || event.time.isBlank()) {
            event.time = "Toute la journée";
        }
        User user = User.findById(jwtService.getUserId());

        if (user == null) {
            throw new NotAuthorizedException("Utilisateur introuvable");
        }
        event.user = user;
        event.persist();

        return Response.status(Response.Status.CREATED).entity(event).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public CalendarEvent update(
            @PathParam("id") Long id,
            @Valid CalendarEvent updatedEvent) {
        CalendarEvent event = CalendarEvent.find("id = ?1 and user.id = ?2", id, jwtService.getUserId()).firstResult();

        if (event == null) {
            throw new NotFoundException("Événement introuvable");
        }

        event.title = updatedEvent.title;
        event.category = updatedEvent.category;
        event.date = updatedEvent.date;
        event.time = updatedEvent.time;

        return event;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = CalendarEvent.deleteById(id);

        if (!deleted) {
            throw new NotFoundException("Événement introuvable");
        }

        return Response.noContent().build();
    }
}