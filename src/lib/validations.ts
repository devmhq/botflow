import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  name: z.string().min(1, "Your name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type RegisterValues = z.infer<typeof registerSchema>;

export const createTenantSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  adminName: z.string().min(1, "Admin name is required"),
  adminEmail: z.string().min(1, "Email is required").email("Enter a valid email"),
  adminPassword: z.string().min(8, "Password must be at least 8 characters"),
  plan: z.enum(["STARTER", "GROWTH", "PRO"]),
});
export type CreateTenantValues = z.infer<typeof createTenantSchema>;

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  businessName: z.string().min(1, "Company name is required"),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const botGeneralSchema = z.object({
  name: z.string().min(1, "Bot name is required"),
  businessType: z.string().optional(),
  personality: z.string().optional(),
});

export const botWizardStep1Schema = z.object({
  name: z.string().min(1, "Bot name is required"),
  businessType: z.string().optional(),
  personality: z.string().optional(),
});

export const domainSchema = z
  .string()
  .min(1, "Domain is required")
  .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, "Enter a valid domain, e.g. example.com");

export const knowledgeSchema = z.object({
  content: z.string().min(1, "Content is required"),
});
