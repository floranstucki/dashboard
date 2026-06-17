package ch.dashboard.Resource;

import ch.dashboard.Entity.DailyJournalEntry;
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

@Path("/daily-journal")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DailyJournalResource {

    @Inject
    JwtService jwtService;

    @GET
    public List<DailyJournalEntry> getEntries() {
        return DailyJournalEntry.list(
                "user.id = ?1 order by date desc",
                jwtService.getUserId());
    }

    @GET
    @Path("/today")
    public DailyJournalEntry getToday() {
        Long userId = jwtService.getUserId();
        String today = LocalDate.now().toString();

        DailyJournalEntry entry = DailyJournalEntry.find(
                "user.id = ?1 and date = ?2",
                userId,
                today).firstResult();

        if (entry == null) {
            throw new NotFoundException("Aucune entrée aujourd'hui");
        }

        return entry;
    }

    @POST
    @Path("/today")
    @Transactional
    public Response saveToday(DailyJournalEntry request) {
        Long userId = jwtService.getUserId();
        String today = LocalDate.now().toString();

        DailyJournalEntry entry = DailyJournalEntry.find(
                "user.id = ?1 and date = ?2",
                userId,
                today).firstResult();

        if (entry == null) {
            User user = User.findById(userId);

            entry = new DailyJournalEntry();
            entry.user = user;
            entry.date = today;
        }

        entry.summary = request.summary;
        entry.tasksDone = request.tasksDone;
        entry.habitsDone = request.habitsDone;
        entry.sportKm = request.sportKm;
        entry.serverOk = request.serverOk;
        entry.weatherSummary = request.weatherSummary;

        entry.persist();

        return Response.ok(entry).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        DailyJournalEntry entry = DailyJournalEntry.find(
                "id = ?1 and user.id = ?2",
                id,
                jwtService.getUserId()).firstResult();

        if (entry == null) {
            throw new NotFoundException("Entrée introuvable");
        }

        entry.delete();

        return Response.noContent().build();
    }
}