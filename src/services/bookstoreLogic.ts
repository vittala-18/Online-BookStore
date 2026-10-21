/**
 * Pure business logic for the Online Book Store Management System.
 * Matches the Java Service layer specifications:
 * - CartService
 * - OrderService
 * - InventoryService
 * - ValidationUtil
 * - PasswordUtil
 */

export interface CartItemModel {
  bookId: number;
  title: string;
  price: number;
  quantity: number;
  stock: number;
}

export interface CalculationResult {
  subtotal: number;
  deliveryCharge: number;
  tax: number;
  total: number;
  itemCount: number;
}

export type OrderStatus = 'PLACED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

// Valid status transitions state machine
export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PLACED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [], // Terminal state - cannot be changed
  CANCELLED: []  // Terminal state - cannot be restored
};

/**
 * Calculates cart subtotal, delivery fee, tax and grand total on the server.
 * Never trust browser calculations.
 */
export function calculateCartSummary(
  items: CartItemModel[],
  deliveryThreshold = 500,
  standardDeliveryFee = 40,
  taxRate = 0.05
): CalculationResult {
  if (!items || items.length === 0) {
    return { subtotal: 0, deliveryCharge: 0, tax: 0, total: 0, itemCount: 0 };
  }

  let subtotal = 0;
  let itemCount = 0;

  for (const item of items) {
    if (item.quantity <= 0) {
      throw new Error(`Invalid item quantity: ${item.quantity} for book ${item.title}`);
    }
    subtotal += item.price * item.quantity;
    itemCount += item.quantity;
  }

  // Delivery is free above threshold (e.g. ₹500)
  const deliveryCharge = subtotal >= deliveryThreshold ? 0 : standardDeliveryFee;
  // 5% GST/Tax on subtotal rounded to 2 decimals
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + deliveryCharge + tax) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    deliveryCharge,
    tax,
    total,
    itemCount
  };
}

/**
 * Validates whether an order status transition is permitted.
 */
export function isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  if (currentStatus === newStatus) return true;
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(newStatus) : false;
}

/**
 * Checks if stock should be restored upon cancellation.
 * Only if the order was not already cancelled or delivered.
 */
export function shouldRestoreStockOnCancellation(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  return currentStatus !== 'CANCELLED' && currentStatus !== 'DELIVERED' && newStatus === 'CANCELLED';
}

/**
 * Validates customer registration details.
 */
export function validateCustomerRegistration(input: {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!input.fullName || input.fullName.trim().length < 3) {
    errors.fullName = 'Full name is required (minimum 3 characters)';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.email || !emailRegex.test(input.email.trim())) {
    errors.email = 'Valid email address is required';
  }

  const phoneRegex = /^[6-9]\d{9}$/;
  if (!input.phone || !phoneRegex.test(input.phone.replace(/[\s-]/g, ''))) {
    errors.phone = 'Valid 10-digit Indian phone number starting with 6-9 is required';
  }

  if (!input.password || input.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }

  if (input.password !== input.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // Security check: Customer registration MUST NOT allow privilege escalation to ADMIN
  if (input.role && input.role.toUpperCase() === 'ADMIN') {
    errors.role = 'Security violation: Cannot register as administrator via public form';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates stock availability against cart quantities.
 */
export function validateInventoryAvailability(
  cartItems: { bookId: number; title: string; quantity: number }[],
  stockMap: Record<number, number>
): { hasSufficientStock: boolean; insufficientItems: { title: string; requested: number; available: number }[] } {
  const insufficientItems: { title: string; requested: number; available: number }[] = [];

  for (const item of cartItems) {
    const available = stockMap[item.bookId] ?? 0;
    if (item.quantity > available) {
      insufficientItems.push({
        title: item.title,
        requested: item.quantity,
        available
      });
    }
  }

  return {
    hasSufficientStock: insufficientItems.length === 0,
    insufficientItems
  };
}

/**
 * IDOR authorization check: Ensures customer can only access their own order records.
 */
export function checkOrderAccessAuthorization(
  sessionUser: { id: number; role: 'CUSTOMER' | 'ADMIN' } | null,
  orderCustomerId: number
): { isAuthorized: boolean; reason?: string } {
  if (!sessionUser) {
    return { isAuthorized: false, reason: 'Authentication required. Please log in.' };
  }

  if (sessionUser.role === 'ADMIN') {
    return { isAuthorized: true };
  }

  if (sessionUser.id === orderCustomerId) {
    return { isAuthorized: true };
  }

  return {
    isAuthorized: false,
    reason: 'Forbidden: You do not have permission to view another customer’s order (IDOR violation prevented).'
  };
}
