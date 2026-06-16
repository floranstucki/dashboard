package ch.dashboard.Resource;

import ch.dashboard.Dto.AuthResponse;
import ch.dashboard.Dto.LoginRequest;
import ch.dashboard.Dto.RegisterRequest;
import ch.dashboard.Entity.User;
import ch.dashboard.Service.PasswordUtil;
import io.smallrye.jwt.build.Jwt;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import ch.dashboard.Service.JwtService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import java.time.Duration;
import java.util.Set;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    JwtService jwtService;

    @POST
    @Path("/register")
    @Transactional
    public AuthResponse register(@Valid RegisterRequest request) {
        User existingUser = User.find("email", request.email).firstResult();

        if (existingUser != null) {
            throw new BadRequestException("Cet email est déjà utilisé.");
        }

        User user = new User();
        user.username = request.username;
        user.email = request.email;
        user.passwordHash = PasswordUtil.hash(request.password);
        user.persist();

        String token = generateToken(user);

        return new AuthResponse(token, user.id, user.username, user.email);
    }

    @POST
    @Path("/login")
    public AuthResponse login(@Valid LoginRequest request) {
        User user = User.find("email", request.email).firstResult();

        if (user == null || !PasswordUtil.verify(request.password, user.passwordHash)) {
            throw new NotAuthorizedException("Email ou mot de passe incorrect.");
        }

        String token = generateToken(user);

        return new AuthResponse(token, user.id, user.username, user.email);
    }

    private String generateToken(User user) {
        return Jwt.issuer("home-dashboard")
                .subject(user.email)
                .groups(Set.of("USER"))
                .claim("userId", user.id)
                .claim("username", user.username)
                .expiresIn(Duration.ofHours(12))
                .sign();
    }

    @GET
    @Path("/me")
    @Authenticated
    public AuthResponse me() {
        User user = User.findById(jwtService.getUserId());

        if (user == null) {
            throw new NotAuthorizedException("Utilisateur introuvable.");
        }

        return new AuthResponse(null, user.id, user.username, user.email);
    }
}