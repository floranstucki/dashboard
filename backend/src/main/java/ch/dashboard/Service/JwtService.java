package ch.dashboard.Service;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.jwt.JsonWebToken;

@RequestScoped
public class JwtService {

    @Inject
    JsonWebToken jwt;

    public Long getUserId() {
        Object claim = jwt.getClaim("userId");

        if (claim == null) {
            throw new IllegalStateException("userId absent du JWT");
        }

        return Long.valueOf(claim.toString());
    }

    public String getUsername() {
        return jwt.getClaim("username");
    }

    public String getEmail() {
        return jwt.getSubject();
    }

    public JsonWebToken getJwt() {
        return jwt;
    }
}