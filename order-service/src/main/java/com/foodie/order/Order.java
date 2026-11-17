package com.foodie.order;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.*;
@Entity @Table(name = "orders")
public class Order {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  public Long restaurantId; public String restaurantName, userEmail, address;
  public double total;
  public String status = "PLACED";  // PLACED -> PREPARING -> OUT_FOR_DELIVERY -> DELIVERED
  public Instant createdAt = Instant.now();
  @ElementCollection(fetch = FetchType.EAGER) public List<OrderLine> items = new ArrayList<>();
}
