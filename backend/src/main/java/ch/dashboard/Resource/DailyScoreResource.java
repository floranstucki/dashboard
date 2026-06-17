package ch.dashboard.Resource;

import ch.dashboard.Entity.DailyScore;
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

@Path("/daily-scores")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DailyScoreResource {

    @Inject
    JwtService jwtService;

    @GET
    public List<DailyScore> getScores() {
        return DailyScore.list(
                "user.id = ?1 order by date desc",
                jwtService.getUserId());
    }

    @POST
    @Path("/today")
    @Transactional
    public Response saveToday(DailyScore request) {
        Long userId = jwtService.getUserId();
        String today = LocalDate.now().toString();

        DailyScore score = DailyScore.find(
                "user.id = ?1 and date = ?2",
                userId,
                today).firstResult();

        if (score == null) {
            User user = User.findById(userId);

            score = new DailyScore();
            score.user = user;
            score.date = today;
        }

        score.score = request.score;
        score.persist();

        return Response.ok(score).build();
    }
}