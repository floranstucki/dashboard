package ch.dashboard.Resource;

import ch.dashboard.Entity.Note;
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

@Path("/notes")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class NoteResource {

    @Inject
    JwtService jwtService;

    @GET
    public List<Note> getAll() {
        return Note.list("user.id", jwtService.getUserId());
    }

    @GET
    @Path("/{id}")
    public Note getById(@PathParam("id") Long id) {
        Note note = Note.find("id = ?1 and user.id = ?2", id, jwtService.getUserId()).firstResult();

        if (note == null) {
            throw new NotFoundException("Note introuvable");
        }

        return note;
    }

    @POST
    @Transactional
    public Response create(@Valid Note note) {
        if (note.createdAt == null || note.createdAt.isBlank()) {
            note.createdAt = "Aujourd’hui";
        }

        User user = User.findById(jwtService.getUserId());

        if (user == null) {
            throw new NotAuthorizedException("Utilisateur introuvable");
        }
        note.user = user;

        note.persist();

        return Response.status(Response.Status.CREATED).entity(note).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Note update(@PathParam("id") Long id, @Valid Note updatedNote) {
        Note note = Note.find("id = ?1 and user.id = ?2", id, jwtService.getUserId()).firstResult();

        if (note == null) {
            throw new NotFoundException("Note introuvable");
        }

        note.title = updatedNote.title;
        note.content = updatedNote.content;
        note.tag = updatedNote.tag;
        return note;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = Note.deleteById(id);

        if (!deleted) {
            throw new NotFoundException("Note introuvable");
        }

        return Response.noContent().build();
    }
}