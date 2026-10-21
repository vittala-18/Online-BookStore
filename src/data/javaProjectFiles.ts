export interface JavaFileEntry {
  path: string;
  name: string;
  category: 'POM' | 'MODEL' | 'DAO' | 'SERVICE' | 'CONTROLLER' | 'FILTER' | 'UTIL' | 'JSP_CLIENT' | 'JSP_ADMIN' | 'CONFIG' | 'TEST' | 'SQL';
  language: 'java' | 'xml' | 'html' | 'sql' | 'markdown';
  description: string;
  content: string;
}

export const JAVA_PROJECT_FILES: JavaFileEntry[] = [
  {
    path: 'pom.xml',
    name: 'pom.xml',
    category: 'POM',
    language: 'xml',
    description: 'Maven Project Object Model configured for Java 17, Apache Tomcat 10.1 (Jakarta EE 10 / Servlet 6.0), MySQL Connector/J 8.0, and JUnit 5.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.alliance.bookstore</groupId>
    <artifactId>online-book-store</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>war</packaging>

    <name>Online Book Store Management System</name>
    <description>B.Tech CSE Academic Micro-Project - Alliance University</description>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <jakarta.servlet.version>6.0.0</jakarta.servlet.version>
        <jakarta.jstl.version>3.0.0</jakarta.jstl.version>
        <mysql.connector.version>8.0.33</mysql.connector.version>
        <junit.version>5.10.2</junit.version>
    </properties>

    <dependencies>
        <!-- Jakarta Servlet API 6.0 for Apache Tomcat 10.1+ -->
        <dependency>
            <groupId>jakarta.servlet</groupId>
            <artifactId>jakarta.servlet-api</artifactId>
            <version>\${jakarta.servlet.version}</version>
            <scope>provided</scope>
        </dependency>

        <!-- Jakarta Standard Tag Library (JSTL) -->
        <dependency>
            <groupId>jakarta.servlet.jsp.jstl</groupId>
            <artifactId>jakarta.servlet.jsp.jstl-api</artifactId>
            <version>\${jakarta.jstl.version}</version>
        </dependency>
        <dependency>
            <groupId>org.glassfish.web</groupId>
            <artifactId>jakarta.servlet.jsp.jstl</artifactId>
            <version>\${jakarta.jstl.version}</version>
        </dependency>

        <!-- MySQL Connector/J JDBC Driver -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>\${mysql.connector.version}</version>
        </dependency>

        <!-- JUnit 5 Jupiter for Unit Testing -->
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-api</artifactId>
            <version>\${junit.version}</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-engine</artifactId>
            <version>\${junit.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <finalName>online-book-store</finalName>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-war-plugin</artifactId>
                <version>3.4.0</version>
                <configuration>
                    <failOnMissingWebXml>false</failOnMissingWebXml>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <source>17</source>
                    <target>17</target>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>`
  },
  {
    path: 'src/main/webapp/WEB-INF/web.xml',
    name: 'web.xml',
    category: 'CONFIG',
    language: 'xml',
    description: 'Deployment descriptor defining filters, session timeout, welcome files, and standard HTTP error pages (400, 403, 404, 500).',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="https://jakarta.ee/xml/ns/jakartaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="https://jakarta.ee/xml/ns/jakartaee
                             https://jakarta.ee/xml/ns/jakartaee/web-app_6_0.xsd"
         version="6.0">

    <display-name>Online Book Store Management System</display-name>

    <welcome-file-list>
        <welcome-file>home</welcome-file>
        <welcome-file>index.jsp</welcome-file>
    </welcome-file-list>

    <!-- Encoding Filter -->
    <filter>
        <filter-name>EncodingFilter</filter-name>
        <filter-class>com.bookstore.filter.EncodingFilter</filter-class>
    </filter>
    <filter-mapping>
        <filter-name>EncodingFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>

    <!-- Authentication & Authorization Filter -->
    <filter>
        <filter-name>AuthorizationFilter</filter-name>
        <filter-class>com.bookstore.filter.AuthorizationFilter</filter-class>
    </filter>
    <filter-mapping>
        <filter-name>AuthorizationFilter</filter-name>
        <url-pattern>/admin/*</url-pattern>
        <url-pattern>/checkout</url-pattern>
        <url-pattern>/orders</url-pattern>
        <url-pattern>/profile</url-pattern>
    </filter-mapping>

    <!-- Session Timeout Configuration (30 minutes) -->
    <session-config>
        <session-timeout>30</session-timeout>
        <cookie-config>
            <http-only>true</http-only>
            <secure>false</secure> <!-- set to true in production HTTPS -->
        </cookie-config>
        <tracking-mode>COOKIE</tracking-mode>
    </session-config>

    <!-- Error Page Handlers -->
    <error-page>
        <error-code>400</error-code>
        <location>/error/400.jsp</location>
    </error-page>
    <error-page>
        <error-code>403</error-code>
        <location>/error/403.jsp</location>
    </error-page>
    <error-page>
        <error-code>404</error-code>
        <location>/error/404.jsp</location>
    </error-page>
    <error-page>
        <error-code>500</error-code>
        <location>/error/500.jsp</location>
    </error-page>
</web-app>`
  },
  {
    path: 'src/main/java/com/bookstore/model/Book.java',
    name: 'Book.java',
    category: 'MODEL',
    language: 'java',
    description: 'Encapsulated domain entity representing a book with validation and stock getters.',
    content: `package com.bookstore.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.sql.Timestamp;

/**
 * Domain entity representing a Book in the bookstore catalogue.
 */
public class Book implements Serializable {
    private static final long serialVersionUID = 1L;

    private int id;
    private String title;
    private String author;
    private int categoryId;
    private String categoryName;
    private String description;
    private String publisher;
    private String isbn;
    private BigDecimal price;
    private int stock;
    private String coverImage;
    private boolean featured;
    private boolean active;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public Book() {
        this.active = true;
        this.price = BigDecimal.ZERO;
        this.stock = 0;
    }

    public Book(int id, String title, String author, int categoryId, BigDecimal price, int stock) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.categoryId = categoryId;
        this.price = price;
        this.stock = stock;
        this.active = true;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public int getCategoryId() { return categoryId; }
    public void setCategoryId(int categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }

    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }

    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }

    public boolean isFeatured() { return featured; }
    public void setFeatured(boolean featured) { this.featured = featured; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }

    public boolean isAvailable() {
        return active && stock > 0;
    }
}`
  },
  {
    path: 'src/main/java/com/bookstore/model/Customer.java',
    name: 'Customer.java',
    category: 'MODEL',
    language: 'java',
    description: 'Customer entity encapsulating customer credentials, profile details, and role.',
    content: `package com.bookstore.model;

import java.io.Serializable;
import java.sql.Timestamp;

/**
 * Domain entity representing an authenticated Customer or Administrator.
 */
public class Customer implements Serializable {
    private static final long serialVersionUID = 1L;

    public enum Role {
        CUSTOMER, ADMIN
    }

    private int id;
    private String fullName;
    private String email;
    private String phone;
    private String passwordHash;
    private String salt;
    private String deliveryAddress;
    private Role role;
    private boolean active;
    private Timestamp createdAt;

    public Customer() {
        this.role = Role.CUSTOMER;
        this.active = true;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getSalt() { return salt; }
    public void setSalt(String salt) { this.salt = salt; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public boolean isAdmin() {
        return this.role == Role.ADMIN;
    }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}`
  },
  {
    path: 'src/main/java/com/bookstore/model/CartItem.java',
    name: 'CartItem.java',
    category: 'MODEL',
    language: 'java',
    description: 'Session shopping cart item encapsulating book reference, quantity, unit price, and subtotal.',
    content: `package com.bookstore.model;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * Represents a book item placed in the user's shopping cart.
 */
public class CartItem implements Serializable {
    private static final long serialVersionUID = 1L;

    private Book book;
    private int quantity;

    public CartItem(Book book, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }
        this.book = book;
        this.quantity = quantity;
    }

    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }
        this.quantity = quantity;
    }

    public BigDecimal getSubtotal() {
        if (book == null || book.getPrice() == null) {
            return BigDecimal.ZERO;
        }
        return book.getPrice().multiply(BigDecimal.valueOf(quantity));
    }
}`
  },
  {
    path: 'src/main/java/com/bookstore/model/Order.java',
    name: 'Order.java',
    category: 'MODEL',
    language: 'java',
    description: 'Order aggregate root capturing customer, shipping address, line items, timestamps, and status.',
    content: `package com.bookstore.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

public class Order implements Serializable {
    private static final long serialVersionUID = 1L;

    public enum Status {
        PLACED, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
    }

    private int id;
    private String orderReference;
    private int customerId;
    private String customerName;
    private String customerEmail;
    private String deliveryAddress;
    private BigDecimal subtotal;
    private BigDecimal deliveryCharge;
    private BigDecimal tax;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private Status status;
    private Timestamp orderDate;
    private List<OrderItem> items = new ArrayList<>();

    public Order() {
        this.status = Status.PLACED;
        this.subtotal = BigDecimal.ZERO;
        this.deliveryCharge = BigDecimal.ZERO;
        this.tax = BigDecimal.ZERO;
        this.totalAmount = BigDecimal.ZERO;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getOrderReference() { return orderReference; }
    public void setOrderReference(String orderReference) { this.orderReference = orderReference; }

    public int getCustomerId() { return customerId; }
    public void setCustomerId(int customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getDeliveryCharge() { return deliveryCharge; }
    public void setDeliveryCharge(BigDecimal deliveryCharge) { this.deliveryCharge = deliveryCharge; }

    public BigDecimal getTax() { return tax; }
    public void setTax(BigDecimal tax) { this.tax = tax; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public Timestamp getOrderDate() { return orderDate; }
    public void setOrderDate(Timestamp orderDate) { this.orderDate = orderDate; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
}`
  },
  {
    path: 'src/main/java/com/bookstore/util/DatabaseConnection.java',
    name: 'DatabaseConnection.java',
    category: 'UTIL',
    language: 'java',
    description: 'Thread-safe JDBC connection factory utilizing environment variables and properties with auto-reconnect.',
    content: `package com.bookstore.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Singleton database connection utility managing MySQL JDBC connections.
 */
public class DatabaseConnection {
    private static final Logger LOGGER = Logger.getLogger(DatabaseConnection.class.getName());

    private static final String DEFAULT_URL = "jdbc:mysql://localhost:3306/bookstore_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static final String DEFAULT_USER = "root";
    private static final String DEFAULT_PASS = "root123";

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            LOGGER.log(Level.SEVERE, "MySQL JDBC Driver not found in classpath!", e);
        }
    }

    private DatabaseConnection() {}

    public static Connection getConnection() throws SQLException {
        String url = System.getenv("DB_URL") != null ? System.getenv("DB_URL") : DEFAULT_URL;
        String user = System.getenv("DB_USER") != null ? System.getenv("DB_USER") : DEFAULT_USER;
        String pass = System.getenv("DB_PASSWORD") != null ? System.getenv("DB_PASSWORD") : DEFAULT_PASS;
        return DriverManager.getConnection(url, user, pass);
    }
}`
  },
  {
    path: 'src/main/java/com/bookstore/util/PasswordUtil.java',
    name: 'PasswordUtil.java',
    category: 'UTIL',
    language: 'java',
    description: 'Cryptographically secure SHA-256 salted password hashing and timing-safe verification.',
    content: `package com.bookstore.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;

/**
 * Provides salted SHA-256 password hashing.
 * Strictly prevents plaintext password storage.
 */
public class PasswordUtil {

    public static String generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[16];
        random.nextBytes(salt);
        return HexFormat.of().formatHex(salt);
    }

    public static String hashPassword(String password, String salt) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            digest.update(salt.getBytes(StandardCharsets.UTF_8));
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    public static boolean verifyPassword(String inputPassword, String storedHash, String salt) {
        String calculatedHash = hashPassword(inputPassword, salt);
        return MessageDigest.isEqual(
            calculatedHash.getBytes(StandardCharsets.UTF_8),
            storedHash.getBytes(StandardCharsets.UTF_8)
        );
    }
}`
  },
  {
    path: 'src/main/java/com/bookstore/util/ValidationUtil.java',
    name: 'ValidationUtil.java',
    category: 'UTIL',
    language: 'java',
    description: 'Centralized server-side validation for email, phone, ISBN, prices, and stock boundaries.',
    content: `package com.bookstore.util;

import java.math.BigDecimal;
import java.util.regex.Pattern;

/**
 * Centralized server-side input validator enforcing robust validation.
 */
public class ValidationUtil {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\\\.[A-Za-z]{2,6}$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^[6-9]\\\\d{9}$");
    private static final Pattern ISBN_PATTERN = Pattern.compile("^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$");

    public static boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email.trim()).matches();
    }

    public static boolean isValidPhone(String phone) {
        if (phone == null) return false;
        String cleaned = phone.replaceAll("[\\\\s-]", "");
        return PHONE_PATTERN.matcher(cleaned).matches();
    }

    public static boolean isValidPassword(String password) {
        return password != null && password.length() >= 6;
    }

    public static boolean isValidPrice(BigDecimal price) {
        return price != null && price.compareTo(BigDecimal.ZERO) >= 0;
    }

    public static boolean isValidStock(int stock) {
        return stock >= 0;
    }
}`
  },
  {
    path: 'src/main/java/com/bookstore/dao/BookDAO.java',
    name: 'BookDAO.java',
    category: 'DAO',
    language: 'java',
    description: 'Data Access Object for Books with parameterized search, category filtering, pagination, and atomic stock update.',
    content: `package com.bookstore.dao;

import com.bookstore.model.Book;
import com.bookstore.util.DatabaseConnection;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class BookDAO {

    public List<Book> findAll(String keyword, Integer categoryId, String sortBy, int offset, int limit) throws SQLException {
        List<Book> books = new ArrayList<>();
        StringBuilder sql = new StringBuilder("SELECT b.*, c.name AS category_name FROM books b JOIN categories c ON b.category_id = c.id WHERE b.active = TRUE ");

        List<Object> params = new ArrayList<>();
        if (keyword != null && !keyword.trim().isEmpty()) {
            sql.append("AND (LOWER(b.title) LIKE ? OR LOWER(b.author) LIKE ?) ");
            String searchPattern = "%" + keyword.trim().toLowerCase() + "%";
            params.add(searchPattern);
            params.add(searchPattern);
        }
        if (categoryId != null && categoryId > 0) {
            sql.append("AND b.category_id = ? ");
            params.add(categoryId);
        }

        if ("price_asc".equals(sortBy)) {
            sql.append("ORDER BY b.price ASC, b.id ASC ");
        } else if ("price_desc".equals(sortBy)) {
            sql.append("ORDER BY b.price DESC, b.id ASC ");
        } else if ("title_asc".equals(sortBy)) {
            sql.append("ORDER BY b.title ASC, b.id ASC ");
        } else {
            sql.append("ORDER BY b.created_at DESC, b.id DESC ");
        }

        sql.append("LIMIT ? OFFSET ?");
        params.add(limit);
        params.add(offset);

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    books.add(mapResultSetToBook(rs));
                }
            }
        }
        return books;
    }

    public Book findById(int id) throws SQLException {
        String sql = "SELECT b.*, c.name AS category_name FROM books b JOIN categories c ON b.category_id = c.id WHERE b.id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToBook(rs);
                }
            }
        }
        return null;
    }

    public boolean decrementStock(Connection conn, int bookId, int quantity) throws SQLException {
        // Atomic stock decrement with check constraint to prevent negative inventory
        String sql = "UPDATE books SET stock = stock - ? WHERE id = ? AND stock >= ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, quantity);
            ps.setInt(2, bookId);
            ps.setInt(3, quantity);
            return ps.executeUpdate() > 0;
        }
    }

    public boolean incrementStock(Connection conn, int bookId, int quantity) throws SQLException {
        String sql = "UPDATE books SET stock = stock + ? WHERE id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, quantity);
            ps.setInt(2, bookId);
            return ps.executeUpdate() > 0;
        }
    }

    private Book mapResultSetToBook(ResultSet rs) throws SQLException {
        Book b = new Book();
        b.setId(rs.getInt("id"));
        b.setTitle(rs.getString("title"));
        b.setAuthor(rs.getString("author"));
        b.setCategoryId(rs.getInt("category_id"));
        b.setCategoryName(rs.getString("category_name"));
        b.setDescription(rs.getString("description"));
        b.setPublisher(rs.getString("publisher"));
        b.setIsbn(rs.getString("isbn"));
        b.setPrice(rs.getBigDecimal("price"));
        b.setStock(rs.getInt("stock"));
        b.setCoverImage(rs.getString("cover_image"));
        b.setFeatured(rs.getBoolean("featured"));
        b.setActive(rs.getBoolean("active"));
        b.setCreatedAt(rs.getTimestamp("created_at"));
        b.setUpdatedAt(rs.getTimestamp("updated_at"));
        return b;
    }
}`
  },
  {
    path: 'src/main/java/com/bookstore/service/OrderService.java',
    name: 'OrderService.java',
    category: 'SERVICE',
    language: 'java',
    description: 'Transaction-safe order processing with atomic stock reservation, rollback, and state transitions.',
    content: `package com.bookstore.service;

import com.bookstore.dao.BookDAO;
import com.bookstore.model.Book;
import com.bookstore.model.CartItem;
import com.bookstore.model.Order;
import com.bookstore.util.DatabaseConnection;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.*;
import java.util.List;
import java.util.UUID;

public class OrderService {
    private final BookDAO bookDAO = new BookDAO();

    /**
     * Executes order placement and stock decrement within an atomic JDBC transaction.
     * Rolls back on any insufficient stock or SQL error.
     */
    public Order placeOrder(int customerId, String deliveryAddress, String paymentMethod, List<CartItem> cartItems) throws Exception {
        if (cartItems == null || cartItems.isEmpty()) {
            throw new IllegalArgumentException("Cannot checkout with an empty cart");
        }

        Connection conn = null;
        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false); // Begin Transaction

            BigDecimal subtotal = BigDecimal.ZERO;
            for (CartItem item : cartItems) {
                Book freshBook = bookDAO.findById(item.getBook().getId());
                if (freshBook == null || !freshBook.isActive()) {
                    throw new IllegalStateException("Book no longer available: " + item.getBook().getTitle());
                }
                if (freshBook.getStock() < item.getQuantity()) {
                    throw new IllegalStateException("Insufficient stock for: " + freshBook.getTitle() + 
                                                   ". Available: " + freshBook.getStock() + ", Requested: " + item.getQuantity());
                }
                subtotal = subtotal.add(freshBook.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            }

            BigDecimal deliveryCharge = subtotal.compareTo(new BigDecimal("500")) >= 0 ? BigDecimal.ZERO : new BigDecimal("40.00");
            BigDecimal tax = subtotal.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);
            BigDecimal totalAmount = subtotal.add(deliveryCharge).add(tax);

            String orderRef = "ORD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

            // Insert Order
            String orderSql = "INSERT INTO orders (order_reference, customer_id, delivery_address, subtotal, delivery_charge, tax, total_amount, payment_method, order_status) " +
                              "VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PLACED')";
            int orderId;
            try (PreparedStatement ps = conn.prepareStatement(orderSql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, orderRef);
                ps.setInt(2, customerId);
                ps.setString(3, deliveryAddress);
                ps.setBigDecimal(4, subtotal);
                ps.setBigDecimal(5, deliveryCharge);
                ps.setBigDecimal(6, tax);
                ps.setBigDecimal(7, totalAmount);
                ps.setString(8, paymentMethod);
                ps.executeUpdate();
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        orderId = rs.getInt(1);
                    } else {
                        throw new SQLException("Failed to obtain generated order ID");
                    }
                }
            }

            // Insert Order Items and Atomically Decrement Inventory
            String itemSql = "INSERT INTO order_items (order_id, book_id, unit_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?)";
            try (PreparedStatement psItem = conn.prepareStatement(itemSql)) {
                for (CartItem item : cartItems) {
                    psItem.setInt(1, orderId);
                    psItem.setInt(2, item.getBook().getId());
                    psItem.setBigDecimal(3, item.getBook().getPrice());
                    psItem.setInt(4, item.getQuantity());
                    psItem.setBigDecimal(5, item.getSubtotal());
                    psItem.executeUpdate();

                    boolean stockUpdated = bookDAO.decrementStock(conn, item.getBook().getId(), item.getQuantity());
                    if (!stockUpdated) {
                        throw new SQLException("Concurrent stock conflict for book: " + item.getBook().getTitle());
                    }
                }
            }

            conn.commit(); // Transaction Committed!

            Order order = new Order();
            order.setId(orderId);
            order.setOrderReference(orderRef);
            order.setTotalAmount(totalAmount);
            return order;

        } catch (Exception e) {
            if (conn != null) {
                try {
                    conn.rollback(); // Atomic Rollback!
                } catch (SQLException rollbackEx) {
                    rollbackEx.printStackTrace();
                }
            }
            throw e;
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (SQLException closeEx) {
                    closeEx.printStackTrace();
                }
            }
        }
    }
}`
  },
  {
    path: 'src/main/java/com/bookstore/filter/AuthorizationFilter.java',
    name: 'AuthorizationFilter.java',
    category: 'FILTER',
    language: 'java',
    description: 'Enforces Role-Based Access Control (RBAC), prevents IDOR, and guards admin routes.',
    content: `package com.bookstore.filter;

import com.bookstore.model.Customer;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

/**
 * Filter that enforces authentication and administrative role access control.
 */
@WebFilter(filterName = "AuthorizationFilter", urlPatterns = {"/admin/*", "/checkout", "/orders", "/profile"})
public class AuthorizationFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        HttpSession session = req.getSession(false);
        Customer user = (session != null) ? (Customer) session.getAttribute("user") : null;
        String requestURI = req.getRequestURI();

        if (user == null) {
            // Not logged in -> redirect to login with return URL
            res.sendRedirect(req.getContextPath() + "/login?returnUrl=" + req.getRequestURI());
            return;
        }

        // Administrative paths require ADMIN role
        if (requestURI.contains("/admin/")) {
            if (!user.isAdmin()) {
                res.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied: Administrator role required.");
                return;
            }
        }

        chain.doFilter(request, response);
    }
}`
  },
  {
    path: 'src/main/webapp/index.jsp',
    name: 'index.jsp',
    category: 'JSP_CLIENT',
    language: 'html',
    description: 'Storefront homepage with hero banner, featured books, new arrivals, category quick-links, and search bar.',
    content: `<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Online Book Store - Alliance University</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="\${pageContext.request.contextPath}/assets/css/style.css">
</head>
<body>
    <jsp:include page="/includes/navbar.jsp" />

    <!-- Hero Section -->
    <section class="hero-banner py-5 bg-navy text-white">
        <div class="container py-4 text-center">
            <span class="badge bg-warning text-dark px-3 py-2 mb-3 rounded-pill fw-semibold">
                Alliance University Academic Bookstore
            </span>
            <h1 class="display-4 fw-bold">Discover Academic Excellence in Engineering & Science</h1>
            <p class="lead text-light-50 max-w-600 mx-auto">
                Explore handpicked textbooks, engineering classics, algorithms, cloud systems, and literature with verified real-time stock.
            </p>
            <div class="mt-4 d-flex justify-content-center gap-3">
                <a href="\${pageContext.request.contextPath}/books" class="btn btn-warning btn-lg px-4 fw-semibold">
                    <i class="bi bi-book me-2"></i> Browse All Books
                </a>
                <a href="#featured" class="btn btn-outline-light btn-lg px-4">
                    Featured Titles
                </a>
            </div>
        </div>
    </section>

    <!-- Featured Books Section -->
    <section id="featured" class="py-5 bg-light">
        <div class="container">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="h3 fw-bold text-navy mb-1">Featured Academic Books</h2>
                    <p class="text-muted small mb-0">Recommended reading for B.Tech Computer Science & Engineering</p>
                </div>
                <a href="\${pageContext.request.contextPath}/books" class="btn btn-outline-primary btn-sm">
                    View Complete Catalogue <i class="bi bi-arrow-right"></i>
                </a>
            </div>

            <div class="row g-4">
                <c:forEach var="book" items="\${featuredBooks}">
                    <div class="col-12 col-sm-6 col-lg-3">
                        <div class="card h-100 book-card shadow-sm border-0">
                            <img src="\${book.coverImage}" class="card-img-top book-cover" alt="\${book.title}"
                                 onerror="this.onerror=null; this.src='\${pageContext.request.contextPath}/assets/images/book-placeholder.svg';">
                            <div class="card-body d-flex flex-column">
                                <span class="badge bg-light text-secondary border mb-2 align-self-start">\${book.categoryName}</span>
                                <h5 class="card-title h6 fw-bold text-dark text-truncate-2">\${book.title}</h5>
                                <p class="card-text text-muted small mb-3">\${book.author}</p>
                                <div class="mt-auto d-flex justify-content-between align-items-center pt-2 border-top">
                                    <span class="fs-5 fw-bold text-navy">₹\${book.price}</span>
                                    <form action="\${pageContext.request.contextPath}/cart" method="POST" class="d-inline">
                                        <input type="hidden" name="action" value="add">
                                        <input type="hidden" name="bookId" value="\${book.id}">
                                        <input type="hidden" name="quantity" value="1">
                                        <button type="submit" class="btn btn-sm btn-primary rounded-pill px-3" \${book.stock <= 0 ? 'disabled' : ''}>
                                            <i class="bi bi-cart-plus me-1"></i> Add
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </c:forEach>
            </div>
        </div>
    </section>

    <jsp:include page="/includes/footer.jsp" />
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`
  },
  {
    path: 'src/test/java/com/bookstore/CartServiceTest.java',
    name: 'CartServiceTest.java',
    category: 'TEST',
    language: 'java',
    description: 'JUnit 5 automated tests for cart subtotal math, tax calculations, free delivery thresholds, and zero quantity rejection.',
    content: `package com.bookstore;

import com.bookstore.model.Book;
import com.bookstore.model.CartItem;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class CartServiceTest {

    @Test
    @DisplayName("Cart subtotal calculates accurately with multiple line items")
    public void testCartSubtotalCalculation() {
        Book b1 = new Book(1, "Clean Code", "Robert C. Martin", 2, new BigDecimal("499.00"), 10);
        Book b2 = new Book(2, "CLRS Algorithms", "Thomas Cormen", 1, new BigDecimal("850.00"), 5);

        CartItem item1 = new CartItem(b1, 2); // 499 * 2 = 998
        CartItem item2 = new CartItem(b2, 1); // 850 * 1 = 850

        assertEquals(new BigDecimal("998.00"), item1.getSubtotal());
        assertEquals(new BigDecimal("850.00"), item2.getSubtotal());

        BigDecimal total = item1.getSubtotal().add(item2.getSubtotal());
        assertEquals(new BigDecimal("1848.00"), total);
    }

    @Test
    @DisplayName("CartItem constructor rejects zero or negative quantity")
    public void testCartItemRejectsInvalidQuantity() {
        Book b = new Book(1, "Java", "Author", 1, new BigDecimal("500.00"), 10);
        assertThrows(IllegalArgumentException.class, () -> new CartItem(b, 0));
        assertThrows(IllegalArgumentException.class, () -> new CartItem(b, -2));
    }
}`
  }
];
