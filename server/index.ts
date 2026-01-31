import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import { Role, OrderStatus } from "@prisma/client";

const app = express();
const port = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";



app.use(
  cors({
    origin: ["http://localhost:8080", "http://localhost:5173"],
  }),
);
app.use(express.json());

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
};

// Middleware to check admin role
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== Role.ADMIN) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth endpoints
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash: hashedPassword,
        role: Role.USER,
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Public product endpoints
app.get("/api/products", async (req, res) => {
  try {
    const { category, featured, search, limit, offset } = req.query;

    const where: any = { active: true };

    if (category) {
      where.category = category;
    }

    if (featured === "true") {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      take: limit ? parseInt(limit as string) : undefined,
      skip: offset ? parseInt(offset as string) : undefined,
      orderBy: { createdAt: "desc" },
    });

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product || !product.active) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Order endpoints (authenticated)
app.post("/api/orders", authenticateToken, async (req, res) => {
  try {
    const { items, customerInfo, shippingAddress, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order items are required" });
    }

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

app.get("/api/orders/my", authenticateToken, async (req, res) => {
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

// Settings endpoint
app.get("/api/settings", async (req, res) => {
  try {
    const settings = await prisma.settings.findMany();
    const settingsMap = settings.reduce((acc: any, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    res.json(settingsMap);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// ADMIN ENDPOINTS
app.use("/api/admin/*", authenticateToken, requireAdmin);

// Admin Dashboard Stats
app.get("/api/admin/stats", async (req, res) => {
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
app.get("/api/admin/products", async (req, res) => {
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

    res.json(products);
  } catch (error) {
    console.error("Error fetching admin products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/api/admin/products", async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      stock,
      featured = false,
      discount = null,
    } = req.body;

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

app.put("/api/admin/products/:id", async (req, res) => {
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

app.delete("/api/admin/products/:id", async (req, res) => {
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
app.get("/api/admin/orders", async (req, res) => {
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

app.put("/api/admin/orders/:id/status", async (req, res) => {
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

app.post("/api/admin/orders/:id/whatsapp", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: { include: { product: true } },
      },
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

    const message = `New Order #${order.id}
Customer: ${order.customerName}
Phone: ${order.customerPhone}
Email: ${order.customerEmail}

Items:
${itemsList}

Subtotal: $${order.subtotal}
Shipping: $${order.shipping}
Tax: $${order.tax}
Total: $${order.total}

Shipping Address:
${order.shippingAddress}

${order.notes ? `Notes: ${order.notes}` : ""}`;

    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

    // Mark as WhatsApp sent
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
app.get("/api/admin/users", async (req, res) => {
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
app.get("/api/admin/settings", async (req, res) => {
  try {
    const settings = await prisma.settings.findMany();
    res.json(settings);
  } catch (error) {
    console.error("Error fetching admin settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

app.put("/api/admin/settings", async (req, res) => {
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
app.get("/api/admin/analytics/sales", async (req, res) => {
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
        return {
          ...item,
          product,
        };
      }),
    );

    res.json({
      salesData,
      topProducts: topProductsWithDetails,
      ordersByStatus,
    });
  } catch (error) {
    console.error("Error fetching sales analytics:", error);
    res.status(500).json({ error: "Failed to fetch sales analytics" });
  }
});

app.listen(port, () => {
  console.log(`🚀 API server listening on port ${port}`);
  console.log(
    `📊 Admin panel available at http://localhost:${port}/api/admin/*`,
  );
});
