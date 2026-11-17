package com.foodie.auth;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;
@RestController @RequestMapping("/api/auth")
public class AuthController {
  public record Register(String name, String email, String phone, String password) {}
  public record Login(String email, String password) {}
  public record Verify(String email, String otp) {}
  public record Forgot(String email) {}
  public record Reset(String email, String otp, String newPassword) {}
  public record UserView(Long id, String name, String email, String phone, String address, String role) {
    static UserView of(User u){ return new UserView(u.id, u.name, u.email, u.phone, u.address, u.role); } }

  private final UserRepository users; private final PasswordEncoder enc; private final OtpService otp; private final JwtUtil jwt;
  AuthController(UserRepository users, PasswordEncoder enc, OtpService otp, JwtUtil jwt){ this.users = users; this.enc = enc; this.otp = otp; this.jwt = jwt; }
  private static String norm(String e){ return e == null ? "" : e.trim().toLowerCase(); }
  private static ResponseStatusException err(HttpStatus s, String m){ return new ResponseStatusException(s, m); }
  private static void checkPassword(String p){ if (p == null || p.length() < 8) throw err(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters"); }

  @PostMapping("/register") public Map<String,String> register(@RequestBody Register r){
    String email = norm(r.email());
    if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) throw err(HttpStatus.BAD_REQUEST, "Enter a valid email");
    if (r.name() == null || r.name().isBlank()) throw err(HttpStatus.BAD_REQUEST, "Name is required");
    checkPassword(r.password());
    if (users.findByEmail(email).isPresent()) throw err(HttpStatus.CONFLICT, "Email already registered");
    User u = new User(); u.name = r.name().trim(); u.email = email; u.phone = r.phone(); u.passwordHash = enc.encode(r.password());
    users.save(u); return Map.of("message", "Registered successfully. Please log in.");
  }
  /** Step 1 of login: check password, then email an OTP. */
  @PostMapping("/login") public Map<String,String> login(@RequestBody Login r){
    User u = users.findByEmail(norm(r.email())).orElse(null);
    if (u == null || r.password() == null || !enc.matches(r.password(), u.passwordHash)) throw err(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    otp.send(u.email, "LOGIN"); return Map.of("message", "OTP sent to " + u.email);
  }
  /** Step 2 of login: verify OTP, issue JWT. */
  @PostMapping("/verify-otp") public Map<String,Object> verify(@RequestBody Verify r){
    String email = norm(r.email());
    if (!otp.verify(email, "LOGIN", r.otp())) throw err(HttpStatus.BAD_REQUEST, "Invalid or expired OTP");
    User u = users.findByEmail(email).orElseThrow();
    return Map.of("token", jwt.create(u), "user", UserView.of(u));
  }
  @PostMapping("/forgot-password") public Map<String,String> forgot(@RequestBody Forgot r){
    users.findByEmail(norm(r.email())).ifPresent(u -> otp.send(u.email, "RESET"));
    return Map.of("message", "If that email is registered, an OTP has been sent."); // generic: don't reveal who has an account
  }
  @PostMapping("/reset-password") public Map<String,String> reset(@RequestBody Reset r){
    checkPassword(r.newPassword());
    String email = norm(r.email());
    if (!otp.verify(email, "RESET", r.otp())) throw err(HttpStatus.BAD_REQUEST, "Invalid or expired OTP");
    User u = users.findByEmail(email).orElseThrow(); u.passwordHash = enc.encode(r.newPassword()); users.save(u);
    return Map.of("message", "Password updated. Please log in.");
  }
}
