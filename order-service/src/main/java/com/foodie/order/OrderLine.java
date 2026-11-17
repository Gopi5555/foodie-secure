package com.foodie.order;
import jakarta.persistence.Embeddable;
@Embeddable
public class OrderLine {
  public String name; public double price; public int qty;
  public OrderLine() {}
  public OrderLine(String name, double price, int qty){ this.name=name; this.price=price; this.qty=qty; }
}
