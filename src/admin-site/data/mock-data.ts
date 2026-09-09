import {
  Event,
  TicketCategory,
  Customer,
  Order,
  Ticket,
  ScanLog,
  StaffMember,
  AppUser
} from '../types';

export const currentUser: AppUser = {
  id: 'u-1',
  name: 'Admin User',
  email: 'admin@swararanjana.com',
  role: 'SUPER_ADMIN',
};

export const mockEvents: Event[] = [
  {
    id: 'e-1',
    name: 'Swara Ranjana 2026',
    slug: 'swara-ranjana-2026',
    description: 'The premier indoor musical concert of the year featuring top artists.',
    date: '2026-08-28',
    doorsOpenTime: '17:00',
    startTime: '18:30',
    endTime: '23:00',
    venue: 'Lotus Arena',
    address: '100 Concert Way, Metro City',
    heroArtwork: '/placeholder-artwork.jpg',
    status: 'ON_SALE',
    totalCapacity: 5000,
    ticketsSold: 3450,
    remaining: 1550,
  }
];

export const mockTicketCategories: TicketCategory[] = [
  {
    id: 'tc-1',
    eventId: 'e-1',
    name: 'VIP',
    description: 'Front row seating with exclusive lounge access.',
    price: 150.00,
    capacity: 500,
    quantitySold: 450,
    quantityRemaining: 50,
    saleStart: '2026-01-01T00:00:00Z',
    saleEnd: '2026-08-28T18:00:00Z',
    status: 'AVAILABLE',
  },
  {
    id: 'tc-2',
    eventId: 'e-1',
    name: 'PREMIUM',
    description: 'Excellent views in the middle section.',
    price: 100.00,
    capacity: 1500,
    quantitySold: 1200,
    quantityRemaining: 300,
    saleStart: '2026-01-01T00:00:00Z',
    saleEnd: '2026-08-28T18:00:00Z',
    status: 'AVAILABLE',
  },
  {
    id: 'tc-3',
    eventId: 'e-1',
    name: 'GENERAL',
    description: 'Standard admission seating.',
    price: 50.00,
    capacity: 3000,
    quantitySold: 1800,
    quantityRemaining: 1200,
    saleStart: '2026-01-01T00:00:00Z',
    saleEnd: '2026-08-28T18:00:00Z',
    status: 'AVAILABLE',
  }
];

export const mockCustomers: Customer[] = [
  {
    id: 'c-1',
    name: 'Ramika Perera',
    email: 'ramikaperera4@gmail.com',
    phone: '+94 77 123 4567',
    totalSpend: 250.00,
    ticketsPurchased: 2,
    lastPurchaseDate: '2026-05-12T10:30:00Z',
    orders: ['o-1'],
  },
  {
    id: 'c-2',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '+1 555 123 4567',
    totalSpend: 150.00,
    ticketsPurchased: 1,
    lastPurchaseDate: '2026-06-01T14:20:00Z',
    orders: ['o-2'],
  }
];

export const mockOrders: Order[] = [
  {
    id: 'o-1',
    orderNumber: 'SR26-00184',
    customerId: 'c-1',
    customerName: 'Ramika Perera',
    customerEmail: 'ramikaperera4@gmail.com',
    customerPhone: '+94 77 123 4567',
    ticketQuantity: 2,
    ticketTypes: ['PREMIUM', 'VIP'],
    total: 250.00,
    paymentStatus: 'PAID',
    orderStatus: 'PAID',
    createdDate: '2026-05-12T10:30:00Z',
  },
  {
    id: 'o-2',
    orderNumber: 'SR26-00185',
    customerId: 'c-2',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@example.com',
    customerPhone: '+1 555 123 4567',
    ticketQuantity: 1,
    ticketTypes: ['VIP'],
    total: 150.00,
    paymentStatus: 'PAID',
    orderStatus: 'PAID',
    createdDate: '2026-06-01T14:20:00Z',
  }
];

export const mockTickets: Ticket[] = [
  {
    id: 't-1',
    ticketNumber: 'SR26-00184-01',
    orderId: 'o-1',
    customerId: 'c-1',
    customerName: 'Ramika Perera',
    ticketCategoryId: 'tc-2',
    ticketCategoryName: 'PREMIUM',
    eventId: 'e-1',
    status: 'VALID',
    issuedAt: '2026-05-12T10:30:05Z',
    checkedInAt: null,
    paymentState: 'PAID',
  },
  {
    id: 't-2',
    ticketNumber: 'SR26-00184-02',
    orderId: 'o-1',
    customerId: 'c-1',
    customerName: 'Ramika Perera',
    ticketCategoryId: 'tc-1',
    ticketCategoryName: 'VIP',
    eventId: 'e-1',
    status: 'USED',
    issuedAt: '2026-05-12T10:30:05Z',
    checkedInAt: '2026-08-28T17:45:00Z',
    paymentState: 'PAID',
  },
  {
    id: 't-3',
    ticketNumber: 'SR26-00185-01',
    orderId: 'o-2',
    customerId: 'c-2',
    customerName: 'Sarah Jenkins',
    ticketCategoryId: 'tc-1',
    ticketCategoryName: 'VIP',
    eventId: 'e-1',
    status: 'VALID',
    issuedAt: '2026-06-01T14:20:05Z',
    checkedInAt: null,
    paymentState: 'PAID',
  }
];

export const mockScanLogs: ScanLog[] = [
  {
    id: 'sl-1',
    timestamp: '2026-08-28T17:45:00Z',
    ticketNumber: 'SR26-00184-02',
    customerName: 'Ramika Perera',
    ticketCategoryName: 'VIP',
    result: 'ADMITTED',
    staffId: 's-2',
    staffName: 'Gate Staff 02',
    gate: 'Gate A',
  },
  {
    id: 'sl-2',
    timestamp: '2026-08-28T18:10:00Z',
    ticketNumber: 'SR26-00184-02',
    customerName: 'Ramika Perera',
    ticketCategoryName: 'VIP',
    result: 'DUPLICATE',
    staffId: 's-3',
    staffName: 'Gate Staff 03',
    gate: 'Gate B',
  }
];

export const mockStaff: StaffMember[] = [
  {
    id: 's-1',
    name: 'Admin User',
    email: 'admin@swararanjana.com',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    lastActive: '2026-08-28T10:50:00Z',
  },
  {
    id: 's-2',
    name: 'Gate Staff 02',
    email: 'staff02@swararanjana.com',
    role: 'SCANNER',
    status: 'ACTIVE',
    lastActive: '2026-08-28T17:40:00Z',
  },
  {
    id: 's-3',
    name: 'Gate Staff 03',
    email: 'staff03@swararanjana.com',
    role: 'SCANNER',
    status: 'ACTIVE',
    lastActive: '2026-08-28T18:05:00Z',
  }
];
