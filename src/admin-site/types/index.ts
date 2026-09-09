export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'BOX_OFFICE' | 'SCANNER';
export type EventStatus = 'DRAFT' | 'ON_SALE' | 'SOLD_OUT' | 'COMPLETED' | 'CANCELLED';
export type TicketCategoryStatus = 'DRAFT' | 'AVAILABLE' | 'PAUSED' | 'SOLD_OUT';
export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
export type TicketStatus = 'VALID' | 'USED' | 'REVOKED' | 'REFUNDED';
export type ScanResultType = 'ADMITTED' | 'DUPLICATE' | 'INVALID' | 'REVOKED' | 'REFUNDED';
export type StaffStatus = 'ACTIVE' | 'DISABLED';

export interface Event {
  id: string;
  name: string;
  slug: string;
  description: string;
  date: string;
  doorsOpenTime: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  heroArtwork: string;
  status: EventStatus;
  totalCapacity: number;
  ticketsSold: number;
  remaining: number;
}

export interface TicketCategory {
  id: string;
  eventId: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  quantitySold: number;
  quantityRemaining: number;
  saleStart: string;
  saleEnd: string;
  status: TicketCategoryStatus;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpend: number;
  ticketsPurchased: number;
  lastPurchaseDate: string;
  orders: string[]; // Order IDs
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  ticketQuantity: number;
  ticketTypes: string[];
  total: number;
  paymentStatus: OrderStatus;
  orderStatus: OrderStatus;
  createdDate: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  orderId: string;
  customerId: string;
  customerName: string;
  ticketCategoryId: string;
  ticketCategoryName: string;
  eventId: string;
  status: TicketStatus;
  issuedAt: string;
  checkedInAt: string | null;
  paymentState: OrderStatus;
}

export interface ScanLog {
  id: string;
  timestamp: string;
  ticketNumber: string;
  customerName: string;
  ticketCategoryName: string;
  result: ScanResultType;
  staffId: string;
  staffName: string;
  gate: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: StaffStatus;
  lastActive: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}
