package ch.dashboard.Resource;

import ch.dashboard.Entity.FinanceItem;
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

@Path("/finances")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FinanceResource {

    @Inject
    JwtService jwtService;

    @GET
    public List<FinanceItem> getAll() {
        return FinanceItem.list("user.id", jwtService.getUserId());
    }

    @GET
    @Path("/{id}")
    public FinanceItem getById(@PathParam("id") Long id) {
        FinanceItem item = FinanceItem.find("id = ?1 and user.id = ?2", id, jwtService.getUserId()).firstResult();

        if (item == null) {
            throw new NotFoundException("Ligne financière introuvable");
        }

        return item;
    }

    @POST
    @Transactional
    public Response create(@Valid FinanceItem item) {
        User user = User.findById(jwtService.getUserId());

        if (user == null) {
            throw new NotAuthorizedException("Utilisateur introuvable");
        }
        item.user = user;
        item.persist();

        return Response.status(Response.Status.CREATED)
                .entity(item)
                .build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public FinanceItem update(
            @PathParam("id") Long id,
            @Valid FinanceItem updatedItem) {
        FinanceItem item = FinanceItem.find("id = ?1 and user.id = ?2", id, jwtService.getUserId()).firstResult();

        if (item == null) {
            throw new NotFoundException("Ligne financière introuvable");
        }

        item.description = updatedItem.description;
        item.type = updatedItem.type;
        item.category = updatedItem.category;
        item.amount = updatedItem.amount;

        return item;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = FinanceItem.deleteById(id);

        if (!deleted) {
            throw new NotFoundException("Ligne financière introuvable");
        }

        return Response.noContent().build();
    }
}