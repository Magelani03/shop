import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().optional(),
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
