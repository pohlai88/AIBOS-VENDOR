import { z } from "zod";
import { AppError } from "./errors";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  organizationName: z.string().min(1, "Organization name is required"),
  role: z.enum(["vendor", "company"]).optional(),
});

export const documentUploadSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  category: z.enum(["invoice", "contract", "statement", "other"]).optional(),
  vendorId: z.string().uuid().optional().nullable(),
  isShared: z.boolean().optional(),
});

export const statementCreateSchema = z.object({
  vendorId: z.string().uuid().optional().nullable(),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  balance: z.number().optional(),
  currency: z.string().length(3).optional(),
  isShared: z.boolean().optional(),
  transactions: z
    .array(
      z.object({
        type: z.enum(["debit", "credit"]),
        amount: z.number(),
        description: z.string(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        reference: z.string().optional().nullable(),
      })
    )
    .optional(),
});

export const paymentCreateSchema = z.object({
  vendorId: z.string().uuid("Invalid vendor ID"),
  invoiceId: z.string().uuid().optional().nullable(),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().length(3).optional(),
  status: z.enum(["pending", "completed", "failed"]).optional(),
  method: z.string().min(1, "Payment method is required"),
  transactionId: z.string().optional().nullable(),
  paidAt: z.string().optional().nullable(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

export const messageCreateSchema = z.object({
  threadId: z.string().uuid("Invalid thread ID"),
  content: z.string().min(1, "Message content is required"),
  recipientOrganizationId: z.string().uuid().optional(),
});

export const threadCreateSchema = z.object({
  vendorId: z.string().uuid("Invalid vendor ID"),
  subject: z.string().optional().nullable(),
});

export const profileUpdateSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
  })
  .strict();

export async function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<T> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new AppError(
        firstError?.message || "Validation failed",
        400,
        "VALIDATION_ERROR"
      );
    }
    throw error;
  }
}

