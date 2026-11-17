package com.foodie.auth;
import jakarta.persistence.*;
import java.time.Instant;
@Entity
public class Otp {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  public String email, purpose, codeHash; public Instant expiresAt; public int attempts;
}
