import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z
        .union([z.string(), z.null()])
        .optional()
        .transform((v) => {
            if (v == null) return undefined;
            const t = v.trim();
            return t === "" ? undefined : t;
        }),
});

export const orderItemSchema = z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive(),
});

export const createOrderSchema = z.object({
    items: z.array(orderItemSchema).min(1),
    customerInfo: z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
    }),
    shippingAddress: z.string().min(10),
    notes: z.string().optional(),
});

export const contactWhatsAppSchema = z.object({
    name: z.string().min(1).max(200),
    email: z.string().email(),
    phone: z.string().max(40).optional(),
    subject: z.string().min(1).max(300),
    message: z.string().min(1).max(1500),
    inquiryType: z.enum(["general", "complaint", "question"]).optional(),
});

export const productSchema = z.object({
    name: z.string().min(2),
    description: z.string(),
    price: z.number().positive().or(z.string().regex(/^\d+(\.\d{1,2})?$/)),
    category: z.string(),
    image: z.string().url(),
    stock: z.number().int().nonnegative(),
    featured: z.boolean().optional(),
    discount: z.number().int().min(0).max(100).nullable().optional(),
});
