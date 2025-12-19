import type {
  Document,
  Payment,
  Statement,
  MessageThread,
  Message,
} from "@aibos/shared";

// API Response Types
export interface DocumentsResponse {
  documents: Document[];
}

export interface DocumentResponse {
  document: Document;
}

export interface PaymentsResponse {
  payments: Payment[];
}

export interface PaymentResponse {
  payment: Payment;
}

export interface StatementsResponse {
  statements: Statement[];
}

export interface StatementResponse {
  statement: Statement;
}

export interface MessagesResponse {
  messages?: Message[];
  threads?: MessageThread[];
}

export interface MessageResponse {
  message: Message;
}

// Discriminated Union for API Responses
export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Type guards
export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

export function isApiError<T>(
  response: ApiResponse<T>
): response is ApiErrorResponse {
  return response.success === false;
}

// Legacy types for backward compatibility
export interface LegacyApiErrorResponse {
  error: string;
  code?: string;
}

export interface LegacyApiSuccessResponse<T> {
  data?: T;
  [key: string]: unknown;
}

// CSV Export Types
export interface CSVRow {
  [key: string]: string | number | null;
}

// Supabase Cookie Options
export interface CookieOptions {
  name: string;
  value: string;
  options?: {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: "strict" | "lax" | "none";
    secure?: boolean;
  };
}

// Dashboard Stats Response
export interface DashboardStatsResponse {
  documents?: {
    count: number;
  };
  payments?: {
    count: number;
    total: number;
  };
  statements?: {
    count: number;
  };
  messages?: {
    unread: number;
  };
}
