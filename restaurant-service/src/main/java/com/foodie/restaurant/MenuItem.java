package com.foodie.restaurant;
import jakarta.persistence.*;
@Entity
public class MenuItem {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  public Long restaurantId;
  public String name, description, emoji;
  public double price;
  public boolean veg;
}
