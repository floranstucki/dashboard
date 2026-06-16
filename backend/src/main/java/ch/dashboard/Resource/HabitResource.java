package ch.dashboard.Resource;

import ch.dashboard.Entity.Habit;
import ch.dashboard.Entity.User;
import ch.dashboard.Service.JwtService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDate;
import java.util.List;

@Path("/habits")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class HabitResource {

    @Inject
    JwtService jwtService;

    @GET
    @Transactional
    public List<Habit> getAll() {
        List<Habit> habits = Habit.list("user.id", jwtService.getUserId());

        String today = LocalDate.now().toString();

        for (Habit habit : habits) {
            if (habit.lastDoneDate == null || !habit.lastDoneDate.equals(today)) {
                habit.doneToday = false;
            }
        }

        return habits;
    }

    @POST
    @Transactional
    public Response create(Habit habit) {
        User user = User.findById(jwtService.getUserId());

        habit.user = user;
        habit.doneToday = false;
        habit.streak = 0;
        habit.lastDoneDate = null;
        habit.persist();

        return Response.status(Response.Status.CREATED)
                .entity(habit)
                .build();
    }

    @PUT
    @Path("/{id}/toggle")
    @Transactional
    public Habit toggleToday(@PathParam("id") Long id) {
        Habit habit = Habit.find(
                "id = ?1 and user.id = ?2",
                id,
                jwtService.getUserId()).firstResult();

        String today = LocalDate.now().toString();

        habit.doneToday = !habit.doneToday;

        if (habit.doneToday) {
            habit.lastDoneDate = today;
            habit.streak++;
        } else {
            habit.lastDoneDate = null;
            habit.streak = Math.max(0, habit.streak - 1);
        }

        return habit;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        Habit habit = Habit.find(
                "id = ?1 and user.id = ?2",
                id,
                jwtService.getUserId()).firstResult();

        if (habit == null) {
            throw new NotFoundException("Habitude introuvable");
        }

        habit.delete();

        return Response.noContent().build();
    }
}