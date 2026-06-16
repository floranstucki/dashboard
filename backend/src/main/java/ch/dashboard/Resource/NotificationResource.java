package ch.dashboard.Resource;

import ch.dashboard.Entity.Notification;
import ch.dashboard.Entity.User;
import ch.dashboard.Service.JwtService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/notifications")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class NotificationResource {

    @Inject
    JwtService jwtService;

    @GET
    public List<Notification> getAll() {
        return Notification.list("user.id", jwtService.getUserId());
    }

    @POST
    @Transactional
    public Notification create(Notification notification) {
        User user = User.findById(jwtService.getUserId());
        notification.user = user;
        notification.persist();
        return notification;
    }

    @PUT
    @Path("/{id}/read")
    @Transactional
    public Notification markAsRead(@PathParam("id") Long id) {
        Notification notification = Notification
                .find("id = ?1 and user.id = ?2", id, jwtService.getUserId())
                .firstResult();

        if (notification == null) {
            throw new NotFoundException("Notification introuvable");
        }

        notification.isRead = true;
        return notification;
    }
}