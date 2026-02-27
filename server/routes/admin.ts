import { Router } from "express";
import { prisma } from "../prisma";
import { Role, OrderStatus } from "@prisma/client";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import { productSchema } from "../schemas";

const router = Router();

// Apply admin protection to all routes
router.use(authenticateToken, requireAdmin);

// Admin Dashboard Stats
router.get("/stats", async (req, res) => {
    try {
        const [
            totalProducts,
            totalOrders,
            totalUsers,
            pendingOrders,
            totalRevenue,
            recentOrders,
        ] = await Promise.all([
            prisma.product.count(),
            prisma.order.count(),
            prisma.user.count({ where: { role: Role.USER } }),
            prisma.order.count({ where: { status: OrderStatus.PENDING } }),
            prisma.order.aggregate({
                where: { status: { in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED] } },
                _sum: { total: true },
            }),
            prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: {
                    user: { select: { name: true, email: true } },
                    orderItems: { include: { product: { select: { name: true } } } },
                },
            }),
        ]);

        res.json({
            totalProducts,
            totalOrders,
            totalUsers,
            pendingOrders,
            totalRevenue: totalRevenue._sum.total || 0,
            recentOrders,
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

// Admin Product Management
router.get("/products", async (req, res) => {
    try {
        const { search, category, status } = req.query;
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: "insensitive" } },
                { description: { contains: search as string, mode: "insensitive" } },
            ];
        }

        if (category) {
            where.category = category as string;
        }

        if (status === "active") {
            where.active = true;
        } else if (status === "inactive") {
            where.active = false;
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });

        res.json(products);
    } catch (error) {
        console.error("Error fetching admin products:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

router.post("/products", async (req, res) => {
    try {
        const validatedData = productSchema.parse(req.body);
        const {
            name,
            description,
            price,
            category,
            image,
            stock,
            featured = false,
            discount = null,
        } = validatedData;

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                category,
                image,
                stock: parseInt(stock),
                featured,
                discount: discount ? parseInt(discount) : null,
                active: true,
            },
        });

        res.json(product);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Failed to create product" });
    }
});

router.put("/products/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const {
            name,
            description,
            price,
            category,
            image,
            stock,
            featured,
            discount,
            active,
        } = req.body;

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price: price ? parseFloat(price) : undefined,
                category,
                image,
                stock: stock !== undefined ? parseInt(stock) : undefined,
                featured,
                discount: discount ? parseInt(discount) : null,
                active,
            },
        });

        res.json(product);
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Failed to update product" });
    }
});

router.delete("/products/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.product.delete({ where: { id } });
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Failed to delete product" });
    }
});

// Admin Order Management
router.get("/orders", async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;
        const where: any = {};

        if (status && status !== "all") {
            where.status = status as OrderStatus;
        }

        if (search) {
            where.OR = [
                { customerName: { contains: search as string, mode: "insensitive" } },
                { customerEmail: { contains: search as string, mode: "insensitive" } },
                { customerPhone: { contains: search as string, mode: "insensitive" } },
            ];
        }

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const [orders, totalCount] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take: parseInt(limit as string),
                include: {
                    user: { select: { name: true, email: true } },
                    orderItems: {
                        include: { product: { select: { name: true, image: true } } },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.order.count({ where }),
        ]);

        res.json({
            orders,
            totalCount,
            totalPages: Math.ceil(totalCount / parseInt(limit as string)),
            currentPage: parseInt(page as string),
        });
    } catch (error) {
        console.error("Error fetching admin orders:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

router.put("/orders/:id/status", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body;

        const order = await prisma.order.update({
            where: { id },
            data: { status },
            include: {
                orderItems: { include: { product: true } },
                user: true,
            },
        });

        res.json(order);
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ error: "Failed to update order status" });
    }
});

router.post("/orders/:id/whatsapp", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const order = await prisma.order.findUnique({
            where: { id },
            include: { orderItems: { include: { product: true } } },
        });

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        const settings = await prisma.settings.findMany();
        const settingsMap = settings.reduce((acc: any, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});

        const whatsappNumber = settingsMap.admin_whatsapp;

        if (!whatsappNumber) {
            return res.status(400).json({ error: "WhatsApp number not configured" });
        }

        // Create WhatsApp message
        const itemsList = order.orderItems
            .map(
                (item) =>
                    `• ${item.product.name} (Qty: ${item.quantity}) - $${item.price}`,
            )
            .join("\n");

        const message = `New Order #${order.id}\nCustomer: ${order.customerName}\nPhone: ${order.customerPhone}\nEmail: ${order.customerEmail}\n\nItems:\n${itemsList}\n\nSubtotal: $${order.subtotal}\nShipping: $${order.shipping}\nTax: $${order.tax}\nTotal: $${order.total}\n\nShipping Address:\n${order.shippingAddress}\n\n${order.notes ? `Notes: ${order.notes}` : ""}`;

        const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

        await prisma.order.update({
            where: { id },
            data: { whatsappSent: true },
        });

        res.json({ whatsappUrl, message });
    } catch (error) {
        console.error("Error generating WhatsApp message:", error);
        res.status(500).json({ error: "Failed to generate WhatsApp message" });
    }
});

// Admin User Management
router.get("/users", async (req, res) => {
    try {
        const { search, role } = req.query;
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: "insensitive" } },
                { email: { contains: search as string, mode: "insensitive" } },
            ];
        }

        if (role && role !== "all") {
            where.role = role as Role;
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
                _count: { select: { orders: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// Admin Settings Management
router.get("/settings", async (req, res) => {
    try {
        const settings = await prisma.settings.findMany();
        res.json(settings);
    } catch (error) {
        console.error("Error fetching admin settings:", error);
        res.status(500).json({ error: "Failed to fetch settings" });
    }
});

router.put("/settings", async (req, res) => {
    try {
        const updates = req.body;
        for (const [key, value] of Object.entries(updates)) {
            await prisma.settings.upsert({
                where: { key },
                update: { value: value as string },
                create: { key, value: value as string },
            });
        }
        const updatedSettings = await prisma.settings.findMany();
        res.json(updatedSettings);
    } catch (error) {
        console.error("Error updating settings:", error);
        res.status(500).json({ error: "Failed to update settings" });
    }
});

// Sales Analytics
router.get("/analytics/sales", async (req, res) => {
    try {
        const { period = "7d" } = req.query;
        const startDate = new Date();

        switch (period) {
            case "7d":
                startDate.setDate(startDate.getDate() - 7);
                break;
            case "30d":
                startDate.setDate(startDate.getDate() - 30);
                break;
            case "90d":
                startDate.setDate(startDate.getDate() - 90);
                break;
            default:
                startDate.setDate(startDate.getDate() - 7);
        }

        const [salesData, topProducts, ordersByStatus] = await Promise.all([
            prisma.order.groupBy({
                by: ["createdAt"],
                where: {
                    createdAt: { gte: startDate },
                    status: { in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED] },
                },
                _sum: { total: true },
                _count: true,
            }),
            prisma.orderItem.groupBy({
                by: ["productId"],
                where: {
                    order: {
                        createdAt: { gte: startDate },
                        status: { in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED] },
                    },
                },
                _sum: { quantity: true, price: true },
                orderBy: { _sum: { quantity: "desc" } },
                take: 10,
            }),
            prisma.order.groupBy({
                by: ["status"],
                _count: true,
            }),
        ]);

        // Get product details for top products
        const topProductsWithDetails = await Promise.all(
            topProducts.map(async (item) => {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                    select: { name: true, image: true },
                });
                return { ...item, product };
            }),
        );

        res.json({ salesData, topProducts: topProductsWithDetails, ordersByStatus });
    } catch (error) {
        console.error("Error fetching sales analytics:", error);
        res.status(500).json({ error: "Failed to fetch sales analytics" });
    }
});

export default router;
