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
export type PaymentMethod = "CARD" | "ON_ARRIVAL" | "BANK_SLIP";
export type PaymentSubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";
export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED";
export type TicketStatus = "VALID" | "USED" | "REVOKED" | "REFUNDED";
export type StaffRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "BOX_OFFICE"
  | "SCANNER"
  | "SELLER";
export type StaffStatus = "ACTIVE" | "DISABLED";
export type SeatTicketInventoryStatus =
  | "AVAILABLE"
  | "HELD_ONLINE"
  | "SOLD_ONLINE"
  | "SOLD_PHYSICAL"
  | "SOLD_INTERNAL";
export type ScanResult =
  | "ADMITTED"
  | "EXITED"
  | "PAYMENT_DUE"
  | "DUPLICATE"
  | "INVALID"
  | "REVOKED"
  | "REFUNDED"
  | "WRONG_EVENT"
  | "NOT_YET_VALID"
  | "EXPIRED";

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
  school_show_starts_at: string | null;
  school_show_ends_at: string | null;
  admission_time_enforced: boolean;
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
  school_show_starts_at?: string | null;
  school_show_ends_at?: string | null;
  admission_time_enforced?: boolean;
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
  auth_user_id: string | null;
  account_created_at: string;
  account_activated_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

type CustomerInsert = {
  id?: string;
  full_name: string;
  email: string;
  phone?: string | null;
  auth_user_id?: string | null;
  account_created_at?: string;
  account_activated_at?: string | null;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

type OrderRow = {
  id: string;
  event_id: string;
  customer_id: string;
  order_number: string;
  checkout_request_id: string | null;
  access_token: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal_lkr: number;
  discount_lkr: number;
  total_lkr: number;
  currency: string;
  payment_method: PaymentMethod | null;
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
  checkout_request_id?: string | null;
  access_token?: string;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  subtotal_lkr?: number;
  discount_lkr?: number;
  total_lkr?: number;
  currency?: string;
  payment_method?: PaymentMethod | null;
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
  seat_id: string | null;
  seat_label: string | null;
  attendee_name: string | null;
  status: TicketStatus;
  issued_at: string;
  checked_in_at: string | null;
  checked_in_by: string | null;
  is_inside: boolean;
  last_exited_at: string | null;
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
  seat_id?: string | null;
  seat_label?: string | null;
  attendee_name?: string | null;
  status?: TicketStatus;
  issued_at?: string;
  checked_in_at?: string | null;
  checked_in_by?: string | null;
  is_inside?: boolean;
  last_exited_at?: string | null;
  revoked_at?: string | null;
  revoked_by?: string | null;
  revoke_reason?: string | null;
  created_at?: string;
  updated_at?: string;
};

type PaymentSubmissionRow = {
  id: string; order_id: string; storage_path: string; original_filename: string; mime_type: string; file_size: number;
  status: PaymentSubmissionStatus; submitted_at: string; reviewed_at: string | null; reviewed_by: string | null; rejection_reason: string | null;
};
type PaymentSubmissionInsert = {
  id?: string; order_id: string; storage_path: string; original_filename: string; mime_type: string; file_size: number;
  status?: PaymentSubmissionStatus; submitted_at?: string; reviewed_at?: string | null; reviewed_by?: string | null; rejection_reason?: string | null;
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

type SeatBlockRow = {
  id: string;
  event_id: string;
  ticket_type_id: string | null;
  code: string;
  level: string;
  display_name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type SeatBlockInsert = {
  id?: string;
  event_id: string;
  ticket_type_id?: string | null;
  code: string;
  level: string;
  display_name: string;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};

type EventSeatRow = {
  id: string;
  event_id: string;
  block_id: string;
  row_number: number;
  seat_number: number;
  label: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type EventSeatInsert = {
  id?: string;
  event_id: string;
  block_id: string;
  row_number: number;
  seat_number: number;
  label: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

type OrderSeatRow = {
  id: string;
  order_id: string;
  order_item_id: string;
  seat_id: string;
  ticket_id: string | null;
  status: "HOLD" | "CONFIRMED" | "RELEASED";
  held_until: string | null;
  created_at: string;
  updated_at: string;
};

type OrderSeatInsert = {
  id?: string;
  order_id: string;
  order_item_id: string;
  seat_id: string;
  ticket_id?: string | null;
  status?: "HOLD" | "CONFIRMED" | "RELEASED";
  held_until?: string | null;
  created_at?: string;
  updated_at?: string;
};

type SeatTicketInventoryRow = {
  id: string;
  event_id: string;
  ticket_type_id: string;
  seat_id: string;
  serial_number: number;
  serial_code: string;
  base_ticket_number: string;
  ticket_number: string;
  revision: number;
  qr_token: string;
  status: SeatTicketInventoryStatus;
  order_id: string | null;
  issued_ticket_id: string | null;
  claimed_by: string | null;
  claimed_at: string | null;
  created_at: string;
  updated_at: string;
};

type SeatTicketInventoryInsert = {
  id?: string;
  event_id: string;
  ticket_type_id: string;
  seat_id: string;
  serial_number: number;
  serial_code: string;
  base_ticket_number: string;
  ticket_number: string;
  revision?: number;
  qr_token?: string;
  status?: SeatTicketInventoryStatus;
  order_id?: string | null;
  issued_ticket_id?: string | null;
  claimed_by?: string | null;
  claimed_at?: string | null;
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
      payment_submissions: TableDefinition<PaymentSubmissionRow, PaymentSubmissionInsert>;
      staff_profiles: TableDefinition<StaffProfileRow, StaffProfileInsert>;
      seat_blocks: TableDefinition<SeatBlockRow, SeatBlockInsert>;
      event_seats: TableDefinition<EventSeatRow, EventSeatInsert>;
      order_seats: TableDefinition<OrderSeatRow, OrderSeatInsert>;
      seat_ticket_inventory: TableDefinition<
        SeatTicketInventoryRow,
        SeatTicketInventoryInsert
      >;
      scan_logs: TableDefinition<ScanLogRow, ScanLogInsert>;
    };
    Views: Record<string, never>;
    Functions: {
      get_public_event_catalog: {
        Args: { p_slug?: string };
        Returns: Json;
      };
      create_checkout_reservation: {
        Args: {
          p_event_id: string;
          p_ticket_type_id: string;
          p_quantity: number;
          p_full_name: string;
          p_email: string;
          p_phone: string;
          p_notes?: string | null;
          p_request_id?: string;
        };
        Returns: Json;
      };
      claim_customer_account: {
        Args: Record<string, never>;
        Returns: string;
      };
      select_payment_method: { Args: { p_order_number: string; p_access_token: string; p_method: string }; Returns: Json; };
      confirm_on_arrival: { Args: { p_order_number: string; p_access_token: string }; Returns: Json; };
      submit_bank_slip_metadata: { Args: { p_order_number: string; p_access_token: string; p_storage_path: string; p_original_filename: string; p_mime_type: string; p_file_size: number }; Returns: Json; };
      review_bank_slip: { Args: { p_submission_id: string; p_approve: boolean; p_reason?: string | null }; Returns: Json; };
      issue_order_tickets: { Args: { p_order_id: string }; Returns: number; };
      record_physical_ticket_sale: {
        Args: {
          p_event_id: string;
          p_ticket_type_id: string;
          p_quantity: number;
          p_sold_by: string;
        };
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
