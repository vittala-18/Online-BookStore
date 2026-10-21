import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartSummary,
  isValidStatusTransition,
  shouldRestoreStockOnCancellation,
  validateCustomerRegistration,
  validateInventoryAvailability,
  checkOrderAccessAuthorization,
  CartItemModel
} from '../services/bookstoreLogic';

test('calculateCartSummary: correctly calculates subtotal, delivery fee, and tax', () => {
  const items: CartItemModel[] = [
    { bookId: 1, title: 'Clean Code', price: 450, quantity: 1, stock: 10 },
    { bookId: 2, title: 'Introduction to Algorithms', price: 200, quantity: 1, stock: 5 }
  ];

  const result = calculateCartSummary(items, 500, 40, 0.05);
  // Subtotal = 650 >= 500 => free delivery
  assert.equal(result.subtotal, 650);
  assert.equal(result.deliveryCharge, 0);
  assert.equal(result.tax, 32.5);
  assert.equal(result.total, 682.5);
  assert.equal(result.itemCount, 2);
});

test('calculateCartSummary: applies standard delivery fee when subtotal is below threshold', () => {
  const items: CartItemModel[] = [
    { bookId: 1, title: 'Head First Java', price: 350, quantity: 1, stock: 8 }
  ];

  const result = calculateCartSummary(items, 500, 40, 0.05);
  // Subtotal = 350 < 500 => delivery charge = 40
  assert.equal(result.subtotal, 350);
  assert.equal(result.deliveryCharge, 40);
  assert.equal(result.tax, 17.5);
  assert.equal(result.total, 407.5);
});

test('calculateCartSummary: rejects zero or negative quantity', () => {
  const invalidItems: CartItemModel[] = [
    { bookId: 1, title: 'Broken Item', price: 100, quantity: 0, stock: 5 }
  ];

  assert.throws(() => {
    calculateCartSummary(invalidItems);
  }, /Invalid item quantity/);
});

test('order status state machine: verifies valid and invalid status transitions', () => {
  // Allowed transitions
  assert.equal(isValidStatusTransition('PLACED', 'CONFIRMED'), true);
  assert.equal(isValidStatusTransition('CONFIRMED', 'SHIPPED'), true);
  assert.equal(isValidStatusTransition('SHIPPED', 'DELIVERED'), true);
  assert.equal(isValidStatusTransition('PLACED', 'CANCELLED'), true);

  // Disallowed transitions (e.g. going back from DELIVERED to SHIPPED or from CANCELLED to CONFIRMED)
  assert.equal(isValidStatusTransition('DELIVERED', 'SHIPPED'), false);
  assert.equal(isValidStatusTransition('CANCELLED', 'CONFIRMED'), false);
  assert.equal(isValidStatusTransition('DELIVERED', 'PLACED'), false);
});

test('stock restoration rule: only restores stock when moving from active state to CANCELLED', () => {
  assert.equal(shouldRestoreStockOnCancellation('PLACED', 'CANCELLED'), true);
  assert.equal(shouldRestoreStockOnCancellation('CONFIRMED', 'CANCELLED'), true);
  // Already cancelled cannot restore stock a second time
  assert.equal(shouldRestoreStockOnCancellation('CANCELLED', 'CANCELLED'), false);
  // Delivered orders cannot restore stock automatically
  assert.equal(shouldRestoreStockOnCancellation('DELIVERED', 'CANCELLED'), false);
});

test('validateCustomerRegistration: prevents empty fields and malicious admin role escalation', () => {
  const maliciousInput = {
    fullName: 'Hacker User',
    email: 'hacker@example.com',
    phone: '9876543210',
    password: 'password123',
    confirmPassword: 'password123',
    role: 'ADMIN' // attempting privilege escalation
  };

  const validation = validateCustomerRegistration(maliciousInput);
  assert.equal(validation.isValid, false);
  assert.ok(validation.errors.role);
});

test('validateCustomerRegistration: accepts valid customer submission', () => {
  const validCustomer = {
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '9845123456',
    password: 'securePassword1',
    confirmPassword: 'securePassword1'
  };

  const validation = validateCustomerRegistration(validCustomer);
  assert.equal(validation.isValid, true);
  assert.equal(Object.keys(validation.errors).length, 0);
});

test('validateInventoryAvailability: detects out-of-stock items', () => {
  const cartItems = [
    { bookId: 101, title: 'Operating System Concepts', quantity: 4 },
    { bookId: 102, title: 'Database System Concepts', quantity: 2 }
  ];

  const stockMap = {
    101: 2, // only 2 available, requested 4!
    102: 10 // 10 available, requested 2
  };

  const check = validateInventoryAvailability(cartItems, stockMap);
  assert.equal(check.hasSufficientStock, false);
  assert.equal(check.insufficientItems.length, 1);
  assert.equal(check.insufficientItems[0].title, 'Operating System Concepts');
  assert.equal(check.insufficientItems[0].available, 2);
});

test('checkOrderAccessAuthorization: prevents IDOR access between customers while allowing admins', () => {
  const customerA = { id: 10, role: 'CUSTOMER' as const };
  const customerB = { id: 20, role: 'CUSTOMER' as const };
  const admin = { id: 1, role: 'ADMIN' as const };

  // Customer A accesses their own order (order created by customer 10)
  assert.equal(checkOrderAccessAuthorization(customerA, 10).isAuthorized, true);

  // Customer B tries to access customer A's order (order created by customer 10) -> FORBIDDEN!
  const idorCheck = checkOrderAccessAuthorization(customerB, 10);
  assert.equal(idorCheck.isAuthorized, false);
  assert.match(idorCheck.reason || '', /permission|IDOR/);

  // Admin accesses customer A's order -> ALLOWED
  assert.equal(checkOrderAccessAuthorization(admin, 10).isAuthorized, true);
});
