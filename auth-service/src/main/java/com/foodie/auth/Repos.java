package com.foodie.auth;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
interface UserRepository extends JpaRepository<User, Long> { Optional<User> findByEmail(String email); }
interface OtpRepository extends JpaRepository<Otp, Long> {
  Optional<Otp> findTopByEmailAndPurposeOrderByIdDesc(String email, String purpose);
  void deleteByEmailAndPurpose(String email, String purpose);
}
