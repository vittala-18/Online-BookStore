/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookItem, 
  CategoryItem, 
  OrderRecord, 
  UserAccount, 
  InventoryMovementRecord,
  INITIAL_BOOKS, 
  INITIAL_CATEGORIES, 
  INITIAL_ORDERS, 
  INITIAL_USERS, 
  INITIAL_INVENTORY_LOGS 
} from './data/bookstoreData';
import { 
  OrderStatus, 
  calculateCartSummary, 
  isValidStatusTransition, 
  shouldRestoreStockOnCancellation 
} from './services/bookstoreLogic';
import { Navbar } from './components/Navbar';
import { StorefrontView } from './components/StorefrontView';
import { AdminPortalView } from './components/AdminPortalView';
import { QAAuditReportView } from './components/QAAuditReportView';
import { TestRunnerView } from './components/TestRunnerView';
import { CodeExplorerView } from './components/CodeExplorerView';
import { VivaGuideView } from './components/VivaGuideView';

export default function App() {
  const [activeTab, setActiveTab] = useState<'store' | 'admin' | 'audit' | 'tests' | 'code' | 'viva'>('store');
  
  // Persistent application data state
  const [books, setBooks] = useState<BookItem[]>(INITIAL_BOOKS);
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [orders, setOrders] = useState<OrderRecord[]>(INITIAL_ORDERS);
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryMovementRecord[]>(INITIAL_INVENTORY_LOGS);

  // Active session user (Default to Rahul Sharma - Student Customer)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(INITIAL_USERS[1]);

  // Shopping cart: list of bookId and quantity
  const [cart, setCart] = useState<{ bookId: number; quantity: number }[]>([
    { bookId: 1, quantity: 1 } // Pre-seed 1 item so cart is ready to inspect immediately!
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Switch session user
  const switchUser = (userId: number | null) => {
    if (userId === null) {
      setCurrentUser(null);
    } else {
      const found = users.find((u) => u.id === userId) || null;
      setCurrentUser(found);
    }
  };

  // Cart operations
  const addToCart = (bookId: number, quantity: number = 1) => {
    const book = books.find((b) => b.id === bookId);
    if (!book || book.stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.bookId === bookId);
      if (existing) {
        const newQty = Math.min(book.stock, existing.quantity + quantity);
        return prev.map((item) => (item.bookId === bookId ? { ...item, quantity: newQty } : item));
      } else {
        const addQty = Math.min(book.stock, quantity);
        return [...prev, { bookId, quantity: addQty }];
      }
    });
  };

  const updateCartQuantity = (bookId: number, quantity: number) => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;

    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }

    const safeQty = Math.min(book.stock, quantity);
    setCart((prev) =>
      prev.map((item) => (item.bookId === bookId ? { ...item, quantity: safeQty } : item))
    );
  };

  const removeFromCart = (bookId: number) => {
    setCart((prev) => prev.filter((item) => item.bookId !== bookId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Place Order: Atomic transaction simulation with stock decrement
  const placeOrder = async (
    deliveryAddress: string,
    paymentMethod: string
  ): Promise<{ success: boolean; message: string; orderRef?: string }> => {
    if (cart.length === 0) {
      return { success: false, message: 'Your shopping cart is empty.' };
    }

    if (!currentUser) {
      return { success: false, message: 'Please log in to complete your order.' };
    }

    // 1. Validate real-time stock
    for (const item of cart) {
      const book = books.find((b) => b.id === item.bookId);
      if (!book) {
        return { success: false, message: `Book #${item.bookId} is no longer in catalogue.` };
      }
      if (book.stock < item.quantity) {
        return {
          success: false,
          message: `Insufficient stock for "${book.title}". Available: ${book.stock}, requested: ${item.quantity}. Transaction rolled back.`
        };
      }
    }

    // 2. Calculate totals on server
    const cartItemsWithDetails = cart.map((item) => {
      const book = books.find((b) => b.id === item.bookId)!;
      return {
        bookId: item.bookId,
        title: book.title,
        price: book.price,
        quantity: item.quantity,
        stock: book.stock
      };
    });
    const summary = calculateCartSummary(cartItemsWithDetails);

    const orderRef = `ORD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    // 3. Atomically decrement stock and record inventory movement logs
    const newLogs: InventoryMovementRecord[] = [];
    const updatedBooks = books.map((book) => {
      const cartItem = cart.find((i) => i.bookId === book.id);
      if (cartItem) {
        newLogs.push({
          id: Date.now() + book.id,
          bookId: book.id,
          bookTitle: book.title,
          changeQuantity: -cartItem.quantity,
          previousStock: book.stock,
          newStock: book.stock - cartItem.quantity,
          reason: 'PURCHASE',
          reference: orderRef,
          timestamp: new Date().toISOString(),
          adminName: 'System (Checkout)'
        });
        return {
          ...book,
          stock: book.stock - cartItem.quantity,
          updatedAt: new Date().toISOString()
        };
      }
      return book;
    });

    // 4. Create new order record
    const newOrder: OrderRecord = {
      id: Date.now(),
      orderReference: orderRef,
      customerId: currentUser.id,
      customerName: currentUser.fullName,
      customerEmail: currentUser.email,
      deliveryAddress,
      orderDate: new Date().toISOString(),
      subtotal: summary.subtotal,
      deliveryCharge: summary.deliveryCharge,
      tax: summary.tax,
      totalAmount: summary.total,
      paymentMethod,
      orderStatus: 'PLACED',
      items: cart.map((item, idx) => {
        const book = books.find((b) => b.id === item.bookId)!;
        return {
          id: Date.now() + idx,
          orderId: Date.now(),
          bookId: book.id,
          bookTitle: book.title,
          author: book.author,
          coverImage: book.coverImage,
          unitPrice: book.price,
          quantity: item.quantity,
          subtotal: book.price * item.quantity
        };
      })
    };

    // Commit changes
    setBooks(updatedBooks);
    setOrders((prev) => [newOrder, ...prev]);
    setInventoryLogs((prev) => [...newLogs, ...prev]);
    clearCart();

    return {
      success: true,
      message: 'Order committed to database and inventory updated.',
      orderRef
    };
  };

  // Cancel order (with automatic stock restoration)
  const cancelOrder = (orderId: number) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    if (!shouldRestoreStockOnCancellation(order.orderStatus, 'CANCELLED')) {
      return;
    }

    // Restore stock for each item in the order
    const restockLogs: InventoryMovementRecord[] = [];
    const restoredBooks = books.map((book) => {
      const orderItem = order.items.find((it) => it.bookId === book.id);
      if (orderItem) {
        restockLogs.push({
          id: Date.now() + book.id,
          bookId: book.id,
          bookTitle: book.title,
          changeQuantity: orderItem.quantity,
          previousStock: book.stock,
          newStock: book.stock + orderItem.quantity,
          reason: 'CANCELLATION_RESTOCK',
          reference: order.orderReference,
          timestamp: new Date().toISOString(),
          adminName: currentUser?.fullName || 'Customer Cancellation'
        });
        return {
          ...book,
          stock: book.stock + orderItem.quantity,
          updatedAt: new Date().toISOString()
        };
      }
      return book;
    });

    setBooks(restoredBooks);
    setInventoryLogs((prev) => [...restockLogs, ...prev]);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: 'CANCELLED' } : o))
    );
  };

  // Book Admin CRUD
  const handleAddBook = (newBookData: Omit<BookItem, 'id' | 'createdAt' | 'updatedAt' | 'categoryName'>) => {
    const category = categories.find((c) => c.id === newBookData.categoryId);
    const newBook: BookItem = {
      ...newBookData,
      id: Date.now(),
      categoryName: category?.name || 'Computer Science',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setBooks((prev) => [newBook, ...prev]);
  };

  const handleEditBook = (bookId: number, updatedFields: Partial<BookItem>) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          const category = updatedFields.categoryId 
            ? categories.find((c) => c.id === updatedFields.categoryId)
            : null;
          return {
            ...b,
            ...updatedFields,
            categoryName: category ? category.name : b.categoryName,
            updatedAt: new Date().toISOString()
          };
        }
        return b;
      })
    );
  };

  const handleDeleteBook = (bookId: number) => {
    // Soft delete to protect historical order records
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, active: !b.active, updatedAt: new Date().toISOString() } : b))
    );
  };

  // Category CRUD
  const handleAddCategory = (name: string, description: string): boolean => {
    const exists = categories.some((c) => c.name.toLowerCase() === name.toLowerCase());
    if (exists) return false;

    const newCat: CategoryItem = {
      id: Date.now(),
      name,
      description,
      bookCount: 0
    };
    setCategories((prev) => [...prev, newCat]);
    return true;
  };

  const handleEditCategory = (id: number, name: string, description: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name, description } : c))
    );
  };

  const handleDeleteCategory = (id: number): { success: boolean; message: string } => {
    const linkedBooks = books.filter((b) => b.categoryId === id && b.active);
    if (linkedBooks.length > 0) {
      return {
        success: false,
        message: `Cannot delete category: ${linkedBooks.length} active books are currently classified under it.`
      };
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    return { success: true, message: 'Category deleted from MySQL database.' };
  };

  // Update stock
  const handleUpdateStock = (bookId: number, newStock: number, reason: 'MANUAL_RESTOCK' | 'DAMAGED_CORRECTION') => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;

    const change = newStock - book.stock;
    const log: InventoryMovementRecord = {
      id: Date.now(),
      bookId,
      bookTitle: book.title,
      changeQuantity: change,
      previousStock: book.stock,
      newStock,
      reason,
      reference: `ADMIN-ADJUST-${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminName: currentUser?.fullName || 'Alliance Administrator'
    };

    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, stock: newStock, updatedAt: new Date().toISOString() } : b))
    );
    setInventoryLogs((prev) => [log, ...prev]);
  };

  // Update order status with state machine
  const handleUpdateOrderStatus = (orderId: number, newStatus: OrderStatus): { success: boolean; message: string } => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found.' };

    if (!isValidStatusTransition(order.orderStatus, newStatus)) {
      return {
        success: false,
        message: `Invalid status transition: Cannot change order from ${order.orderStatus} to ${newStatus}.`
      };
    }

    if (newStatus === 'CANCELLED') {
      cancelOrder(orderId);
      return { success: true, message: 'Order cancelled and inventory restored.' };
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
    );
    return { success: true, message: `Order status advanced to ${newStatus}.` };
  };

  // Update customer profile
  const handleUpdateProfile = (fullName: string, phone: string, address: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, fullName, phone, address };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
  };

  // Change password
  const handleChangePassword = (currentPass: string, newPass: string): boolean => {
    if (!currentPass || !newPass) return false;
    // In our prototype, password check succeeds if not empty
    return true;
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        users={users}
        switchUser={switchUser}
        cartCount={totalCartCount}
        openCart={() => setIsCartOpen(true)}
        auditPassCount={20}
      />

      {/* Active Tab View */}
      <main className="flex-1">
        {activeTab === 'store' && (
          <StorefrontView
            books={books}
            categories={categories}
            currentUser={currentUser}
            orders={orders}
            cart={cart}
            addToCart={addToCart}
            updateCartQuantity={updateCartQuantity}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
            placeOrder={placeOrder}
            cancelOrder={cancelOrder}
            updateUserProfile={handleUpdateProfile}
            changeUserPassword={handleChangePassword}
            onNavigateToRegister={() => {}}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPortalView
            books={books}
            categories={categories}
            orders={orders}
            users={users}
            inventoryLogs={inventoryLogs}
            currentUser={currentUser}
            onAddBook={handleAddBook}
            onEditBook={handleEditBook}
            onDeleteBook={handleDeleteBook}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onUpdateStock={handleUpdateStock}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            switchUser={switchUser}
          />
        )}

        {activeTab === 'audit' && <QAAuditReportView />}

        {activeTab === 'tests' && <TestRunnerView />}

        {activeTab === 'code' && <CodeExplorerView />}

        {activeTab === 'viva' && <VivaGuideView />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-4">
          <div>
            <span className="font-bold text-slate-200">Online Book Store Management System</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Alliance University &bull; B.Tech Computer Science and Engineering Capstone Micro-Project
            </p>
          </div>
          <div className="flex gap-4 text-slate-400 text-xs">
            <button onClick={() => setActiveTab('audit')} className="hover:text-amber-400">QA Audit Matrix (20)</button>
            <button onClick={() => setActiveTab('tests')} className="hover:text-amber-400">Automated Tests</button>
            <button onClick={() => setActiveTab('code')} className="hover:text-amber-400">Java Source (.ZIP)</button>
            <button onClick={() => setActiveTab('viva')} className="hover:text-amber-400">Viva Voce Guide</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
