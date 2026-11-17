package com.foodie.order;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
@RestController @RequestMapping("/api/orders")
public class OrderController {
  record Item(Long menuItemId, int qty) {}
  record PlaceOrder(Long restaurantId, String address, List<Item> items) {}
  record MenuDto(Long id, String name, double price) {}
  record RestDto(Long id, String name) {}
  static final double DELIVERY_FEE = 30;
  private final OrderRepository repo; private final RestClient rest;
  OrderController(OrderRepository repo, @Value("${restaurant.url}") String url){ this.repo = repo; this.rest = RestClient.create(url); }

  // X-User-Email is set by the gateway from the verified JWT – never from the client
  @PostMapping public Order place(@RequestHeader("X-User-Email") String email, @RequestBody PlaceOrder req){
    RestDto r = rest.get().uri("/api/restaurants/{id}", req.restaurantId()).retrieve().body(RestDto.class);
    List<MenuDto> menu = rest.get().uri("/api/restaurants/{id}/menu", req.restaurantId()).retrieve().body(new ParameterizedTypeReference<>(){});
    Order o = new Order(); o.restaurantId = r.id(); o.restaurantName = r.name(); o.userEmail = email; o.address = req.address();
    double sum = 0;
    for (Item i : req.items()) {
      MenuDto m = menu.stream().filter(x -> x.id().equals(i.menuItemId())).findFirst().orElseThrow();
      o.items.add(new OrderLine(m.name(), m.price(), i.qty())); sum += m.price() * i.qty();
    }
    o.total = sum + DELIVERY_FEE; return repo.save(o);
  }
  @GetMapping public List<Order> mine(@RequestHeader("X-User-Email") String email){ return repo.findByUserEmailOrderByIdDesc(email); }
  @GetMapping("/{id}") public Order one(@RequestHeader("X-User-Email") String email, @PathVariable Long id){
    Order o = repo.findById(id).orElseThrow();
    if (!o.userEmail.equals(email)) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
    return o;
  }
}
