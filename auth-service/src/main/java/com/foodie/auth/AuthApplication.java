package com.foodie.auth;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
@SpringBootApplication
public class AuthApplication {
  public static void main(String[] a){ SpringApplication.run(AuthApplication.class, a); }
  @Bean PasswordEncoder passwordEncoder(){ return new BCryptPasswordEncoder(); }
  @Bean CommandLineRunner seedAdmin(UserRepository users, PasswordEncoder enc, @Value("${app.admin.email}") String email){ return x -> {
    if (users.findByEmail(email).isEmpty()) { User u = new User(); u.name = "Admin"; u.email = email; u.role = "ADMIN"; u.passwordHash = enc.encode("Admin@123"); users.save(u); } }; }
}
