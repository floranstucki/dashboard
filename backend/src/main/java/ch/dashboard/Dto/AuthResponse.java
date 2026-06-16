package ch.dashboard.Dto;

public class AuthResponse {
    public String token;
    public Long userId;
    public String username;
    public String email;

    public AuthResponse(String token, Long userId, String username, String email) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.email = email;
    }
}