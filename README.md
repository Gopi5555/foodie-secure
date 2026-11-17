# Foodie v2 – Secure Food Delivery (React + Spring Boot Microservices)

```
React (5173) → API Gateway (8080, JWT + role check) ─┬→ auth-service       (8083) register/login+OTP/forgot/profile
                                                     ├→ restaurant-service (8081) restaurants + food items (admin writes)
                                                     └→ order-service      (8082) orders per logged-in user
```
## Security flow
1. **Register** → password stored as BCrypt hash.
2. **Login** = password check → 6-digit **OTP emailed** (5 min expiry, max 5 attempts, stored hashed) → **verify OTP** → JWT (8h).
3. **Forgot password** = email → OTP → new password.
4. Gateway validates JWT on every call, adds `X-User-Email`/`X-User-Role`; only **ADMIN** can POST/DELETE restaurants & food items.

## Run (Java 17+, Maven, Node 18+)
```bash
cd auth-service       && mvn spring-boot:run
cd restaurant-service && mvn spring-boot:run
cd order-service      && mvn spring-boot:run
cd api-gateway        && mvn spring-boot:run
cd frontend && npm install && npm run dev      # http://localhost:5173
```
**Admin login:** `admin@foodie.com` / `Admin@123` (change `ADMIN_EMAIL` env / password!).

## Email OTP
Without SMTP settings the OTP is **printed in the auth-service console** (dev mode). For real email (Gmail example, use an App Password):
```bash
export MAIL_HOST=smtp.gmail.com MAIL_USERNAME=you@gmail.com MAIL_PASSWORD=your-app-password
export ADMIN_EMAIL=you@gmail.com     # so the admin OTP reaches you
export JWT_SECRET=<32+ random chars> # set the SAME value for auth-service and api-gateway
```
## Pages
Login · Register · Forgot password · Restaurants · Restaurant menu · All dishes (search/filter) · Orders (live tracker) · Profile · Admin (add/delete restaurants & dishes)

## Production hardening
HTTPS, PostgreSQL, rate-limit OTP/login, refresh tokens, Redis for OTPs, secrets manager, Docker Compose.
