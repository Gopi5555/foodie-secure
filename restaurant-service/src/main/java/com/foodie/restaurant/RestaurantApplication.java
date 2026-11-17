package com.foodie.restaurant;
import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
@SpringBootApplication
public class RestaurantApplication {
  public static void main(String[] a){ SpringApplication.run(RestaurantApplication.class, a); }
  @Bean CommandLineRunner seed(RestaurantRepository rr, MenuItemRepository mr){ return x -> {
    Object[][] data = {
      {"Spice Route","North Indian","🍛",4.5,30, new Object[][]{{"Butter Chicken","Creamy tomato gravy","🍗",299.0,false},{"Paneer Tikka","Charred cottage cheese","🧀",249.0,true},{"Garlic Naan","Fresh from tandoor","🫓",59.0,true},{"Dal Makhani","Slow cooked black lentils","🥣",199.0,true}}},
      {"Napoli Slice","Italian","🍕",4.3,25, new Object[][]{{"Margherita Pizza","Mozzarella and basil","🍕",349.0,true},{"Pepperoni Pizza","Spicy pepperoni","🍕",449.0,false},{"Penne Arrabbiata","Hot tomato sauce","🍝",279.0,true}}},
      {"Dragon Wok","Chinese","🥡",4.1,35, new Object[][]{{"Veg Hakka Noodles","Wok tossed","🍜",189.0,true},{"Chilli Chicken","Indo-Chinese classic","🌶️",259.0,false},{"Veg Manchurian","Crispy and saucy","🥟",199.0,true}}},
      {"Burger Barn","American","🍔",4.4,20, new Object[][]{{"Classic Cheeseburger","Double cheese","🍔",229.0,false},{"Crispy Veg Burger","Aloo tikki patty","🍔",169.0,true},{"Peri Peri Fries","Spicy and crisp","🍟",119.0,true}}}};
    for (Object[] d : data) {
      Restaurant r = new Restaurant(); r.name=(String)d[0]; r.cuisine=(String)d[1]; r.emoji=(String)d[2]; r.rating=(double)d[3]; r.etaMins=(int)d[4];
      r = rr.save(r);
      for (Object[] m : (Object[][]) d[5]) {
        MenuItem i = new MenuItem(); i.restaurantId=r.id; i.name=(String)m[0]; i.description=(String)m[1]; i.emoji=(String)m[2]; i.price=(double)m[3]; i.veg=(boolean)m[4]; mr.save(i);
      }
    } }; }
}
