package com.foodie.auth;
import jakarta.persistence.*;
@Entity @Table(name = "users")
public class User {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  public String name; @Column(unique = true) public String email;
  public String phone, address, passwordHash; public String role = "USER"; // USER | ADMIN
}
