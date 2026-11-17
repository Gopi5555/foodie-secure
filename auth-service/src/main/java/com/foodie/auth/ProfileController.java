package com.foodie.auth;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController @RequestMapping("/api/profile")
public class ProfileController {
  private final UserRepository users;
  ProfileController(UserRepository users){ this.users = users; }
  @GetMapping public AuthController.UserView get(@RequestHeader("X-User-Email") String email){ return AuthController.UserView.of(users.findByEmail(email).orElseThrow()); }
  @PutMapping public AuthController.UserView update(@RequestHeader("X-User-Email") String email, @RequestBody Map<String,String> b){
    User u = users.findByEmail(email).orElseThrow();
    if (b.get("name") != null && !b.get("name").isBlank()) u.name = b.get("name").trim();
    u.phone = b.get("phone"); u.address = b.get("address");
    return AuthController.UserView.of(users.save(u));
  }
}
