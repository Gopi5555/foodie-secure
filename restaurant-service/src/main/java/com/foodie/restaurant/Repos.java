package com.foodie.restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
interface RestaurantRepository extends JpaRepository<Restaurant, Long> {}
interface MenuItemRepository extends JpaRepository<MenuItem, Long> { List<MenuItem> findByRestaurantId(Long restaurantId); }
