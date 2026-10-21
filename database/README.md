# Database Setup Guide: MySQL 8.0+

This folder contains the complete, production-grade SQL scripts for the **Online Book Store Management System** (Alliance University B.Tech CSE Project).

---

## Prerequisites
- MySQL Community Server 8.0 or 8.4 LTS
- MySQL Workbench or MySQL Command-Line Client

---

## Execution Steps

### 1. Log in to MySQL
```bash
mysql -u root -p
```

### 2. Run the Schema Script
Create the database, relational tables, foreign key constraints, indexes, and audit logs:
```sql
SOURCE /path/to/database/schema.sql;
```
Or directly from bash:
```bash
mysql -u root -p < database/schema.sql
```

### 3. Load Sample Books, Users, and Orders
```bash
mysql -u root -p < database/sample-data.sql
```

### 4. Verify Tables and Data
```sql
USE bookstore_db;
SHOW TABLES;
SELECT COUNT(*) FROM books;       -- Should output 10
SELECT COUNT(*) FROM categories;  -- Should output 5
SELECT COUNT(*) FROM users;       -- Should output 3
SELECT * FROM orders;
```

---

## Database Connection Configuration
In `src/main/resources/db.properties` or environment variables:
```properties
db.url=jdbc:mysql://localhost:3306/bookstore_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
db.user=root
db.password=your_secure_password
db.driver=com.mysql.cj.jdbc.Driver
db.pool.maxTotal=20
db.pool.maxIdle=5
```

---

## Security Best Practices
- Passwords stored in `users.password_hash` are salted and hashed using **SHA-256**.
- Plain text passwords are NEVER stored.
- PreparedStatements are enforced across all DAO queries to eliminate SQL Injection (CWE-89).
- Check constraints (`CHECK (price >= 0)`, `CHECK (stock >= 0)`) ensure data integrity at the database engine level.
