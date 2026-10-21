import React, { useState, useMemo } from 'react';
import { 
  BookItem, 
  CategoryItem, 
  OrderRecord, 
  UserAccount 
} from '../data/bookstoreData';
import { calculateCartSummary, CartItemModel } from '../services/bookstoreLogic';
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Eye, 
  PackageCheck, 
  Truck, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Clock, 
  ShieldAlert, 
  Lock,
  ArrowRight
} from 'lucide-react';

interface StorefrontViewProps {
  books: BookItem[];
  categories: CategoryItem[];
  currentUser: UserAccount | null;
  orders: OrderRecord[];
  cart: { bookId: number; quantity: number }[];
  addToCart: (bookId: number, quantity?: number) => void;
  updateCartQuantity: (bookId: number, quantity: number) => void;
  removeFromCart: (bookId: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  placeOrder: (deliveryAddress: string, paymentMethod: string) => Promise<{ success: boolean; message: string; orderRef?: string }>;
  cancelOrder: (orderId: number) => void;
  updateUserProfile: (fullName: string, phone: string, address: string) => void;
  changeUserPassword: (currentPass: string, newPass: string) => boolean;
  onNavigateToRegister: () => void;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({
  books,
  categories,
  currentUser,
  orders,
  cart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  isCartOpen,
  setIsCartOpen,
  placeOrder,
  cancelOrder,
  updateUserProfile,
  changeUserPassword,
  onNavigateToRegister,
}) => {
  // Navigation sub-tab
  const [subTab, setSubTab] = useState<'catalog' | 'orders' | 'profile'>('catalog');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'title_asc'>('newest');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Selected book for details modal
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);

  // Checkout modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutAddress, setCheckoutAddress] = useState(currentUser?.address || 'Room 304, Boys Hostel Block B, Alliance University Campus, Bengaluru 562106');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery (COD)');
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<{ ref: string; total: number } | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Selected order for customer order details modal
  const [viewingOrder, setViewingOrder] = useState<OrderRecord | null>(null);

  // Profile edit state
  const [profileName, setProfileName] = useState(currentUser?.fullName || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileAddress, setProfileAddress] = useState(currentUser?.address || '');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  // Filter books
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      if (!b.active) return false;
      if (inStockOnly && b.stock <= 0) return false;
      if (selectedCategory !== null && b.categoryId !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = b.title.toLowerCase().includes(q);
        const matchesAuthor = b.author.toLowerCase().includes(q);
        const matchesPublisher = b.publisher.toLowerCase().includes(q);
        const matchesIsbn = b.isbn.toLowerCase().includes(q);
        if (!matchesTitle && !matchesAuthor && !matchesPublisher && !matchesIsbn) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'title_asc') return a.title.localeCompare(b.title);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [books, inStockOnly, selectedCategory, searchQuery, sortBy]);

  // Paginated books
  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / pageSize));
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBooks.slice(start, start + pageSize);
  }, [filteredBooks, currentPage, pageSize]);

  // Cart Items with book details
  const cartItemsWithDetails: CartItemModel[] = useMemo(() => {
    return cart.map((item) => {
      const book = books.find((b) => b.id === item.bookId);
      return {
        bookId: item.bookId,
        title: book?.title || 'Unknown Book',
        price: book?.price || 0,
        quantity: item.quantity,
        stock: book?.stock || 0
      };
    });
  }, [cart, books]);

  const cartSummary = useMemo(() => {
    return calculateCartSummary(cartItemsWithDetails);
  }, [cartItemsWithDetails]);

  // Customer Orders (filtered to logged-in user or empty if guest)
  const customerOrders = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'ADMIN') return orders;
    return orders.filter((o) => o.customerId === currentUser.id);
  }, [orders, currentUser]);

  const handlePlaceOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (!currentUser) {
      setCheckoutError('Please log in with a customer account before placing an order.');
      return;
    }

    if (!checkoutAddress.trim()) {
      setCheckoutError('Delivery address is strictly required.');
      return;
    }

    setCheckoutSubmitting(true);
    const result = await placeOrder(checkoutAddress, paymentMethod);
    setCheckoutSubmitting(false);

    if (result.success && result.orderRef) {
      setOrderConfirmation({ ref: result.orderRef, total: cartSummary.total });
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
    } else {
      setCheckoutError(result.message);
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || !profilePhone.trim()) return;
    updateUserProfile(profileName, profilePhone, profileAddress);
    setProfileSuccessMsg('Profile updated successfully in MySQL database.');
    setTimeout(() => setProfileSuccessMsg(null), 4000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (!currentPass) {
      setPassError('Current password is required.');
      return;
    }
    if (newPass.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('New passwords do not match.');
      return;
    }

    const success = changeUserPassword(currentPass, newPass);
    if (success) {
      setPassSuccess('Password changed and securely hashed with SHA-256 + Salt.');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      setPassError('Current password verification failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Sub-Navigation for Storefront */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-24 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex gap-2 py-2">
            <button
              onClick={() => setSubTab('catalog')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                subTab === 'catalog'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4" /> Book Catalogue
            </button>
            <button
              onClick={() => setSubTab('orders')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                subTab === 'orders'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <PackageCheck className="w-4 h-4" /> My Orders ({customerOrders.length})
            </button>
            <button
              onClick={() => setSubTab('profile')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                subTab === 'profile'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Lock className="w-4 h-4" /> Customer Profile
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
            <span>Free delivery on academic orders &ge; ₹500</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> Campus Delivery Available
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* ===================================
            CATALOGUE VIEW
        =================================== */}
        {subTab === 'catalog' && (
          <div>
            {/* Hero / Banner */}
            <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white p-6 sm:p-10 mb-8 overflow-hidden shadow-xl border border-slate-800">
              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                  Alliance University Bookstore
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  Academic Textbooks &amp; Engineering Essentials
                </h1>
                <p className="mt-2 text-slate-300 text-sm sm:text-base">
                  Real-time inventory connected to MySQL 8. Browse Computer Science, Algorithms, Software Engineering, Networks, and Math.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchQuery('');
                      setInStockOnly(false);
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm transition-transform active:scale-95 shadow"
                  >
                    View All {books.length} Books
                  </button>
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4 text-amber-400" />
                    Open Cart ({cartSummary.itemCount})
                  </button>
                </div>
              </div>

              {/* Decorative background glow */}
              <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Search Input */}
                <div className="md:col-span-5 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search by title, author, ISBN, or publisher..."
                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Category Dropdown */}
                <div className="md:col-span-3">
                  <select
                    value={selectedCategory === null ? '' : selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value === '' ? null : parseInt(e.target.value, 10));
                      setCurrentPage(1);
                    }}
                    className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="">All Categories ({books.length})</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Sort Option */}
                <div className="md:col-span-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="newest">Sort: Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="title_asc">Title: A to Z</option>
                  </select>
                </div>

                {/* Stock Checkbox & Clear */}
                <div className="md:col-span-2 flex items-center justify-between sm:justify-end gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => {
                        setInStockOnly(e.target.checked);
                        setCurrentPage(1);
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>In Stock Only</span>
                  </label>

                  {(searchQuery || selectedCategory !== null || inStockOnly) && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory(null);
                        setInStockOnly(false);
                        setCurrentPage(1);
                      }}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Category Quick Tags */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
                <span className="text-slate-400 font-medium py-1">Popular:</span>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-full transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-blue-900 text-white font-semibold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Results count & active criteria */}
            <div className="flex justify-between items-center mb-4 text-xs text-slate-500">
              <div>
                Showing <span className="font-bold text-slate-800">{filteredBooks.length}</span> books matching criteria
              </div>
              <div>Page {currentPage} of {totalPages}</div>
            </div>

            {/* Book Cards Grid */}
            {paginatedBooks.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm max-w-md mx-auto my-12">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No books found</h3>
                <p className="text-sm text-slate-500 mt-1 mb-6">
                  No titles match your current search &ldquo;{searchQuery}&rdquo; or filter parameters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                    setInStockOnly(false);
                  }}
                  className="bg-blue-900 text-white font-semibold px-4 py-2 rounded-xl text-sm shadow hover:bg-blue-800"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {paginatedBooks.map((book) => {
                  const inCartItem = cart.find((i) => i.bookId === book.id);
                  const isOutOfStock = book.stock <= 0;

                  return (
                    <div
                      key={book.id}
                      className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col group"
                    >
                      {/* Book Cover Image */}
                      <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            // Fallback to stylized SVG placeholder
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                          }}
                        />

                        {/* Badges */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                          <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
                            {book.categoryName}
                          </span>
                          {book.featured && (
                            <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                              Featured
                            </span>
                          )}
                        </div>

                        {/* Stock status badge */}
                        <div className="absolute top-2.5 right-2.5">
                          {isOutOfStock ? (
                            <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow">
                              Out of Stock
                            </span>
                          ) : book.stock <= 4 ? (
                            <span className="bg-amber-500 text-slate-950 text-[11px] font-bold px-2 py-0.5 rounded-md shadow">
                              Only {book.stock} left
                            </span>
                          ) : (
                            <span className="bg-emerald-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md shadow">
                              In Stock ({book.stock})
                            </span>
                          )}
                        </div>

                        {/* Quick View Button */}
                        <button
                          onClick={() => setSelectedBook(book)}
                          className="absolute inset-x-4 bottom-3 bg-white/95 hover:bg-white text-slate-900 py-1.5 rounded-xl text-xs font-semibold shadow opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" /> View Details
                        </button>
                      </div>

                      {/* Book Info */}
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 
                          onClick={() => setSelectedBook(book)}
                          className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-blue-600 cursor-pointer" 
                          title={book.title}
                        >
                          {book.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{book.author}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">ISBN: {book.isbn}</p>

                        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-xs text-slate-400">Price:</span>
                            <div className="text-base font-extrabold text-blue-950 leading-none">
                              ₹{book.price.toFixed(2)}
                            </div>
                          </div>

                          {/* Add to Cart button */}
                          <button
                            onClick={() => addToCart(book.id, 1)}
                            disabled={isOutOfStock}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              isOutOfStock
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : inCartItem
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                                : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow active:scale-95'
                            }`}
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            {inCartItem ? `In Cart (${inCartItem.quantity})` : 'Add to Cart'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                      currentPage === page
                        ? 'bg-blue-900 text-white'
                        : 'border border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===================================
            CUSTOMER ORDERS VIEW
        =================================== */}
        {subTab === 'orders' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Customer Order History</h2>
                <p className="text-xs text-slate-500">
                  Orders associated with customer: <span className="font-semibold text-slate-800">{currentUser?.fullName || 'Guest'}</span>
                </p>
              </div>
              <button
                onClick={() => setSubTab('catalog')}
                className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
              >
                Back to Catalogue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {!currentUser ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center text-amber-900">
                <ShieldAlert className="w-10 h-10 mx-auto mb-2 text-amber-600" />
                <h3 className="font-bold text-base">Authentication Required</h3>
                <p className="text-xs text-amber-700 mt-1 mb-4">
                  Please select an active customer profile in the top-right session dropdown to view order history.
                </p>
              </div>
            ) : customerOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm">
                <PackageCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800">No Orders Placed Yet</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  You haven&apos;t placed any orders with this customer account. Browse our books to place your first order.
                </p>
                <button
                  onClick={() => setSubTab('catalog')}
                  className="bg-blue-900 text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Browse Catalogue
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {customerOrders.map((order) => {
                  const statusColors: Record<string, string> = {
                    PLACED: 'bg-blue-100 text-blue-800 border-blue-200',
                    CONFIRMED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                    SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
                    DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
                  };

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-slate-900">{order.orderReference}</span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusColors[order.orderStatus] || 'bg-slate-100'}`}>
                              {order.orderStatus}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> {new Date(order.orderDate).toLocaleString()}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-slate-400">Total Amount:</span>
                          <div className="text-lg font-black text-blue-950">₹{order.totalAmount.toFixed(2)}</div>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="space-y-2 mb-3">
                        {order.items.map((it) => (
                          <div key={it.id} className="flex items-center justify-between text-xs text-slate-700">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 bg-slate-100 rounded text-center text-slate-600 font-bold leading-5 text-[10px]">
                                {it.quantity}x
                              </span>
                              <span className="font-medium text-slate-900">{it.bookTitle}</span>
                            </div>
                            <span className="font-semibold">₹{it.subtotal.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          Payment: <span className="font-semibold text-slate-700">{order.paymentMethod}</span>
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewingOrder(order)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700"
                          >
                            View Invoice
                          </button>

                          {(order.orderStatus === 'PLACED' || order.orderStatus === 'CONFIRMED') && (
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to cancel this order? Stock will be restored automatically.')) {
                                  cancelOrder(order.id);
                                }
                              }}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================================
            CUSTOMER PROFILE VIEW
        =================================== */}
        {subTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Customer Account Settings</h2>
              <p className="text-xs text-slate-500 mb-4">
                Update delivery address, contact details, and secure credentials.
              </p>

              {profileSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address (Read-only)</label>
                  <input
                    type="email"
                    value={currentUser?.email || 'guest@example.com'}
                    disabled
                    className="w-full p-2.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl cursor-not-allowed text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Default Delivery Address</label>
                  <textarea
                    rows={3}
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-5 rounded-xl text-xs shadow"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>

            {/* Change Password Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-1">Change Account Password</h3>
              <p className="text-xs text-slate-500 mb-4">
                Protects against password disclosure. Updates salted SHA-256 hash in MySQL.
              </p>

              {passError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{passError}</span>
                </div>
              )}
              {passSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{passSuccess}</span>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password (demo: Student@123)"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                    <input
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Repeat new password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-5 rounded-xl text-xs shadow"
                >
                  Update Password
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ===================================
          MODAL: BOOK DETAILS
      =================================== */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100"
              aria-label="Close Book Details"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
              <div className="sm:col-span-5 rounded-2xl overflow-hidden shadow bg-slate-100 aspect-[3/4]">
                <img
                  src={selectedBook.coverImage}
                  alt={selectedBook.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="sm:col-span-7 flex flex-col">
                <span className="badge bg-blue-100 text-blue-900 text-xs font-bold px-3 py-1 rounded-full self-start mb-2">
                  {selectedBook.categoryName}
                </span>

                <h2 className="text-xl font-bold text-slate-900 leading-snug">
                  {selectedBook.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1">By {selectedBook.author}</p>

                <div className="my-4 py-3 border-y border-slate-100 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Publisher:</span>
                    <p className="font-semibold text-slate-800">{selectedBook.publisher}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">ISBN:</span>
                    <p className="font-semibold text-slate-800">{selectedBook.isbn}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Availability:</span>
                    <p className="font-semibold text-slate-800">
                      {selectedBook.stock > 0 ? (
                        <span className="text-emerald-600 font-bold">{selectedBook.stock} in stock</span>
                      ) : (
                        <span className="text-red-600 font-bold">Out of stock</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Catalogue ID:</span>
                    <p className="font-mono text-slate-800">#BK-{selectedBook.id}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 mb-6 leading-relaxed">
                  <span className="font-semibold text-slate-800 block mb-1">Description:</span>
                  {selectedBook.description}
                </div>

                <div className="mt-auto flex items-center justify-between pt-2">
                  <div>
                    <span className="text-xs text-slate-400">Price:</span>
                    <div className="text-2xl font-black text-blue-950">₹{selectedBook.price.toFixed(2)}</div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        addToCart(selectedBook.id, 1);
                        setSelectedBook(null);
                        setIsCartOpen(true);
                      }}
                      disabled={selectedBook.stock <= 0}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow flex items-center gap-2 disabled:opacity-40"
                    >
                      <ShoppingCart className="w-4 h-4" /> Add &amp; Checkout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================
          MODAL: SHOPPING CART DRAWER
      =================================== */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col p-6 animate-slideLeft">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-900" />
                <h2 className="text-base font-extrabold text-slate-900">Your Shopping Cart</h2>
                <span className="bg-blue-100 text-blue-900 text-xs font-bold px-2 py-0.5 rounded-full">
                  {cartSummary.itemCount}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
                aria-label="Close Shopping Cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {cartItemsWithDetails.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <ShoppingCart className="w-12 h-12 stroke-[1.2] mb-3 text-slate-300" />
                  <p className="font-bold text-slate-700 text-sm">Your cart is empty</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">
                    Add textbooks from the catalogue to begin your order.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-xs bg-blue-900 text-white font-semibold px-4 py-2 rounded-xl"
                  >
                    Start Browsing
                  </button>
                </div>
              ) : (
                cartItemsWithDetails.map((item) => (
                  <div
                    key={item.bookId}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                      <div className="text-slate-500 mt-0.5">
                        ₹{item.price.toFixed(2)} each &bull; Available: {item.stock}
                      </div>
                      <div className="text-blue-900 font-extrabold mt-1">
                        Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1">
                      <button
                        onClick={() => updateCartQuantity(item.bookId, item.quantity - 1)}
                        className="w-6 h-6 rounded flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.bookId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-6 h-6 rounded flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.bookId)}
                      className="text-slate-400 hover:text-red-500 p-1"
                      title="Remove Item"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer & Calculations */}
            {cartItemsWithDetails.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">₹{cartSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Charge:</span>
                  <span>
                    {cartSummary.deliveryCharge === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE (Order &ge; ₹500)</span>
                    ) : (
                      <span className="font-semibold text-slate-800">₹{cartSummary.deliveryCharge.toFixed(2)}</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Estimated GST (5%):</span>
                  <span className="font-semibold text-slate-800">₹{cartSummary.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-blue-950 pt-2 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span className="text-base text-blue-900">₹{cartSummary.total.toFixed(2)}</span>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    onClick={clearCart}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs shadow flex items-center justify-center gap-1.5"
                  >
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================
          MODAL: CHECKOUT
      =================================== */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100"
              aria-label="Close Checkout"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 mb-1">Confirm Order &amp; Checkout</h2>
            <p className="text-xs text-slate-500 mb-4">
              Transactional atomic checkout with server-side stock locking.
            </p>

            {checkoutError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{checkoutError}</span>
              </div>
            )}

            <form onSubmit={handlePlaceOrderSubmit} className="space-y-4 text-xs">
              {/* Customer Info */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-800">
                  Ordering as: <span className="text-blue-900">{currentUser?.fullName || 'Guest (Please Login)'}</span>
                </div>
                <div className="text-slate-500">Email: {currentUser?.email || 'N/A'}</div>
                <div className="text-slate-500">Phone: {currentUser?.phone || 'N/A'}</div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={checkoutAddress}
                  onChange={(e) => setCheckoutAddress(e.target.value)}
                  placeholder="Enter complete university hostel or residence address..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash on Delivery (COD)"
                      checked={paymentMethod === 'Cash on Delivery (COD)'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-blue-600"
                    />
                    <div>
                      <div className="font-semibold text-slate-800">Cash on Delivery (COD)</div>
                      <div className="text-[11px] text-slate-400">Pay cash upon book delivery on campus</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Simulated University Card Payment"
                      checked={paymentMethod === 'Simulated University Card Payment'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-blue-600"
                    />
                    <div>
                      <div className="font-semibold text-slate-800">Simulated Campus Card Payment</div>
                      <div className="text-[11px] text-slate-400">Academic simulation - no real funds charged</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Breakdown */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Items ({cartSummary.itemCount}):</span>
                  <span>₹{cartSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge:</span>
                  <span>{cartSummary.deliveryCharge === 0 ? 'FREE' : `₹${cartSummary.deliveryCharge.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (5%):</span>
                  <span>₹{cartSummary.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-blue-950 text-sm pt-1 border-t border-blue-200">
                  <span>Order Total:</span>
                  <span>₹{cartSummary.total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={checkoutSubmitting}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {checkoutSubmitting ? (
                  <span>Executing JDBC Transaction...</span>
                ) : (
                  <>
                    <PackageCheck className="w-4 h-4" /> Place Order (₹{cartSummary.total.toFixed(2)})
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================================
          MODAL: ORDER CONFIRMATION
      =================================== */}
      {orderConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Order Placed Successfully!</h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Your order has been recorded in the MySQL database and book stock has been atomically decremented.
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs mb-6 space-y-1">
              <div className="text-slate-400">Order Reference:</div>
              <div className="font-mono font-bold text-blue-900 text-sm">{orderConfirmation.ref}</div>
              <div className="text-slate-500 pt-2">
                Total Amount: <span className="font-extrabold text-slate-800">₹{orderConfirmation.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setOrderConfirmation(null);
                  setSubTab('orders');
                }}
                className="flex-1 bg-blue-900 text-white font-bold py-2.5 rounded-xl text-xs shadow"
              >
                View in Order History
              </button>
              <button
                onClick={() => {
                  setOrderConfirmation(null);
                  setSubTab('catalog');
                }}
                className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================
          MODAL: INVOICE / ORDER DETAILS
      =================================== */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewingOrder(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100"
              aria-label="Close Order Details"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-4 mb-4">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Order Invoice</span>
              <h2 className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">{viewingOrder.orderReference}</h2>
              <p className="text-xs text-slate-400">Placed on {new Date(viewingOrder.orderDate).toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400">Customer:</span>
                <p className="font-semibold text-slate-800">{viewingOrder.customerName}</p>
              </div>
              <div>
                <span className="text-slate-400">Status:</span>
                <p className="font-bold text-blue-900">{viewingOrder.orderStatus}</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400">Delivery Address:</span>
                <p className="font-semibold text-slate-800">{viewingOrder.deliveryAddress}</p>
              </div>
            </div>

            {/* Line items table */}
            <div className="border rounded-xl overflow-hidden mb-4 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Unit Price</th>
                    <th className="p-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewingOrder.items.map((it) => (
                    <tr key={it.id}>
                      <td className="p-2.5 font-medium text-slate-800">{it.bookTitle}</td>
                      <td className="p-2.5 text-center">{it.quantity}</td>
                      <td className="p-2.5 text-right">₹{it.unitPrice.toFixed(2)}</td>
                      <td className="p-2.5 text-right font-bold">₹{it.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total breakdown */}
            <div className="space-y-1 text-xs text-right border-t border-slate-100 pt-3">
              <div className="text-slate-500">Subtotal: ₹{viewingOrder.subtotal.toFixed(2)}</div>
              <div className="text-slate-500">Delivery: {viewingOrder.deliveryCharge === 0 ? 'FREE' : `₹${viewingOrder.deliveryCharge.toFixed(2)}`}</div>
              <div className="text-slate-500">Tax (5%): ₹{viewingOrder.tax.toFixed(2)}</div>
              <div className="text-base font-black text-blue-950 pt-1">Grand Total: ₹{viewingOrder.totalAmount.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
