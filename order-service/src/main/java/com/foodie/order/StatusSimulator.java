package com.foodie.order;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.util.List;
/** Simulates kitchen + rider progress so the UI tracker moves in near real time. */
@Component
public class StatusSimulator {
  private static final List<String> FLOW = List.of("PLACED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED");
  private final OrderRepository repo;
  StatusSimulator(OrderRepository repo){ this.repo = repo; }
  @Scheduled(fixedDelay = 15000)
  void advance(){
    for (Order o : repo.findAll()) {
      int i = FLOW.indexOf(o.status);
      if (i < FLOW.size() - 1) { o.status = FLOW.get(i + 1); repo.save(o); }
    }
  }
}
