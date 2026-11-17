package com.foodie.auth;
import org.slf4j.*;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.security.SecureRandom;
import java.time.Instant;
@Service
public class OtpService {
  private static final Logger log = LoggerFactory.getLogger(OtpService.class);
  private final OtpRepository repo; private final PasswordEncoder enc; private final ObjectProvider<JavaMailSender> mail;
  private final String from; private final SecureRandom rnd = new SecureRandom();
  OtpService(OtpRepository repo, PasswordEncoder enc, ObjectProvider<JavaMailSender> mail, @Value("${spring.mail.username:}") String from){
    this.repo = repo; this.enc = enc; this.mail = mail; this.from = from; }

  @Transactional public void send(String email, String purpose){
    repo.deleteByEmailAndPurpose(email, purpose);
    String code = String.format("%06d", rnd.nextInt(1_000_000));
    Otp o = new Otp(); o.email = email; o.purpose = purpose; o.codeHash = enc.encode(code); o.expiresAt = Instant.now().plusSeconds(300);
    repo.save(o);
    JavaMailSender s = mail.getIfAvailable();
    if (s == null) { log.warn("DEV MODE (no SMTP configured) -> OTP for {} [{}] = {}", email, purpose, code); return; }
    try {
      SimpleMailMessage m = new SimpleMailMessage(); m.setTo(email); if (!from.isBlank()) m.setFrom(from);
      m.setSubject("Your Foodie verification code");
      m.setText("Your Foodie OTP is " + code + ". It expires in 5 minutes.\nIf you did not request this, please ignore this email.");
      s.send(m);
    } catch (MailException e) { log.error("Mail failed", e); throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not send email. Try again later."); }
  }
  @Transactional public boolean verify(String email, String purpose, String code){
    var found = repo.findTopByEmailAndPurposeOrderByIdDesc(email, purpose);
    if (found.isEmpty() || code == null) return false;
    Otp o = found.get();
    if (o.expiresAt.isBefore(Instant.now()) || o.attempts >= 5) { repo.delete(o); return false; }
    if (!enc.matches(code.trim(), o.codeHash)) { o.attempts++; repo.save(o); return false; }
    repo.delete(o); return true;
  }
}
