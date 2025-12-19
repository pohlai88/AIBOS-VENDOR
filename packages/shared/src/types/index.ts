export type UserRole = "vendor" | "company_admin" | "company_user";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  type: "company" | "vendor";
  createdAt: string;
  updatedAt: string;
}

export interface VendorRelationship {
  id: string;
  vendorId: string;
  companyId: string;
  status: "active" | "inactive" | "pending";
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  category: "invoice" | "contract" | "statement" | "other";
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  organizationId: string;
  vendorId: string | null;
  isShared: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Statement {
  id: string;
  organizationId: string;
  vendorId: string | null;
  periodStart: string;
  periodEnd: string;
  balance: number;
  currency: string;
  transactions: Transaction[];
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  statementId: string;
  type: "debit" | "credit";
  amount: number;
  description: string;
  date: string;
  reference: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  organizationId: string;
  vendorId: string;
  invoiceId: string | null;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  method: string;
  transactionId: string | null;
  paidAt: string | null;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderOrganizationId: string;
  recipientId: string | null;
  recipientOrganizationId: string;
  content: string;
  attachments: MessageAttachment[];
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface MessageThread {
  id: string;
  organizationId: string;
  vendorId: string;
  subject: string | null;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentAccessLog {
  id: string;
  documentId: string;
  userId: string;
  action: "view" | "download" | "upload" | "delete";
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

