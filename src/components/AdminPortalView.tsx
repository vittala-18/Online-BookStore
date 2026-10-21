import React, { useState, useMemo } from 'react';
import { 
  BookItem, 
  CategoryItem, 
  OrderRecord, 
  UserAccount, 
  InventoryMovementRecord 
} from '../data/bookstoreData';
import { 
  OrderStatus, 
  isValidStatusTransition, 
  VALID_STATUS_TRANSITIONS 
} from '../services/bookstoreLogic';
import { 
  ShieldCheck, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Search, 
  X, 
  CheckCircle2, 
  ShieldAlert, 
  Layers, 
  Archive, 
  FileSpreadsheet, 
  RotateCcw 
} from 'lucide-react';

interface AdminPortalProps {
  books: BookItem[];
  categories: CategoryItem[];
  orders: OrderRecord[];
  users: UserAccount[];
  inventoryLogs: InventoryMovementRecord[];
  currentUser: UserAccount | null;
  onAddBook: (newBook: Omit<BookItem, 'id' | 'createdAt' | 'updatedAt' | 'categoryName'>) => void;
  onEditBook: (bookId: number, updatedFields: Partial<BookItem>) => void;
  onDeleteBook: (bookId: number) => void;
  onAddCategory: (name: string, description: string) => boolean;
  onEditCategory: (id: number, name: string, description: string) => void;
  onDeleteCategory: (id: number) => { success: boolean; message: string };
  onUpdateStock: (bookId: number, newStock: number, reason: 'MANUAL_RESTOCK' | 'DAMAGED_CORRECTION') => void;
  onUpdateOrderStatus: (orderId: number, newStatus: OrderStatus) => { success: boolean; message: string };
  switchUser: (userId: number | null) => void;
}

export const AdminPortalView: React.FC<AdminPortalProps> = ({
  books,
  categories,
  orders,
  users,
  inventoryLogs,
  currentUser,
  onAddBook,
  onEditBook,
  onDeleteBook,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onUpdateStock,
  onUpdateOrderStatus,
  switchUser,
}) => {
  const [adminTab, setAdminTab] = useState<'overview' | 'books' | 'categories' | 'inventory' | 'orders' | 'reports'>('overview');

  // Book CRUD Modal State
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookItem | null>(null);

  // Form states for Add/Edit Book
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookCategoryId, setBookCategoryId] = useState<number>(categories[0]?.id || 1);
  const [bookPrice, setBookPrice] = useState('499.00');
  const [bookStock, setBookStock] = useState('10');
  const [bookIsbn, setBookIsbn] = useState('');
  const [bookPublisher, setBookPublisher] = useState('');
  const [bookDescription, setBookDescription] = useState('');
  const [bookImage, setBookImage] = useState('');
  const [bookFeatured, setBookFeatured] = useState(false);

  // Category Modal State
  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catError, setCatError] = useState<string | null>(null);

  // Stock edit state
  const [stockEditBook, setStockEditBook] = useState<BookItem | null>(null);
  const [manualStockVal, setManualStockVal] = useState('');

  // Table searches
  const [bookSearch, setBookSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');

  // Reports Date range
  const [reportStartDate, setReportStartDate] = useState('2026-01-01');
  const [reportEndDate, setReportEndDate] = useState('2026-12-31');

  // Check RBAC: Must be ADMIN
  const isAdmin = currentUser?.role === 'ADMIN';

  // Metrics
  const totalBooksCount = books.length;
  const activeBooksCount = books.filter((b) => b.active).length;
  const totalCustomersCount = users.filter((u) => u.role === 'CUSTOMER').length;
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'PLACED' || o.orderStatus === 'CONFIRMED').length;
  const lowStockBooks = books.filter((b) => b.stock <= 5 && b.active);
  const eligibleSales = orders
    .filter((o) => o.orderStatus !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Handle open edit
  const openEditModal = (book: BookItem) => {
    setEditingBook(book);
    setBookTitle(book.title);
    setBookAuthor(book.author);
    setBookCategoryId(book.categoryId);
    setBookPrice(book.price.toString());
    setBookStock(book.stock.toString());
    setBookIsbn(book.isbn);
    setBookPublisher(book.publisher);
    setBookDescription(book.description);
    setBookImage(book.coverImage);
    setBookFeatured(book.featured);
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(bookPrice);
    const stockNum = parseInt(bookStock, 10);

    if (!bookTitle.trim() || isNaN(priceNum) || priceNum < 0 || isNaN(stockNum) || stockNum < 0) {
      alert('Please enter valid title, non-negative price, and stock.');
      return;
    }

    if (editingBook) {
      onEditBook(editingBook.id, {
        title: bookTitle,
        author: bookAuthor,
        categoryId: bookCategoryId,
        price: priceNum,
        stock: stockNum,
        isbn: bookIsbn,
        publisher: bookPublisher,
        description: bookDescription,
        coverImage: bookImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        featured: bookFeatured
      });
      setEditingBook(null);
    } else {
      onAddBook({
        title: bookTitle,
        author: bookAuthor,
        categoryId: bookCategoryId,
        price: priceNum,
        stock: stockNum,
        isbn: bookIsbn || `978-013${Math.floor(100000 + Math.random() * 900000)}`,
        publisher: bookPublisher || 'Academic Press',
        description: bookDescription || 'Comprehensive academic textbook covering advanced engineering concepts.',
        coverImage: bookImage || 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=600&q=80',
        featured: bookFeatured,
        active: true
      });
      setIsAddBookOpen(false);
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setCatError(null);
    if (!catName.trim()) return;

    const ok = onAddCategory(catName.trim(), catDesc.trim());
    if (ok) {
      setCatName('');
      setCatDesc('');
      setIsAddCatOpen(false);
    } else {
      setCatError('A category with this name already exists in MySQL.');
    }
  };

  // CSV Export
  const exportOrdersCSV = () => {
    const headers = ['Order Reference', 'Customer', 'Email', 'Order Date', 'Subtotal', 'Tax', 'Delivery', 'Total Amount', 'Status', 'Payment Method'];
    const rows = orders.map((o) => [
      o.orderReference,
      `"${o.customerName.replace(/"/g, '""')}"`,
      o.customerEmail,
      o.orderDate,
      o.subtotal.toFixed(2),
      o.tax.toFixed(2),
      o.deliveryCharge.toFixed(2),
      o.totalAmount.toFixed(2),
      o.orderStatus,
      o.paymentMethod
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bookstore-orders-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If user is not admin, display 403 Forbidden RBAC test screen
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center border border-red-200 shadow-xl">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <span className="text-xs font-mono font-bold bg-red-100 text-red-800 px-3 py-1 rounded-full uppercase">
            HTTP 403 Forbidden &bull; AuthorizationFilter
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-3">Administrator Privileges Required</h2>
          <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">
            You are currently logged in as a <strong>CUSTOMER</strong> ({currentUser?.fullName || 'Guest'}).
            Under OWASP RBAC standards and university specification Section 7 &amp; 14, customer sessions cannot access administrative servlets or routes (`/admin/*`).
          </p>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs mb-6 text-left">
            <span className="font-semibold text-slate-700 block mb-1">To test Admin features:</span>
            <p className="text-slate-500">
              Click the button below to switch your session to the verified <strong>Alliance Bookstore Administrator</strong> account.
            </p>
          </div>
          <button
            onClick={() => switchUser(1)}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl text-xs shadow flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Switch to Administrator (ID: 1)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Admin Subnav */}
      <div className="bg-slate-900 text-white border-b border-slate-800 shadow sticky top-24 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex gap-1 py-2 overflow-x-auto text-xs">
            <button
              onClick={() => setAdminTab('overview')}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                adminTab === 'overview' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Dashboard
            </button>
            <button
              onClick={() => setAdminTab('books')}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                adminTab === 'books' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Package className="w-4 h-4" /> Books ({totalBooksCount})
            </button>
            <button
              onClick={() => setAdminTab('categories')}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                adminTab === 'categories' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" /> Categories ({categories.length})
            </button>
            <button
              onClick={() => setAdminTab('inventory')}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                adminTab === 'inventory' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Archive className="w-4 h-4" /> Inventory &amp; Logs
            </button>
            <button
              onClick={() => setAdminTab('orders')}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                adminTab === 'orders' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Orders ({totalOrdersCount})
            </button>
            <button
              onClick={() => setAdminTab('reports')}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                adminTab === 'reports' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" /> Reports &amp; CSV
            </button>
          </div>

          <span className="hidden lg:inline-flex text-[11px] bg-slate-800 px-3 py-1 rounded-full text-slate-400">
            Admin: {currentUser.fullName}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* ===================================
            TAB 1: OVERVIEW DASHBOARD
        =================================== */}
        {adminTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Catalogue Books</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{totalBooksCount}</div>
                  <span className="text-[11px] text-emerald-600 font-medium">{activeBooksCount} currently active</span>
                </div>
                <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Customers</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{totalCustomersCount}</div>
                  <span className="text-[11px] text-slate-500">Student &amp; faculty accounts</span>
                </div>
                <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sales</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">₹{eligibleSales.toFixed(2)}</div>
                  <span className="text-[11px] text-slate-500">{totalOrdersCount} orders placed</span>
                </div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Warnings</span>
                  <div className="text-2xl font-black text-amber-600 mt-1">{lowStockBooks.length}</div>
                  <span className="text-[11px] text-amber-700">Stock &le; 5 units threshold</span>
                </div>
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Recent Orders Table */}
              <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-sm">Recent Customer Orders</h3>
                  <button
                    onClick={() => setAdminTab('orders')}
                    className="text-xs text-blue-700 font-semibold hover:underline"
                  >
                    View All Orders
                  </button>
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b">
                      <tr>
                        <th className="p-3">Reference</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Items</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-blue-900">{o.orderReference}</td>
                          <td className="p-3">{o.customerName}</td>
                          <td className="p-3">{o.items.length} items</td>
                          <td className="p-3 font-bold">₹{o.totalAmount.toFixed(2)}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 border">
                              {o.orderStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Low Stock Watchlist */}
              <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 text-amber-700">
                    <AlertTriangle className="w-4 h-4" /> Low Stock Watchlist
                  </h3>
                  <button
                    onClick={() => setAdminTab('inventory')}
                    className="text-xs text-blue-700 font-semibold hover:underline"
                  >
                    Restock
                  </button>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-80 text-xs">
                  {lowStockBooks.length === 0 ? (
                    <p className="text-slate-400 text-center py-6">All book stock levels are above threshold.</p>
                  ) : (
                    lowStockBooks.map((b) => (
                      <div key={b.id} className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 flex items-center justify-between">
                        <div className="flex-1 pr-2">
                          <div className="font-bold text-slate-900 line-clamp-1">{b.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">Author: {b.author}</div>
                        </div>
                        <span className="font-extrabold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg text-xs">
                          {b.stock} left
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================
            TAB 2: BOOK MANAGEMENT (CRUD)
        =================================== */}
        {adminTab === 'books' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Book Catalogue Management (CRUD)</h2>
                <p className="text-xs text-slate-500">
                  Create, Read, Update, and Soft-delete books. Preserves historical order references.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingBook(null);
                    setBookTitle('');
                    setBookAuthor('');
                    setBookPrice('499.00');
                    setBookStock('10');
                    setBookIsbn('');
                    setBookPublisher('');
                    setBookDescription('');
                    setBookImage('');
                    setBookFeatured(false);
                    setIsAddBookOpen(true);
                  }}
                  className="bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add New Book
                </button>
              </div>
            </div>

            {/* Filter Search */}
            <div className="mb-4 max-w-md relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by title, author, or ISBN..."
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border rounded-xl"
              />
            </div>

            {/* Books Table */}
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-3">Cover</th>
                    <th className="p-3">Title &amp; Author</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {books
                    .filter((b) => 
                      !bookSearch.trim() || 
                      b.title.toLowerCase().includes(bookSearch.toLowerCase()) || 
                      b.author.toLowerCase().includes(bookSearch.toLowerCase())
                    )
                    .map((book) => (
                      <tr key={book.id} className="hover:bg-slate-50/80">
                        <td className="p-3">
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-9 h-12 object-cover rounded shadow-sm bg-slate-100"
                          />
                        </td>
                        <td className="p-3 max-w-xs">
                          <div className="font-bold text-slate-900 line-clamp-1">{book.title}</div>
                          <div className="text-slate-500 text-[11px]">{book.author} &bull; ISBN: {book.isbn}</div>
                        </td>
                        <td className="p-3">{book.categoryName}</td>
                        <td className="p-3 font-bold text-slate-900">₹{book.price.toFixed(2)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            book.stock <= 0 ? 'bg-red-100 text-red-700' : book.stock <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {book.stock}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            book.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {book.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <button
                            onClick={() => openEditModal(book)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200"
                            title="Edit Book"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to toggle active status for "${book.title}"? (Soft-deactivates to preserve past orders)`)) {
                                onDeleteBook(book.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                            title="Soft Delete / Toggle Status"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================================
            TAB 3: CATEGORY MANAGEMENT
        =================================== */}
        {adminTab === 'categories' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Category Management</h2>
                <p className="text-xs text-slate-500">
                  Manage academic book classifications. Foreign key constraints prevent deleting active categories.
                </p>
              </div>
              <button
                onClick={() => setIsAddCatOpen(true)}
                className="bg-blue-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>

            <div className="divide-y divide-slate-100 border rounded-2xl overflow-hidden text-xs">
              {categories.map((cat) => {
                const associatedBooks = books.filter((b) => b.categoryId === cat.id && b.active);
                return (
                  <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{cat.name}</div>
                      <div className="text-slate-500 mt-0.5">{cat.description}</div>
                      <div className="text-[11px] text-blue-900 font-semibold mt-1">
                        {associatedBooks.length} active books linked
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const res = onDeleteCategory(cat.id);
                          if (!res.success) {
                            alert(res.message);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================================
            TAB 4: INVENTORY & STOCK LOGS
        =================================== */}
        {adminTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Real-Time Inventory Adjustment</h2>
              <p className="text-xs text-slate-500 mb-4">
                Update stock levels with audit reasons. Directly persists to MySQL and records to `inventory_movements`.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {books.map((b) => (
                  <div key={b.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-slate-900 line-clamp-1">{b.title}</div>
                      <div className="text-slate-500 text-[11px]">Author: {b.author}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-slate-400">Current Stock:</span>
                        <span className={`font-mono font-bold text-sm ${b.stock <= 5 ? 'text-amber-600' : 'text-slate-900'}`}>
                          {b.stock} units
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => onUpdateStock(b.id, Math.max(0, b.stock - 1), 'DAMAGED_CORRECTION')}
                          className="px-2 py-1 bg-white border border-slate-300 rounded font-bold hover:bg-slate-100"
                          title="Decrease by 1"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => onUpdateStock(b.id, b.stock + 5, 'MANUAL_RESTOCK')}
                          className="px-2 py-1 bg-white border border-slate-300 rounded font-bold hover:bg-slate-100 text-emerald-700"
                          title="Restock +5"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => onUpdateStock(b.id, b.stock + 10, 'MANUAL_RESTOCK')}
                          className="px-2 py-1 bg-white border border-slate-300 rounded font-bold hover:bg-slate-100 text-blue-700"
                          title="Restock +10"
                        >
                          +10
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setStockEditBook(b);
                          setManualStockVal(b.stock.toString());
                        }}
                        className="text-blue-900 font-semibold underline text-[11px]"
                      >
                        Set Exact
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory Movement Audit Log */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Inventory Movement Audit Trail (MySQL)</h3>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold">
                    <tr>
                      <th className="p-2.5">Timestamp</th>
                      <th className="p-2.5">Book Title</th>
                      <th className="p-2.5">Change</th>
                      <th className="p-2.5">Old &rarr; New</th>
                      <th className="p-2.5">Reason</th>
                      <th className="p-2.5">Actor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventoryLogs.slice(0, 10).map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="p-2.5 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-2.5 font-medium text-slate-800">{log.bookTitle}</td>
                        <td className="p-2.5 font-bold">
                          <span className={log.changeQuantity > 0 ? 'text-emerald-600' : 'text-red-600'}>
                            {log.changeQuantity > 0 ? `+${log.changeQuantity}` : log.changeQuantity}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-slate-600">
                          {log.previousStock} &rarr; {log.newStock}
                        </td>
                        <td className="p-2.5">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-mono">
                            {log.reason}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-600">{log.adminName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================================
            TAB 5: ORDER MANAGEMENT
        =================================== */}
        {adminTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Order Management &amp; State Machine</h2>
                <p className="text-xs text-slate-500">
                  Update order status according to strict transition rules. Cancelling an order automatically restores inventory.
                </p>
              </div>

              <div className="flex gap-2">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="text-xs bg-slate-50 border rounded-xl px-3 py-2"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PLACED">PLACED</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
                <button
                  onClick={exportOrdersCSV}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-2 rounded-xl shadow flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {orders
                .filter((o) => orderStatusFilter === 'ALL' || o.orderStatus === orderStatusFilter)
                .map((order) => {
                  const allowedTransitions = VALID_STATUS_TRANSITIONS[order.orderStatus] || [];

                  return (
                    <div key={order.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3 mb-3">
                        <div>
                          <span className="font-mono font-bold text-sm text-blue-950">{order.orderReference}</span>
                          <span className="text-slate-500 ml-2">Customer: <strong className="text-slate-800">{order.customerName}</strong> ({order.customerEmail})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500">{new Date(order.orderDate).toLocaleString()}</span>
                          <span className="font-black text-sm text-slate-900">₹{order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        {order.items.map((it) => (
                          <div key={it.id} className="text-slate-700 flex justify-between bg-white p-2 rounded-lg border border-slate-100">
                            <span>{it.quantity}x {it.bookTitle}</span>
                            <span className="font-semibold">₹{it.subtotal.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Status Transition Control */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Current Status:</span>
                          <span className="font-bold px-2 py-0.5 rounded-full border bg-white text-slate-800">
                            {order.orderStatus}
                          </span>
                        </div>

                        {allowedTransitions.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">Advance to:</span>
                            {allowedTransitions.map((nextStatus) => (
                              <button
                                key={nextStatus}
                                onClick={() => {
                                  const res = onUpdateOrderStatus(order.id, nextStatus);
                                  if (!res.success) alert(res.message);
                                }}
                                className={`px-3 py-1 rounded-lg font-bold text-[11px] shadow-sm transition-transform active:scale-95 ${
                                  nextStatus === 'CANCELLED'
                                    ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                                    : 'bg-blue-900 text-white hover:bg-blue-800'
                                }`}
                              >
                                {nextStatus === 'CANCELLED' ? 'Cancel & Restock' : nextStatus}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">
                            Terminal state reached ({order.orderStatus}) &bull; No further transitions permitted
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ===================================
            TAB 6: REPORTS & EXPORT
        =================================== */}
        {adminTab === 'reports' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Database Sales &amp; Inventory Reports</h2>
                <p className="text-xs text-slate-500">
                  Real aggregate queries from MySQL. Excludes cancelled orders from gross revenue.
                </p>
              </div>

              <button
                onClick={exportOrdersCSV}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download Complete Orders CSV
              </button>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border">
                <span className="text-slate-400 font-semibold uppercase">Total Gross Sales</span>
                <div className="text-2xl font-black text-blue-950 mt-1">₹{eligibleSales.toFixed(2)}</div>
                <p className="text-slate-500 mt-1">From eligible fulfilled &amp; placed orders</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border">
                <span className="text-slate-400 font-semibold uppercase">Physical Units in Stock</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {books.reduce((acc, b) => acc + b.stock, 0)} units
                </div>
                <p className="text-slate-500 mt-1">Across {books.length} catalogue titles</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border">
                <span className="text-slate-400 font-semibold uppercase">Average Order Value</span>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  ₹{orders.length ? (eligibleSales / orders.length).toFixed(2) : '0.00'}
                </div>
                <p className="text-slate-500 mt-1">Based on active database records</p>
              </div>
            </div>

            {/* Category Sales Distribution */}
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-3">Catalogue Distribution by Category</h3>
              <div className="space-y-2 text-xs">
                {categories.map((cat) => {
                  const catBooks = books.filter((b) => b.categoryId === cat.id);
                  const totalCatStock = catBooks.reduce((sum, b) => sum + b.stock, 0);
                  return (
                    <div key={cat.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">{cat.name}</span>
                        <span className="text-slate-400 ml-2">({catBooks.length} titles)</span>
                      </div>
                      <span className="font-semibold text-slate-700">{totalCatStock} copies in stock</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===================================
          MODAL: ADD / EDIT BOOK
      =================================== */}
      {(isAddBookOpen || editingBook) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsAddBookOpen(false);
                setEditingBook(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 mb-1">
              {editingBook ? 'Edit Book Record' : 'Add New Book to Catalogue'}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Enforces server-side validation and prepared SQL parameter binding.
            </p>

            <form onSubmit={handleSaveBook} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  placeholder="e.g. Distributed Operating Systems"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Author *</label>
                  <input
                    type="text"
                    required
                    value={bookAuthor}
                    onChange={(e) => setBookAuthor(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                    placeholder="Author name"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={bookCategoryId}
                    onChange={(e) => setBookCategoryId(parseInt(e.target.value, 10))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={bookPrice}
                    onChange={(e) => setBookPrice(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={bookStock}
                    onChange={(e) => setBookStock(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ISBN</label>
                  <input
                    type="text"
                    value={bookIsbn}
                    onChange={(e) => setBookIsbn(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                    placeholder="978-..."
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Publisher</label>
                <input
                  type="text"
                  value={bookPublisher}
                  onChange={(e) => setBookPublisher(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  placeholder="e.g. Pearson, MIT Press"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={bookImage}
                  onChange={(e) => setBookImage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={bookDescription}
                  onChange={(e) => setBookDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  placeholder="Synopsis and textbook contents..."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featChk"
                  checked={bookFeatured}
                  onChange={(e) => setBookFeatured(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="featChk" className="text-slate-700 select-none">
                  Mark as Featured on Homepage
                </label>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddBookOpen(false);
                    setEditingBook(null);
                  }}
                  className="flex-1 py-2.5 border rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-900 text-white rounded-xl font-bold shadow hover:bg-blue-800"
                >
                  {editingBook ? 'Save Changes' : 'Create Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================
          MODAL: ADD CATEGORY
      =================================== */}
      {isAddCatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddCatOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-slate-900 text-base mb-1">Create Book Category</h3>
            <p className="text-xs text-slate-500 mb-4">Enforces UNIQUE constraint in MySQL.</p>

            {catError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl mb-3 border border-red-200">
                {catError}
              </div>
            )}

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Artificial Intelligence & Robotics"
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Brief summary of books in this domain..."
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-900 text-white font-bold rounded-xl text-xs shadow hover:bg-blue-800 mt-2"
              >
                Add Category to Database
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================================
          MODAL: SET EXACT STOCK
      =================================== */}
      {stockEditBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-xs">
            <button
              onClick={() => setStockEditBook(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-slate-900 text-sm mb-1">Adjust Exact Stock</h3>
            <p className="text-slate-500 mb-4 line-clamp-1">{stockEditBook.title}</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const num = parseInt(manualStockVal, 10);
                if (isNaN(num) || num < 0) {
                  alert('Stock must be a non-negative integer.');
                  return;
                }
                onUpdateStock(stockEditBook.id, num, 'MANUAL_RESTOCK');
                setStockEditBook(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={manualStockVal}
                  onChange={(e) => setManualStockVal(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-base font-bold text-center"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-900 text-white font-bold rounded-xl shadow hover:bg-blue-800"
              >
                Commit Stock Update (MySQL)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
