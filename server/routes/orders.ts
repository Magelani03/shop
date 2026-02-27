import { Router } from "express";
import { prisma } from "../prisma";
import { OrderStatus } from "@prisma/client";
import { authenticateToken } from "../middleware/auth";
import { createOrderSchema } from "../schemas";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

router.post("/", async (req: any, res) => {
    try {
        const validatedData = createOrderSchema.parse(req.body);
        const { items, customerInfo, shippingAddress, notes } = validatedData;

        // Calculate totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
            });

            if (!product || !product.active) {
                return res
                    .status(400)
                    .json({ error: `Product ${item.productId} not found or inactive` });
            }

            if (product.stock < item.quantity) {
                return res
                    .status(400)
                    .json({ error: `Insufficient stock for ${product.name}` });
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
                userId: req.user.id,
                status: OrderStatus.PENDING,
                total,
                subtotal,
                tax,
                shipping: shippingCost,
                customerName: customerInfo.name || req.user.name,
                customerEmail: customerInfo.email || req.user.email,
                customerPhone: customerInfo.phone || req.user.phone,
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

        res.json(order);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Failed to create order" });
    }
});

router.get("/my", async (req: any, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.id },
            include: {
                orderItems: {
                    include: { product: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

export default router;
