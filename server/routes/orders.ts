import { Hono } from "hono";
import { OrderStatus } from "@prisma/client";
import { authenticateToken } from "../middleware/auth";
import { createOrderSchema } from "../schemas";
import { PrismaClient } from "@prisma/client";

type Bindings = {
    DB: D1Database;
};

type Variables = {
    prisma: PrismaClient;
    user: any;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Apply authentication middleware
app.use("*", authenticateToken);

app.post("/", async (c) => {
    try {
        const body = await c.req.json();
        const validatedData = createOrderSchema.parse(body);
        const { items, customerInfo, shippingAddress, notes } = validatedData;
        const prisma = c.get('prisma');
        const user = c.get('user');

        // Calculate totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
            });

            if (!product || !product.active) {
                return c.json({ error: `Product ${item.productId} not found or inactive` }, 400);
            }

            if (product.stock < item.quantity) {
                return c.json({ error: `Insufficient stock for ${product.name}` }, 400);
            }

            const itemTotal = Number(product.price) * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
            });
        }

        // Get settings for shipping and tax
        const settings = await prisma.settings.findMany();
        const settingsMap = settings.reduce((acc: any, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});

        const shippingThreshold = parseFloat(
            settingsMap.free_shipping_threshold || "50",
        );
        const shippingCost =
            subtotal >= shippingThreshold
                ? 0
                : parseFloat(settingsMap.shipping_cost || "5.99");
        const taxRate = parseFloat(settingsMap.tax_rate || "0.08");
        const tax = subtotal * taxRate;
        const total = subtotal + shippingCost + tax;

        const order = await prisma.order.create({
            data: {
                userId: user.id,
                status: OrderStatus.PENDING,
                total,
                subtotal,
                tax,
                shipping: shippingCost,
                customerName: customerInfo.name || user.name,
                customerEmail: customerInfo.email || user.email,
                customerPhone: customerInfo.phone || user.phone,
                shippingAddress: shippingAddress,
                notes,
                orderItems: {
                    create: orderItems,
                },
            },
            include: {
                orderItems: {
                    include: { product: true },
                },
            },
        });

        // Update product stock
        for (const item of items) {
            await prisma.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
            });
        }

        return c.json(order);
    } catch (error) {
        console.error("Error creating order:", error);
        return c.json({ error: "Failed to create order" }, 500);
    }
});

app.get("/:id/whatsapp", async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = parseInt(c.req.param("id"));
        const user = c.get('user');

        const order = await prisma.order.findUnique({
            where: { id, userId: user.id },
            include: { orderItems: { include: { product: true } } },
        });

        if (!order) {
            return c.json({ error: "Order not found" }, 404);
        }

        const settings = await prisma.settings.findMany();
        const settingsMap = settings.reduce((acc: any, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});

        const whatsappNumber = settingsMap.admin_whatsapp;

        if (!whatsappNumber) {
            return c.json({ error: "WhatsApp number not configured" }, 400);
        }

        // Create WhatsApp message
        const itemsList = order.orderItems
            .map(
                (item) =>
                    `• ${item.product.name} (Qty: ${item.quantity}) - N$${item.price}`,
            )
            .join("\n");

        const message = `Halo! I'd like to place an order:\n\nOrder #${order.id}\nCustomer: ${order.customerName}\nPhone: ${order.customerPhone}\n\nItems:\n${itemsList}\n\nTotal: N$${order.total}\n\nShipping Address:\n${order.shippingAddress}\n\n${order.notes ? `Notes: ${order.notes}` : ""}`;

        const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

        return c.json({ whatsappUrl, message });
    } catch (error) {
        console.error("Error generating WhatsApp message:", error);
        return c.json({ error: "Failed to generate WhatsApp message" }, 500);
    }
});

app.get("/my", async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const orders = await prisma.order.findMany({
            where: { userId: user.id },
            include: {
                orderItems: {
                    include: { product: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return c.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        return c.json({ error: "Failed to fetch orders" }, 500);
    }
});

export default app;

