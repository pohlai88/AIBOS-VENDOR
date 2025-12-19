export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          type: "company" | "vendor";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: "company" | "vendor";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: "company" | "vendor";
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          role: "vendor" | "company_admin" | "company_user";
          organization_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role: "vendor" | "company_admin" | "company_user";
          organization_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: "vendor" | "company_admin" | "company_user";
          organization_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      vendor_relationships: {
        Row: {
          id: string;
          vendor_id: string;
          company_id: string;
          status: "active" | "inactive" | "pending";
          permissions: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vendor_id: string;
          company_id: string;
          status?: "active" | "inactive" | "pending";
          permissions?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vendor_id?: string;
          company_id?: string;
          status?: "active" | "inactive" | "pending";
          permissions?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          name: string;
          type: string;
          category: "invoice" | "contract" | "statement" | "other";
          file_url: string;
          file_size: number;
          mime_type: string;
          organization_id: string;
          vendor_id: string | null;
          is_shared: boolean;
          version: number;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          category?: "invoice" | "contract" | "statement" | "other";
          file_url: string;
          file_size: number;
          mime_type: string;
          organization_id: string;
          vendor_id?: string | null;
          is_shared?: boolean;
          version?: number;
          created_at?: string;
          updated_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          category?: "invoice" | "contract" | "statement" | "other";
          file_url?: string;
          file_size?: number;
          mime_type?: string;
          organization_id?: string;
          vendor_id?: string | null;
          is_shared?: boolean;
          version?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
      };
      statements: {
        Row: {
          id: string;
          organization_id: string;
          vendor_id: string | null;
          period_start: string;
          period_end: string;
          balance: number;
          currency: string;
          is_shared: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          vendor_id?: string | null;
          period_start: string;
          period_end: string;
          balance: number;
          currency?: string;
          is_shared?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          vendor_id?: string | null;
          period_start?: string;
          period_end?: string;
          balance?: number;
          currency?: string;
          is_shared?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          statement_id: string;
          type: "debit" | "credit";
          amount: number;
          description: string;
          date: string;
          reference: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          statement_id: string;
          type: "debit" | "credit";
          amount: number;
          description: string;
          date: string;
          reference?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          statement_id?: string;
          type?: "debit" | "credit";
          amount?: number;
          description?: string;
          date?: string;
          reference?: string | null;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          organization_id: string;
          vendor_id: string;
          invoice_id: string | null;
          amount: number;
          currency: string;
          status: "pending" | "completed" | "failed";
          method: string;
          transaction_id: string | null;
          paid_at: string | null;
          due_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          vendor_id: string;
          invoice_id?: string | null;
          amount: number;
          currency?: string;
          status?: "pending" | "completed" | "failed";
          method: string;
          transaction_id?: string | null;
          paid_at?: string | null;
          due_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          vendor_id?: string;
          invoice_id?: string | null;
          amount?: number;
          currency?: string;
          status?: "pending" | "completed" | "failed";
          method?: string;
          transaction_id?: string | null;
          paid_at?: string | null;
          due_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      message_threads: {
        Row: {
          id: string;
          organization_id: string;
          vendor_id: string;
          subject: string | null;
          last_message_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          vendor_id: string;
          subject?: string | null;
          last_message_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          vendor_id?: string;
          subject?: string | null;
          last_message_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          thread_id: string;
          sender_id: string;
          sender_organization_id: string;
          recipient_id: string | null;
          recipient_organization_id: string;
          content: string;
          read_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          sender_id: string;
          sender_organization_id: string;
          recipient_id?: string | null;
          recipient_organization_id: string;
          content: string;
          read_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          thread_id?: string;
          sender_id?: string;
          sender_organization_id?: string;
          recipient_id?: string | null;
          recipient_organization_id?: string;
          content?: string;
          read_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      message_attachments: {
        Row: {
          id: string;
          message_id: string;
          file_name: string;
          file_url: string;
          file_size: number;
          mime_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          file_name: string;
          file_url: string;
          file_size: number;
          mime_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          file_name?: string;
          file_url?: string;
          file_size?: number;
          mime_type?: string;
          created_at?: string;
        };
      };
      document_access_logs: {
        Row: {
          id: string;
          document_id: string;
          user_id: string;
          action: "view" | "download" | "upload" | "delete";
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          user_id: string;
          action: "view" | "download" | "upload" | "delete";
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          user_id?: string;
          action?: "view" | "download" | "upload" | "delete";
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
  };
};

