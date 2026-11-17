package com.foodie.restaurant;
import jakarta.persistence.*;
@Entity
public class Restaurant {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  public String name, cuisine, emoji;
  public double rating;
  public int etaMins;
}
