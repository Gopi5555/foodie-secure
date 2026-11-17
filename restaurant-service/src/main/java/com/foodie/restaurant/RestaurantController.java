package com.foodie.restaurant;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/restaurants")
public class RestaurantController {
  private final RestaurantRepository restaurants; private final MenuItemRepository menu;
  RestaurantController(RestaurantRepository r, MenuItemRepository m){ restaurants = r; menu = m; }
  @GetMapping public List<Restaurant> all(){ return restaurants.findAll(); }
  @GetMapping("/foods") public List<MenuItem> foods(){ return menu.findAll(); }
  @GetMapping("/{id}") public Restaurant one(@PathVariable Long id){ return restaurants.findById(id).orElseThrow(); }
  @GetMapping("/{id}/menu") public List<MenuItem> menu(@PathVariable Long id){ return menu.findByRestaurantId(id); }
  // ---- ADMIN only (role enforced at the API gateway) ----
  @PostMapping public Restaurant add(@RequestBody Restaurant r){ r.id = null; return restaurants.save(r); }
  @DeleteMapping("/{id}") public void delete(@PathVariable Long id){ menu.deleteAll(menu.findByRestaurantId(id)); restaurants.deleteById(id); }
  @PostMapping("/{id}/menu") public MenuItem addItem(@PathVariable Long id, @RequestBody MenuItem m){
    restaurants.findById(id).orElseThrow(); m.id = null; m.restaurantId = id; return menu.save(m); }
  @DeleteMapping("/foods/{id}") public void deleteItem(@PathVariable Long id){ menu.deleteById(id); }
}
