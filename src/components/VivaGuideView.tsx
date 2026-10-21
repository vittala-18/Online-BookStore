import React, { useState } from 'react';
import { 
  GraduationCap, 
  HelpCircle, 
  Server, 
  Database, 
  Layers, 
  Terminal, 
  CheckCircle, 
  BookOpen, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

export const VivaGuideView: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const vivaQuestions = [
    {
      q: '1. What is the architecture of this Online Book Store Management System?',
      a: 'The application strictly follows a classical 3-tier Layered MVC (Model-View-Controller) architecture. The View tier is composed of dynamic JSP pages and Bootstrap 5; the Controller tier consists of Jakarta Servlets (e.g., BookServlet, CartServlet, CheckoutServlet) mapping HTTP requests; the Service tier (e.g., OrderService, CartService) encapsulates business rules and transaction orchestration; the Data Access Object (DAO) tier handles database interactions using JDBC PreparedStatements; and the Model tier represents domain entities (Book, Customer, Order, OrderItem).'
    },
    {
      q: '2. Why did you use PreparedStatement instead of Statement in JDBC?',
      a: 'PreparedStatement compiles SQL queries on the database engine once and binds user parameters separately via placeholders (?). This prevents SQL Injection (CWE-89) because input is never directly concatenated into the SQL statement syntax. Furthermore, PreparedStatement provides performance optimizations through query execution plan caching.'
    },
    {
      q: '3. How are database transactions managed during checkout?',
      a: 'Order placement and stock decrements are encapsulated in an atomic JDBC transaction. We call conn.setAutoCommit(false) on the connection. The order is inserted, line items are created, and inventory quantities are checked and decremented atomically with UPDATE books SET stock = stock - ? WHERE id = ? AND stock >= ?. If any line item has insufficient stock or a database error occurs, conn.rollback() is invoked in the catch block, ensuring that no partial or orphan orders are persisted (satisfying ACID Atomicity).'
    },
    {
      q: '4. How is user authentication and session security implemented?',
      a: 'We use HTTPServletSession. Upon successful login, the session identifier is regenerated to mitigate session fixation attacks. Passwords are never stored in plaintext; instead, they are hashed using SHA-256 with a unique cryptographically generated 16-byte salt (stored in PasswordUtil). A session-timeout of 30 minutes and httpOnly cookie attributes are enforced in web.xml.'
    },
    {
      q: '5. How does the application prevent Insecure Direct Object References (IDOR)?',
      a: 'In OrderServlet and OrderDAO, whenever an order detail is requested via ?orderId=X, the servlet extracts the authenticated customer ID from session.getAttribute("user"). Unless the user holds an ADMIN role, the servlet verifies if (order.getCustomerId() == currentUser.getId()). If the customer attempts to access another user\'s invoice, an HTTP 403 Forbidden is immediately returned.'
    },
    {
      q: '6. What is the Post/Redirect/Get (PRG) pattern and where is it used?',
      a: 'The PRG pattern prevents duplicate form submissions caused by browser refreshes. When a user submits an order via POST, the servlet processes the database transaction, places a confirmation flag or order reference in the flash session, and responds with response.sendRedirect(contextPath + "/orderConfirmation"). If the user refreshes the page, only an idempotent GET request is re-executed.'
    },
    {
      q: '7. What is the difference between Tomcat 9 and Tomcat 10.1 in this project?',
      a: 'Apache Tomcat 10.1 implements Jakarta EE 10 (Servlet 6.0, JSP 3.1). The key architectural shift is that all servlet and filter imports migrate from the legacy javax.* namespace (e.g. javax.servlet.http.HttpServlet) to the jakarta.* namespace (jakarta.servlet.http.HttpServlet). Using javax.* dependencies on Tomcat 10 causes ClassNotFoundException.'
    },
    {
      q: '8. How is the shopping cart total validated against tampering?',
      a: 'All cart subtotals, GST/tax (5%), delivery fees (free over ₹500, else ₹40), and final grand totals are calculated authoritatively on the server inside CartService. The server completely ignores any total amount passed in the HTTP request payload and re-queries current unit prices directly from MySQL.'
    },
    {
      q: '9. What design patterns are implemented in this application?',
      a: '1. DAO Pattern (Data Access Object): abstracts and encapsulates all database access behind clean interfaces (BookDAO, OrderDAO).\n2. MVC Pattern: clear separation between model, presentation JSP, and controller Servlets.\n3. Singleton Pattern: DatabaseConnection singleton managing JDBC connections.\n4. Front Filter / Intercepting Filter: EncodingFilter and AuthorizationFilter intercepting and validating requests before controllers.\n5. State Machine: Order status transitions adhering to defined business lifecycle rules.'
    },
    {
      q: '10. What happens when an administrator cancels an order?',
      a: 'The system validates that the order is not already cancelled or delivered. It executes an atomic database transaction that updates orders.order_status = \'CANCELLED\' and calls bookDAO.incrementStock() for each book item associated with the order. An audit record is created in inventory_movements.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-400 text-slate-950 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
              Academic Review Defense
            </span>
            <span className="text-xs text-slate-400 font-mono">Alliance University &bull; B.Tech CSE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Viva Voce &amp; Technical Defense Guide
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            In-depth conceptual explanations, architectural diagrams, JDBC transaction mechanics, and the top 10 examination questions with model answers.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Architecture & Stack Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 bg-blue-50 text-blue-900 rounded-xl flex items-center justify-center mb-2">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">3-Tier MVC Architecture</h3>
            <p className="text-slate-600 leading-relaxed">
              JSP (View) &rarr; Servlets (Controller) &rarr; Services (Business Rules) &rarr; DAOs (Data Access) &rarr; MySQL 8 (Database).
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-900 rounded-xl flex items-center justify-center mb-2">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">ACID Transaction Boundaries</h3>
            <p className="text-slate-600 leading-relaxed">
              Order creation and inventory adjustment utilize JDBC <code className="text-blue-900 font-mono">setAutoCommit(false)</code> and <code className="text-blue-900 font-mono">rollback()</code> on failure.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 bg-amber-50 text-amber-900 rounded-xl flex items-center justify-center mb-2">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Jakarta EE 10 / Tomcat 10.1</h3>
            <p className="text-slate-600 leading-relaxed">
              Compliant with the modern <code className="text-blue-900 font-mono">jakarta.*</code> namespace, Java 17 LTS, MySQL Connector/J 8.0, and JUnit 5 test harness.
            </p>
          </div>
        </div>

        {/* Local Deployment Guide */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-900" />
            Local Execution in IntelliJ IDEA / Apache Tomcat 10.1
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Step-by-step instructions for running the audited Java WAR package on Windows/macOS/Linux.
          </p>

          <div className="space-y-3 text-xs font-mono bg-slate-950 text-slate-200 p-4 rounded-xl overflow-x-auto">
            <div className="text-slate-400"># 1. Clone or extract the project zip:</div>
            <div className="text-emerald-400">cd online-book-store</div>
            <div className="text-slate-400 pt-2"># 2. Setup MySQL Database:</div>
            <div className="text-amber-300">mysql -u root -p &lt; database/schema.sql</div>
            <div className="text-amber-300">mysql -u root -p &lt; database/sample-data.sql</div>
            <div className="text-slate-400 pt-2"># 3. Compile and Package with Maven:</div>
            <div className="text-emerald-400">mvn clean package</div>
            <div className="text-slate-400 pt-2"># 4. Deploy generated WAR to Tomcat 10.1 webapps/ folder:</div>
            <div className="text-blue-300">cp target/online-book-store.war $TOMCAT_HOME/webapps/</div>
            <div className="text-slate-400 pt-2"># 5. Start Apache Tomcat:</div>
            <div className="text-emerald-400">$TOMCAT_HOME/bin/startup.sh (or startup.bat on Windows)</div>
            <div className="text-slate-400 pt-2"># 6. Open in Browser:</div>
            <div className="text-amber-300">http://localhost:8080/online-book-store/</div>
          </div>
        </div>

        {/* Top 10 Viva Questions Accordion */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-500" />
              Frequently Asked Viva Voce Questions &amp; Model Answers
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Prepared for university external examiners and faculty technical review.
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {vivaQuestions.map((vq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="py-3.5">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full text-left font-bold text-slate-900 flex items-center justify-between gap-3 hover:text-blue-900"
                  >
                    <span>{vq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="mt-2.5 pl-3 border-l-2 border-amber-400 text-slate-600 leading-relaxed animate-fadeIn whitespace-pre-line">
                      {vq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
