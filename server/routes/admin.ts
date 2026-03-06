import { Hono } from "hono";
import { Role, OrderStatus, PrismaClient } from "@prisma/client";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import { productSchema } from "../schemas";

type Bindings = {
    DB: D1Database;
};

type Variables = {
    prisma: PrismaClient;
    user: any;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Apply admin protection
app.use("*", authenticateToken);
app.use("*", requireAdmin);

// Admin Dashboard Stats
app.get("/stats", async (c) => {
    try {
        const prisma = c.get('prisma');
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

        return c.json({
            totalProducts,
            totalOrders,
            totalUsers,
            pendingOrders,
            totalRevenue: totalRevenue._sum.total || 0,
            recentOrders,
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return c.json({ error: "Failed to fetch stats" }, 500);
    }
});

// Admin Product Management
app.get("/products", async (c) => {
    try {
        const prisma = c.get('prisma');
        const { search, category, status } = c.req.query();
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        if (category) {
            where.category = category;
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

        return c.json(products);
    } catch (error) {
        console.error("Error fetching admin products:", error);
        return c.json({ error: "Failed to fetch products" }, 500);
    }
});

app.post("/products", async (c) => {
    try {
        const prisma = c.get('prisma');
        const body = await c.req.json();
        const validatedData = productSchema.parse(body);
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
                price: parseFloat(String(price)),
                category,
                image,
                stock: parseInt(String(stock)),
                featured,
                discount: discount ? parseInt(String(discount)) : null,
                active: true,
            },
        });


        return c.json(product);
    } catch (error) {
        console.error("Error creating product:", error);
        return c.json({ error: "Failed to create product" }, 500);
    }
});

app.put("/products/:id", async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = parseInt(c.req.param("id"));
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
        } = await c.req.json();

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price: price ? parseFloat(String(price)) : undefined,
                category,
                image,
                stock: stock !== undefined ? parseInt(String(stock)) : undefined,
                featured,
                discount: discount ? parseInt(String(discount)) : null,
                active,
            },
        });


        return c.json(product);
    } catch (error) {
        console.error("Error updating product:", error);
        return c.json({ error: "Failed to update product" }, 500);
    }
});

app.delete("/products/:id", async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = parseInt(c.req.param("id"));
        await prisma.product.delete({ where: { id } });
        return c.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        return c.json({ error: "Failed to delete product" }, 500);
    }
});

// Admin Order Management
app.get("/orders", async (c) => {
    try {
        const prisma = c.get('prisma');
        const { status, search, page = "1", limit = "20" } = c.req.query();
        const where: any = {};

        if (status && status !== "all") {
            where.status = status as OrderStatus;
        }

        if (search) {
            where.OR = [
                { customerName: { contains: search, mode: "insensitive" } },
                { customerEmail: { contains: search, mode: "insensitive" } },
                { customerPhone: { contains: search, mode: "insensitive" } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [orders, totalCount] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take: parseInt(limit),
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

        return c.json({
            orders,
            totalCount,
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            currentPage: parseInt(page),
        });
    } catch (error) {
        console.error("Error fetching admin orders:", error);
        return c.json({ error: "Failed to fetch orders" }, 500);
    }
});

app.put("/orders/:id/status", async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = parseInt(c.req.param("id"));
        const { status } = await c.req.json();

        const order = await prisma.order.update({
            where: { id },
            data: { status },
            include: {
                orderItems: { include: { product: true } },
                user: true,
            },
        });

        return c.json(order);
    } catch (error) {
        console.error("Error updating order status:", error);
        return c.json({ error: "Failed to update order status" }, 500);
    }
});

app.post("/orders/:id/whatsapp", async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = parseInt(c.req.param("id"));
        const order = await prisma.order.findUnique({
            where: { id },
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
                    `• ${item.product.name} (Qty: ${item.quantity}) - $${item.price}`,
            )
            .join("\n");

        const message = `New Order #${order.id}\nCustomer: ${order.customerName}\nPhone: ${order.customerPhone}\nEmail: ${order.customerEmail}\n\nItems:\n${itemsList}\n\nSubtotal: $${order.subtotal}\nShipping: $${order.shipping}\nTax: $${order.tax}\nTotal: $${order.total}\n\nShipping Address:\n${order.shippingAddress}\n\n${order.notes ? `Notes: ${order.notes}` : ""}`;

        const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

        await prisma.order.update({
            where: { id },
            data: { whatsappSent: true },
        });

        return c.json({ whatsappUrl, message });
    } catch (error) {
        console.error("Error generating WhatsApp message:", error);
        return c.json({ error: "Failed to generate WhatsApp message" }, 500);
    }
});

// Admin User Management
app.get("/users", async (c) => {
    try {
        const prisma = c.get('prisma');
        const { search, role } = c.req.query();
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
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

        return c.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return c.json({ error: "Failed to fetch users" }, 500);
    }
});

// Admin Settings Management
app.get("/settings", async (c) => {
    try {
        const prisma = c.get('prisma');
        const settings = await prisma.settings.findMany();
        return c.json(settings);
    } catch (error) {
        console.error("Error fetching admin settings:", error);
        return c.json({ error: "Failed to fetch settings" }, 500);
    }
});

app.put("/settings", async (c) => {
    try {
        const prisma = c.get('prisma');
        const updates = await c.req.json();
        for (const [key, value] of Object.entries(updates)) {
            await prisma.settings.upsert({
                where: { key },
                update: { value: value as string },
                create: { key, value: value as string },
            });
        }
        const updatedSettings = await prisma.settings.findMany();
        return c.json(updatedSettings);
    } catch (error) {
        console.error("Error updating settings:", error);
        return c.json({ error: "Failed to update settings" }, 500);
    }
});


// Sales Analytics
app.get("/analytics/sales", async (c) => {
    try {
        const prisma = c.get('prisma');
        const { period = "7d" } = c.req.query();
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

        return c.json({ salesData, topProducts: topProductsWithDetails, ordersByStatus });
    } catch (error) {
        console.error("Error fetching sales analytics:", error);
        return c.json({ error: "Failed to fetch sales analytics" }, 500);
    }
});

export default app;

