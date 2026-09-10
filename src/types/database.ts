export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type EventStatus =
  | "DRAFT"
  | "ON_SALE"
  | "SOLD_OUT"
  | "COMPLETED"
  | "CANCELLED";

export type TicketTypeStatus = "DRAFT" | "AVAILABLE" | "PAUSED" | "SOLD_OUT";
export type OrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "REFUNDED";
export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED";
export type TicketStatus = "VALID" | "USED" | "REVOKED" | "REFUNDED";
export type StaffRole = "SUPER_ADMIN" | "ADMIN" | "BOX_OFFICE" | "SCANNER";
export type StaffStatus = "ACTIVE" | "DISABLED";
export type ScanResult =
  | "ADMITTED"
  | "DUPLICATE"
  | "INVALID"
  | "REVOKED"
  | "REFUNDED"
  | "WRONG_EVENT";

type TableDefinition<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type EventRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  doors_open_at: string | null;
  starts_at: string;
  ends_at: string | null;
  timezone: string;
  venue_name: string;
  venue_address: string | null;
  hero_artwork_url: string | null;
  status: EventStatus;
  total_capacity: number;
  currency: string;
  created_at: string;
  updated_at: string;
};

type EventInsert = {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  doors_open_at?: string | null;
  starts_at: string;
  ends_at?: string | null;
  timezone?: string;
  venue_name: string;
  venue_address?: string | null;
  hero_artwork_url?: string | null;
  status?: EventStatus;
  total_capacity: number;
  currency?: string;
  created_at?: string;
  updated_at?: string;
};

type TicketTypeRow = {
  id: string;
  event_id: string;
  code: string;
  name: string;
  description: string | null;
  seating_zone: string | null;
  price_lkr: number;
  capacity: number;
  max_per_order: number;
  sale_starts_at: string | null;
  sale_ends_at: string | null;
  status: TicketTypeStatus;
  sort_order: number;
  benefits: string[];
  recommended: boolean;
  created_at: string;
  updated_at: string;
};

type TicketTypeInsert = {
  id?: string;
  event_id: string;
  code: string;
  name: string;
  description?: string | null;
  seating_zone?: string | null;
  price_lkr: number;
  capacity: number;
  max_per_order?: number;
  sale_starts_at?: string | null;
  sale_ends_at?: string | null;
  status?: TicketTypeStatus;
  sort_order?: number;
  benefits?: string[];
  recommended?: boolean;
  created_at?: string;
  updated_at?: string;
};

type CustomerRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

type CustomerInsert = {
  id?: string;
  full_name: string;
  email: string;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
};

type OrderRow = {
  id: string;
  event_id: string;
  customer_id: string;
  order_number: string;
  access_token: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal_lkr: number;
  discount_lkr: number;
  total_lkr: number;
  currency: string;
  payment_provider: string | null;
  payment_reference: string | null;
  expires_at: string | null;
  paid_at: string | null;
  notes: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
};

type OrderInsert = {
  id?: string;
  event_id: string;
  customer_id: string;
  order_number?: string;
  access_token?: string;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  subtotal_lkr?: number;
  discount_lkr?: number;
  total_lkr?: number;
  currency?: string;
  payment_provider?: string | null;
  payment_reference?: string | null;
  expires_at?: string | null;
  paid_at?: string | null;
  notes?: string | null;
  metadata?: Json;
  created_at?: string;
  updated_at?: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  ticket_type_id: string;
  quantity: number;
  unit_price_lkr: number;
  total_price_lkr: number;
  created_at: string;
};

type OrderItemInsert = {
  id?: string;
  order_id: string;
  ticket_type_id: string;
  quantity: number;
  unit_price_lkr: number;
  created_at?: string;
};

type TicketRow = {
  id: string;
  event_id: string;
  order_id: string;
  order_item_id: string;
  ticket_type_id: string;
  customer_id: string;
  ticket_number: string;
  qr_token: string;
  attendee_name: string | null;
  status: TicketStatus;
  issued_at: string;
  checked_in_at: string | null;
  checked_in_by: string | null;
  revoked_at: string | null;
  revoked_by: string | null;
  revoke_reason: string | null;
  created_at: string;
  updated_at: string;
};

type TicketInsert = {
  id?: string;
  event_id: string;
  order_id: string;
  order_item_id: string;
  ticket_type_id: string;
  customer_id: string;
  ticket_number?: string;
  qr_token?: string;
  attendee_name?: string | null;
  status?: TicketStatus;
  issued_at?: string;
  checked_in_at?: string | null;
  checked_in_by?: string | null;
  revoked_at?: string | null;
  revoked_by?: string | null;
  revoke_reason?: string | null;
  created_at?: string;
  updated_at?: string;
};

type StaffProfileRow = {
  user_id: string;
  display_name: string;
  role: StaffRole;
  status: StaffStatus;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
};

type StaffProfileInsert = {
  user_id: string;
  display_name: string;
  role?: StaffRole;
  status?: StaffStatus;
  last_active_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

type ScanLogRow = {
  id: number;
  event_id: string;
  ticket_id: string | null;
  staff_user_id: string;
  result: ScanResult;
  gate: string | null;
  ticket_number_snapshot: string | null;
  metadata: Json;
  scanned_at: string;
};

type ScanLogInsert = {
  id?: number;
  event_id: string;
  ticket_id?: string | null;
  staff_user_id: string;
  result: ScanResult;
  gate?: string | null;
  ticket_number_snapshot?: string | null;
  metadata?: Json;
  scanned_at?: string;
};

export interface Database {
  public: {
    Tables: {
      events: TableDefinition<EventRow, EventInsert>;
      ticket_types: TableDefinition<TicketTypeRow, TicketTypeInsert>;
      customers: TableDefinition<CustomerRow, CustomerInsert>;
      orders: TableDefinition<OrderRow, OrderInsert>;
      order_items: TableDefinition<OrderItemRow, OrderItemInsert>;
      tickets: TableDefinition<TicketRow, TicketInsert>;
      staff_profiles: TableDefinition<StaffProfileRow, StaffProfileInsert>;
      scan_logs: TableDefinition<ScanLogRow, ScanLogInsert>;
    };
    Views: Record<string, never>;
    Functions: {
      get_public_event_catalog: {
        Args: { p_slug?: string };
        Returns: Json;
      };
      redeem_ticket: {
        Args: {
          p_token: string;
          p_event_id: string;
          p_gate?: string | null;
          p_device?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      event_status: EventStatus;
      ticket_type_status: TicketTypeStatus;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      ticket_status: TicketStatus;
      staff_role: StaffRole;
      staff_status: StaffStatus;
      scan_result: ScanResult;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
