-- =====================================================================
-- SAMPLE DATA FOR ONLINE BOOK STORE MANAGEMENT SYSTEM
-- =====================================================================

USE bookstore_db;

-- 1. INSERT CATEGORIES
INSERT INTO categories (id, name, description) VALUES
(1, 'Computer Science', 'Core CS, algorithms, data structures, OS, databases, and networks.'),
(2, 'Software Engineering', 'Clean architecture, design patterns, testing, and modern practices.'),
(3, 'Web & Cloud Development', 'Full-stack web, cloud architecture, APIs, and microservices.'),
(4, 'Mathematics & Data Science', 'Discrete mathematics, linear algebra, statistics, and machine learning.'),
(5, 'Cybersecurity', 'Network security, cryptography, and secure software development.');

-- 2. INSERT USERS
-- Passwords hashed using SHA-256 with Salt.
-- Default test password for admin: 'Admin@123'
-- Default test password for customer: 'Student@123'
INSERT INTO users (id, full_name, email, phone, password_hash, salt, delivery_address, role, status) VALUES
(1, 'Alliance Bookstore Administrator', 'admin@alliance.edu', '9845001122', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'c1b48b94ef11', 'Alliance University Campus, Chandapura - Anekal Main Road, Bengaluru 562106', 'ADMIN', 'ACTIVE'),
(2, 'Rahul Sharma (Student)', 'rahul.sharma@student.alliance.edu', '9876543210', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'd2c79a12fe33', 'Room 304, Boys Hostel Block B, Alliance University Campus, Bengaluru 562106', 'CUSTOMER', 'ACTIVE'),
(3, 'Pooja Iyer (Customer)', 'pooja.iyer@gmail.com', '9123456789', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'd2c79a12fe33', 'Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103', 'CUSTOMER', 'ACTIVE');

-- 3. INSERT BOOKS
INSERT INTO books (id, title, author, category_id, description, publisher, isbn, price, stock, cover_image, featured, active) VALUES
(1, 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', 2, 'Even bad code can function. But if code is not clean, it can bring a development organization to its knees.', 'Prentice Hall', '978-0132350884', 499.00, 12, 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(2, 'Introduction to Algorithms (CLRS)', 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein', 1, 'The definitive textbook on modern algorithms covering graph theory, dynamic programming, and complexity.', 'MIT Press', '978-0262033848', 850.00, 6, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(3, 'Head First Java: A Brain-Friendly Guide (3rd Edition)', 'Kathy Sierra, Bert Bates, Trisha Gee', 1, 'A visual and deep dive into Java, object orientation, streams, and concurrency.', 'O\'Reilly Media', '978-1491910771', 550.00, 15, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(4, 'Database System Concepts (7th Edition)', 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan', 1, 'Comprehensive coverage of relational database management, SQL, and transaction processing.', 'McGraw-Hill Education', '978-0078022159', 680.00, 4, 'https://images.unsplash.com/photo-1507842229451-9f75066a8775?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(5, 'Operating System Concepts (10th Edition)', 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne', 1, 'Foundational text exploring OS kernels, memory virtualization, and synchronization.', 'Wiley', '978-1119800361', 720.00, 3, 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(6, 'Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', 2, 'The seminal guide to 23 classical design patterns in OOP.', 'Addison-Wesley Professional', '978-0201633610', 590.00, 8, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(7, 'Computer Networks: A Systems Approach', 'Larry L. Peterson, Bruce S. Davie', 1, 'Systems-oriented exploration of network protocols, routing, and transport.', 'Morgan Kaufmann', '978-0123850591', 640.00, 7, 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(8, 'Designing Data-Intensive Applications', 'Martin Kleppmann', 3, 'The definitive guide to distributed data architectures, replication, and consensus.', 'O\'Reilly Media', '978-1449373320', 890.00, 9, 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(9, 'Pragmatic Unit Testing in Java with JUnit', 'Jeff Langr, Andy Hunt, Dave Thomas', 2, 'Practical techniques for writing maintainable unit tests and applying TDD.', 'Pragmatic Bookshelf', '978-1937785581', 430.00, 11, 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(10, 'Cryptography and Network Security: Principles and Practice', 'William Stallings', 5, 'Rigorous exploration of symmetric and public-key cryptography and network protocols.', 'Pearson', '978-0134444284', 760.00, 5, 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80', FALSE, TRUE);

-- 4. INSERT ORDERS
INSERT INTO orders (id, order_reference, customer_id, delivery_address, subtotal, delivery_charge, tax, total_amount, payment_method, order_status, order_date) VALUES
(101, 'ORD-2026-00101', 2, 'Room 304, Boys Hostel Block B, Alliance University Campus, Bengaluru 562106', 1049.00, 0.00, 52.45, 1101.45, 'Cash on Delivery', 'DELIVERED', '2026-10-18 11:20:00'),
(102, 'ORD-2026-00102', 3, 'Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103', 850.00, 0.00, 42.50, 892.50, 'Simulated Card Payment', 'SHIPPED', '2026-10-19 14:40:00');

-- 5. INSERT ORDER ITEMS
INSERT INTO order_items (id, order_id, book_id, unit_price, quantity, subtotal) VALUES
(1, 101, 1, 499.00, 1, 499.00),
(2, 101, 3, 550.00, 1, 550.00),
(3, 102, 2, 850.00, 1, 850.00);

-- 6. INSERT INVENTORY MOVEMENTS
INSERT INTO inventory_movements (id, book_id, change_quantity, previous_stock, new_stock, reason, reference, admin_name) VALUES
(1, 1, -1, 13, 12, 'PURCHASE', 'ORD-2026-00101', 'System (Checkout)'),
(2, 3, -1, 16, 15, 'PURCHASE', 'ORD-2026-00101', 'System (Checkout)'),
(3, 2, -1, 7, 6, 'PURCHASE', 'ORD-2026-00102', 'System (Checkout)');
