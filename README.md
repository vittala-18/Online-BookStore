# Online Book Store Management System & QA Audit Suite

**Institution:** Alliance University &bull; School of Computer Science and Engineering  
**Degree:** B.Tech Computer Science and Engineering &bull; Academic Micro-Project  
**Author / Candidate:** Student Capstone Project  
**Tech Stack:** Java 17 LTS, Jakarta Servlet 6.0, JSP, JDBC, Apache Tomcat 10.1, MySQL 8.0, JUnit 5  

---

## 1. Project Overview & Architecture

The **Online Book Store Management System** is a full-stack, enterprise-grade Java web application engineered according to the classical **3-Tier Model-View-Controller (MVC)** architectural paradigm:

```
[ Browser / Client: Desktop & Mobile ]
                 │  HTTP GET / POST
                 ▼
[ Filter Chain: EncodingFilter & AuthorizationFilter ]
                 │
                 ▼
[ Controller Layer: Jakarta Servlets (Tomcat 10.1) ]
  ├── HomeServlet, BookServlet, CartServlet, CheckoutServlet, OrderServlet
  └── AdminBookServlet, AdminCategoryServlet, AdminInventoryServlet, AdminReportServlet
                 │
                 ▼
[ Service Layer: Business Logic & Transaction Boundaries ]
  ├── CartService (Subtotal, 5% GST, Free Shipping > ₹500, Strict Zero/Negative Rejection)
  ├── OrderService (Atomic JDBC Checkout Transaction, Stock Lock & Rollback)
  ├── InventoryService (Real-time Stock Movements & Cancellation Restock)
  └── AuthenticationService (Salted SHA-256 Hashing, Session Fixation Defense)
                 │
                 ▼
[ Data Access Object (DAO) Layer: Parameterized SQL Queries ]
  ├── BookDAO, CategoryDAO, CustomerDAO, OrderDAO, InventoryDAO
  └── PreparedStatement bindings preventing SQL Injection (CWE-89)
                 │
                 ▼
[ Database: MySQL 8.0+ Community Server (InnoDB Engine) ]
  ├── tables: books, categories, users, orders, order_items, inventory_movements
  └── constraints: FOREIGN KEY, UNIQUE(email, isbn), CHECK(price >= 0, stock >= 0)
```

---

## 2. Senior QA Engineering Functional Audit Report (20/20 Checkpoints)

Below is the certified audit matrix inspecting all customer and administrator workflows against the 20 criteria specified in the academic audit guidelines:

| # | Feature | Expected Behavior | Actual Behavior | Defect Identified | Fix Applied | Test Result |
|---|---------|-------------------|-----------------|-------------------|-------------|-------------|
| **1** | Buttons Without Implemented Actions | Every visible button triggers an implemented Servlet or client workflow. | Placeholder buttons with `onclick=""` or `<button type="button">` existed in inventory preview. | Dead buttons violating specification. | Connected all actions to Servlets (`AdminInventoryServlet`, `BookServlet`) with CSRF tokens. | **PASSED** |
| **2** | Links Pointing to Invalid Routes | All navbar, footer, and breadcrumb links resolve to valid routes. | Links pointed to dead hashes (`href="#"`) or outdated `.do` paths. | 404 Not Found navigation errors. | Standardized all links to `${pageContext.request.contextPath}/` and mapped in `web.xml`. | **PASSED** |
| **3** | Forms Not Submitting Correctly | Forms validate input, encode UTF-8, and use POST for mutations. | Add Book and Checkout used GET, exposing PII in query parameters. | Insecure HTTP Method & data leakage (CWE-598). | Converted all mutating forms to POST; added Bootstrap validation and server-side checks. | **PASSED** |
| **4** | JavaScript Errors | Zero uncaught console exceptions and graceful fallbacks. | `Uncaught TypeError: Cannot read properties of null` when quantity selector missed ID binding on mobile. | Broken cart quantity updates on responsive viewport. | Replaced ID lookups with event delegation using `e.target.closest()`. | **PASSED** |
| **5** | Servlet Mappings Mismatch | Form action URLs must match `@WebServlet` or `web.xml` mappings. | Category deletion form posted to `/admin/deleteCategory` while Servlet was mapped to `/admin/categories`. | HTTP 404 on administrative deletion. | Unified actions under `/admin/categories` handling `action=delete` in `doPost`. | **PASSED** |
| **6** | Missing Database Queries | SQL queries must project all required fields with proper joins. | OrderDAO query omitted join on books table, causing blank titles/covers on invoice. | Incomplete SQL projection. | Updated query with `JOIN books b ON oi.book_id = b.id` selecting title, author, cover. | **PASSED** |
| **7** | Buttons Changing UI Without Saving | UI changes must persist to MySQL before updating display. | Quick stock adjustment modified table DOM using JS without executing POST request. | Phantom UI updates lost on refresh. | Created AJAX endpoint `POST /admin/inventory?action=updateStock` persisting to MySQL. | **PASSED** |
| **8** | Forms Showing Success on Failure | Success flash alerts only display when database returns `rowsAffected > 0`. | Profile form displayed green success alert even when SQL constraint error occurred. | False-positive confirmation. | Moved success message assignment inside `if (rowsAffected > 0)`; added rollback and error flash. | **PASSED** |
| **9** | Invalid Search, Filter & Pagination | Pagination must retain keyword, category, and price filters across pages. | Navigating to page 2 cleared search keyword and category filter. | State loss in pagination links. | Created URL query string builder preserving active query parameters. | **PASSED** |
| **10** | Incorrect Cart Calculations | Totals, 5% GST, and free delivery (&ge; ₹500) must be calculated strictly server-side. | Browser computed total and sent as POST parameter; allowed zero/negative quantities. | CWE-602 Price Tampering vulnerability. | Enforced authoritative server recalculation using database prices; rejected `quantity <= 0`. | **PASSED** |
| **11** | Checkout Failing to Update Inventory | Purchasing must decrement stock; checkout must reject out-of-stock orders. | Allowed purchasing 5 copies of a book with only 2 in stock (stock went to -3). | Negative inventory anomaly & overselling. | Implemented atomic `UPDATE books SET stock = stock - ? WHERE id = ? AND stock >= ?`. | **PASSED** |
| **12** | Database Transaction & Rollback | Order and inventory updates must run inside atomic JDBC transaction. | Order inserted, but when line item failed connection closed without rollback. | Partial database writes violating Atomicity. | Enclosed checkout in `conn.setAutoCommit(false)` with explicit `conn.rollback()` in catch. | **PASSED** |
| **13** | Authorization in Protected Routes | `/admin/*` requires ADMIN role; unauthenticated users redirected to login. | Direct URL navigation to `/admin/dashboard.jsp` allowed unauthenticated access. | Broken Access Control (OWASP Top 10 A01). | Configured `AuthorizationFilter` on `/*` verifying session user and `user.isAdmin()`. | **PASSED** |
| **14** | Insecure Direct Object References (IDOR) | Customer can only view their own orders; unauthorized access rejected with 403. | Modifying `?orderId=102` in URL allowed viewing other customers' full invoices. | IDOR vulnerability leaking customer PII. | Added authorization check `if (!user.isAdmin() && order.getCustomerId() != user.getId()) 403`. | **PASSED** |
| **15** | Missing Server-Side Validation | Server must validate email format, 10-digit Indian phones, and price bounds. | Form relied solely on client HTML5 `required`; curl POST allowed empty and malformed data. | Client-side only validation vulnerability. | Implemented centralized `ValidationUtil` in Java with regex and numeric bounds checking. | **PASSED** |
| **16** | Broken Images & Navigation | Book covers must load cleanly; broken external URLs must show graceful SVG fallback. | Broken cover links displayed browser broken image icons, misaligning grid. | Broken UI presentation. | Added `onerror` fallback handler pointing to local stylized book placeholder SVG. | **PASSED** |
| **17** | Missing Loading & Empty States | Clean empty states for empty cart, zero search results, and database errors. | Searching for nonexistent book rendered a blank page with no reset action. | Confusing user experience. | Created informative empty-state cards with helpful tips and "Browse Catalogue" buttons. | **PASSED** |
| **18** | Incompatible Dependencies | Must use Java 17, Tomcat 10.1 (`jakarta.*`), and MySQL Connector/J 8.0+. | `pom.xml` referenced legacy `javax.servlet:4.0.1`, throwing `ClassNotFoundException` on Tomcat 10. | Classpath namespace incompatibility. | Migrated to `jakarta.servlet:jakarta.servlet-api:6.0.0` and `jakarta.servlet.jsp.jstl:3.0.0`. | **PASSED** |
| **19** | Missing DB Constraints & Indexes | Relational schema with foreign keys, UNIQUE indexes, and CHECK constraints. | Lacked UNIQUE on `email` & `isbn`; used FLOAT for money causing rounding errors. | Data corruption & rounding drift. | Re-engineered `schema.sql` with `DECIMAL(10,2)`, `UNIQUE(email, isbn)`, and foreign keys. | **PASSED** |
| **20** | Missing or Failing Automated Tests | Automated unit & integration tests covering pricing, stock, validation, and rollback. | No automated JUnit test classes existed in the project repository. | Zero automated test coverage. | Created complete JUnit 5 suite (`CartServiceTest`, `OrderServiceTest`, `ValidationUtilTest`). | **PASSED** |

---

## 3. Database Schema & Setup Guide

### Execution Commands (MySQL 8.0+)
```bash
# 1. Run database schema
mysql -u root -p < database/schema.sql

# 2. Load realistic university sample data
mysql -u root -p < database/sample-data.sql
```

### Table Relationships
- `categories` (1) &mdash; (M) `books` (`ON DELETE RESTRICT`)
- `users` (1) &mdash; (M) `orders` (`ON DELETE RESTRICT`)
- `orders` (1) &mdash; (M) `order_items` (`ON DELETE CASCADE`)
- `books` (1) &mdash; (M) `order_items` (`ON DELETE RESTRICT`)
- `books` (1) &mdash; (M) `inventory_movements` (`ON DELETE RESTRICT`)

---

## 4. Local Deployment Instructions (IntelliJ IDEA & Tomcat 10.1)

1. **Clone or Download the Project:**  
   Click the **"Download Full Project (.ZIP)"** button in the in-app Code Explorer tab to get `online-book-store-management-system.zip`.
2. **Open in IntelliJ IDEA:**  
   Select **File &rarr; Open** and select the unzipped project folder. IntelliJ will automatically detect the Maven `pom.xml`.
3. **Configure Database Credentials:**  
   Edit `src/main/resources/db.properties` or set environment variables:
   ```properties
   DB_URL=jdbc:mysql://localhost:3306/bookstore_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   ```
4. **Build with Maven:**
   ```bash
   mvn clean package
   ```
   This compiles all Java classes, executes the JUnit 5 test suite, and produces `target/online-book-store.war`.
5. **Run on Apache Tomcat 10.1:**
   - In IntelliJ: **Run &rarr; Edit Configurations &rarr; Add New &rarr; Tomcat Server (Local)**.
   - Set Application Server to Tomcat 10.1 installation directory.
   - In the **Deployment** tab, add `online-book-store:war exploded`.
   - Start the server. The application will open at:
     `http://localhost:8080/online-book-store/`

---

## 5. Demonstration Credentials

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Administrator** | `admin@alliance.edu` | `Admin@123` | Full administrative control: Book CRUD, Categories, Inventory adjustments, Order state transitions, Sales reports & CSV export. |
| **Customer (Student)** | `rahul.sharma@student.alliance.edu` | `Student@123` | Customer catalogue, search, filters, shopping cart, checkout, order history, profile updates. |
| **Customer** | `pooja.iyer@gmail.com` | `Student@123` | Customer features with separate order history. |
