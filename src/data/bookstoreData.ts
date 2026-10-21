export interface BookItem {
  id: number;
  title: string;
  author: string;
  categoryId: number;
  categoryName: string;
  description: string;
  publisher: string;
  isbn: string;
  price: number;
  stock: number;
  coverImage: string;
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryItem {
  id: number;
  name: string;
  description: string;
  bookCount: number;
}

export interface UserAccount {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  role: 'CUSTOMER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface OrderItemDetail {
  id: number;
  orderId: number;
  bookId: number;
  bookTitle: string;
  author: string;
  coverImage: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderRecord {
  id: number;
  orderReference: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  deliveryAddress: string;
  orderDate: string;
  subtotal: number;
  deliveryCharge: number;
  tax: number;
  totalAmount: number;
  paymentMethod: string;
  orderStatus: 'PLACED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  items: OrderItemDetail[];
}

export interface InventoryMovementRecord {
  id: number;
  bookId: number;
  bookTitle: string;
  changeQuantity: number;
  previousStock: number;
  newStock: number;
  reason: 'PURCHASE' | 'CANCELLATION_RESTOCK' | 'MANUAL_RESTOCK' | 'DAMAGED_CORRECTION';
  reference: string;
  timestamp: string;
  adminName: string;
}

export const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 1, name: 'Computer Science', description: 'Core CS, algorithms, data structures, OS, databases, and networks.', bookCount: 5 },
  { id: 2, name: 'Software Engineering', description: 'Clean architecture, design patterns, testing, and modern practices.', bookCount: 3 },
  { id: 3, name: 'Web & Cloud Development', description: 'Full-stack web, cloud architecture, APIs, and microservices.', bookCount: 3 },
  { id: 4, name: 'Mathematics & Data Science', description: 'Discrete mathematics, linear algebra, statistics, and machine learning.', bookCount: 2 },
  { id: 5, name: 'Cybersecurity', description: 'Network security, cryptography, and secure software development.', bookCount: 2 }
];

export const INITIAL_BOOKS: BookItem[] = [
  {
    id: 1,
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    categoryId: 2,
    categoryName: 'Software Engineering',
    description: 'Even bad code can function. But if code is not clean, it can bring a development organization to its knees. A timeless guide to writing readable, maintainable software.',
    publisher: 'Prentice Hall',
    isbn: '978-0132350884',
    price: 499.00,
    stock: 12,
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=600&q=80',
    featured: true,
    active: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-10-15T12:00:00Z'
  },
  {
    id: 2,
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
    categoryId: 1,
    categoryName: 'Computer Science',
    description: 'The definitive textbook on modern algorithms. Covers algorithmic paradigms, graph theory, dynamic programming, and computational complexity rigorously.',
    publisher: 'MIT Press',
    isbn: '978-0262033848',
    price: 850.00,
    stock: 6,
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    featured: true,
    active: true,
    createdAt: '2026-01-12T11:00:00Z',
    updatedAt: '2026-10-18T09:30:00Z'
  },
  {
    id: 3,
    title: 'Head First Java: A Brain-Friendly Guide (3rd Edition)',
    author: 'Kathy Sierra, Bert Bates, Trisha Gee',
    categoryId: 1,
    categoryName: 'Computer Science',
    description: 'A complete, highly visual learning experience in Java and object-oriented programming. Covers modern Java features, lambdas, streams, and concurrency.',
    publisher: "O'Reilly Media",
    isbn: '978-1491910771',
    price: 550.00,
    stock: 15,
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    featured: true,
    active: true,
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-10-12T14:20:00Z'
  },
  {
    id: 4,
    title: 'Database System Concepts (7th Edition)',
    author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
    categoryId: 1,
    categoryName: 'Computer Science',
    description: 'Comprehensive coverage of relational database management, SQL, query processing, concurrency control, transaction management, and NoSQL engines.',
    publisher: 'McGraw-Hill Education',
    isbn: '978-0078022159',
    price: 680.00,
    stock: 4,
    coverImage: 'https://images.unsplash.com/photo-1507842229451-9f75066a8775?auto=format&fit=crop&w=600&q=80',
    featured: false,
    active: true,
    createdAt: '2026-02-15T09:15:00Z',
    updatedAt: '2026-10-19T11:00:00Z'
  },
  {
    id: 5,
    title: 'Operating System Concepts (10th Edition)',
    author: 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne',
    categoryId: 1,
    categoryName: 'Computer Science',
    description: 'Foundational text exploring OS kernels, thread management, memory virtualization, synchronization primitives, file systems, and storage.',
    publisher: 'Wiley',
    isbn: '978-1119800361',
    price: 720.00,
    stock: 3,
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
    featured: false,
    active: true,
    createdAt: '2026-03-01T14:00:00Z',
    updatedAt: '2026-10-14T16:00:00Z'
  },
  {
    id: 6,
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides (GoF)',
    categoryId: 2,
    categoryName: 'Software Engineering',
    description: 'The landmark book detailing 23 fundamental creational, structural, and behavioral design patterns in object-oriented programming.',
    publisher: 'Addison-Wesley Professional',
    isbn: '978-0201633610',
    price: 590.00,
    stock: 8,
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    featured: true,
    active: true,
    createdAt: '2026-03-10T10:30:00Z',
    updatedAt: '2026-10-17T15:45:00Z'
  },
  {
    id: 7,
    title: 'Computer Networks: A Systems Approach',
    author: 'Larry L. Peterson, Bruce S. Davie',
    categoryId: 1,
    categoryName: 'Computer Science',
    description: 'A systems-oriented exploration of network protocols, packet switching, routing algorithms, transport protocols, congestion control, and application layers.',
    publisher: 'Morgan Kaufmann',
    isbn: '978-0123850591',
    price: 640.00,
    stock: 7,
    coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80',
    featured: false,
    active: true,
    createdAt: '2026-03-20T11:45:00Z',
    updatedAt: '2026-10-11T13:10:00Z'
  },
  {
    id: 8,
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    categoryId: 3,
    categoryName: 'Web & Cloud Development',
    description: 'The definitive guide to distributed systems architecture, replication, partitioning, transactions, consensus, and stream processing.',
    publisher: "O'Reilly Media",
    isbn: '978-1449373320',
    price: 890.00,
    stock: 9,
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    featured: true,
    active: true,
    createdAt: '2026-04-05T09:00:00Z',
    updatedAt: '2026-10-20T17:00:00Z'
  },
  {
    id: 9,
    title: 'Pragmatic Unit Testing in Java with JUnit',
    author: 'Jeff Langr, Andy Hunt, Dave Thomas',
    categoryId: 2,
    categoryName: 'Software Engineering',
    description: 'Practical techniques for writing resilient, maintainable unit tests, mocking dependencies, test-driven development (TDD), and avoiding test smells.',
    publisher: 'Pragmatic Bookshelf',
    isbn: '978-1937785581',
    price: 430.00,
    stock: 11,
    coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80',
    featured: false,
    active: true,
    createdAt: '2026-04-18T13:20:00Z',
    updatedAt: '2026-10-16T10:15:00Z'
  },
  {
    id: 10,
    title: 'Cryptography and Network Security: Principles and Practice',
    author: 'William Stallings',
    categoryId: 5,
    categoryName: 'Cybersecurity',
    description: 'Rigorous exploration of symmetric and asymmetric ciphers, RSA, AES, SHA algorithms, PKI infrastructure, SSL/TLS, and authentication protocols.',
    publisher: 'Pearson',
    isbn: '978-0134444284',
    price: 760.00,
    stock: 5,
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    featured: false,
    active: true,
    createdAt: '2026-05-02T15:30:00Z',
    updatedAt: '2026-10-13T12:00:00Z'
  },
  {
    id: 11,
    title: 'Cloud Native Java: Designing Resilient Systems with Spring Boot & Docker',
    author: 'Josh Long, Kenny Bastani',
    categoryId: 3,
    categoryName: 'Web & Cloud Development',
    description: 'Guide to building high-throughput microservices, 12-factor apps, distributed tracing, and containerized Java deployments.',
    publisher: "O'Reilly Media",
    isbn: '978-1449374648',
    price: 610.00,
    stock: 2,
    coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80',
    featured: false,
    active: true,
    createdAt: '2026-05-15T10:00:00Z',
    updatedAt: '2026-10-18T18:40:00Z'
  },
  {
    id: 12,
    title: 'Discrete Mathematics and Its Applications (8th Edition)',
    author: 'Kenneth H. Rosen',
    categoryId: 4,
    categoryName: 'Mathematics & Data Science',
    description: 'Essential mathematical foundation for computer science: propositional logic, set theory, combinatorics, recurrence relations, graph theory, and automata.',
    publisher: 'McGraw-Hill Education',
    isbn: '978-1259676512',
    price: 790.00,
    stock: 8,
    coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    featured: false,
    active: true,
    createdAt: '2026-06-01T12:00:00Z',
    updatedAt: '2026-10-19T08:15:00Z'
  }
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 1,
    fullName: 'Alliance Bookstore Administrator',
    email: 'admin@alliance.edu',
    phone: '9845001122',
    address: 'Alliance University Campus, Chikkahagade Cross, Chandapura - Anekal Main Road, Anekal, Bengaluru, Karnataka 562106',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 2,
    fullName: 'Rahul Sharma (Student)',
    email: 'rahul.sharma@student.alliance.edu',
    phone: '9876543210',
    address: 'Room 304, Boys Hostel Block B, Alliance University Campus, Bengaluru 562106',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    createdAt: '2026-02-10T14:30:00Z'
  },
  {
    id: 3,
    fullName: 'Pooja Iyer (Customer)',
    email: 'pooja.iyer@gmail.com',
    phone: '9123456789',
    address: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    createdAt: '2026-03-05T09:15:00Z'
  }
];

export const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: 101,
    orderReference: 'ORD-2026-00101',
    customerId: 2,
    customerName: 'Rahul Sharma (Student)',
    customerEmail: 'rahul.sharma@student.alliance.edu',
    deliveryAddress: 'Room 304, Boys Hostel Block B, Alliance University Campus, Bengaluru 562106',
    orderDate: '2026-10-18T11:20:00Z',
    subtotal: 1049.00,
    deliveryCharge: 0,
    tax: 52.45,
    totalAmount: 1101.45,
    paymentMethod: 'Cash on Delivery (COD)',
    orderStatus: 'DELIVERED',
    items: [
      {
        id: 1,
        orderId: 101,
        bookId: 1,
        bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=600&q=80',
        unitPrice: 499.00,
        quantity: 1,
        subtotal: 499.00
      },
      {
        id: 2,
        orderId: 101,
        bookId: 3,
        bookTitle: 'Head First Java: A Brain-Friendly Guide (3rd Edition)',
        author: 'Kathy Sierra, Bert Bates, Trisha Gee',
        coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
        unitPrice: 550.00,
        quantity: 1,
        subtotal: 550.00
      }
    ]
  },
  {
    id: 102,
    orderReference: 'ORD-2026-00102',
    customerId: 3,
    customerName: 'Pooja Iyer (Customer)',
    customerEmail: 'pooja.iyer@gmail.com',
    deliveryAddress: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103',
    orderDate: '2026-10-19T14:40:00Z',
    subtotal: 850.00,
    deliveryCharge: 0,
    tax: 42.50,
    totalAmount: 892.50,
    paymentMethod: 'Simulated University Card Payment',
    orderStatus: 'SHIPPED',
    items: [
      {
        id: 3,
        orderId: 102,
        bookId: 2,
        bookTitle: 'Introduction to Algorithms (CLRS)',
        author: 'Thomas H. Cormen et al.',
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        unitPrice: 850.00,
        quantity: 1,
        subtotal: 850.00
      }
    ]
  },
  {
    id: 103,
    orderReference: 'ORD-2026-00103',
    customerId: 2,
    customerName: 'Rahul Sharma (Student)',
    customerEmail: 'rahul.sharma@student.alliance.edu',
    deliveryAddress: 'Room 304, Boys Hostel Block B, Alliance University Campus, Bengaluru 562106',
    orderDate: '2026-10-20T16:15:00Z',
    subtotal: 430.00,
    deliveryCharge: 40.00,
    tax: 21.50,
    totalAmount: 491.50,
    paymentMethod: 'Cash on Delivery (COD)',
    orderStatus: 'PLACED',
    items: [
      {
        id: 4,
        orderId: 103,
        bookId: 9,
        bookTitle: 'Pragmatic Unit Testing in Java with JUnit',
        author: 'Jeff Langr et al.',
        coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80',
        unitPrice: 430.00,
        quantity: 1,
        subtotal: 430.00
      }
    ]
  }
];

export const INITIAL_INVENTORY_LOGS: InventoryMovementRecord[] = [
  {
    id: 1,
    bookId: 1,
    bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    changeQuantity: -1,
    previousStock: 13,
    newStock: 12,
    reason: 'PURCHASE',
    reference: 'ORD-2026-00101',
    timestamp: '2026-10-18T11:20:00Z',
    adminName: 'System (Checkout)'
  },
  {
    id: 2,
    bookId: 3,
    bookTitle: 'Head First Java: A Brain-Friendly Guide (3rd Edition)',
    changeQuantity: -1,
    previousStock: 16,
    newStock: 15,
    reason: 'PURCHASE',
    reference: 'ORD-2026-00101',
    timestamp: '2026-10-18T11:20:00Z',
    adminName: 'System (Checkout)'
  },
  {
    id: 3,
    bookId: 2,
    bookTitle: 'Introduction to Algorithms (CLRS)',
    changeQuantity: -1,
    previousStock: 7,
    newStock: 6,
    reason: 'PURCHASE',
    reference: 'ORD-2026-00102',
    timestamp: '2026-10-19T14:40:00Z',
    adminName: 'System (Checkout)'
  },
  {
    id: 4,
    bookId: 4,
    bookTitle: 'Database System Concepts (7th Edition)',
    changeQuantity: 5,
    previousStock: -1,
    newStock: 4,
    reason: 'MANUAL_RESTOCK',
    reference: 'RESTOCK-PO-8821',
    timestamp: '2026-10-19T10:00:00Z',
    adminName: 'Alliance Bookstore Administrator'
  }
];
