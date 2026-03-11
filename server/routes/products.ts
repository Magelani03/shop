import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";

type Bindings = {
    DB: D1Database;
};

type Variables = {
    prisma: PrismaClient;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Public product endpoints
app.get("/", async (c) => {
    try {
        const prisma = c.get('prisma'); // We'll set this in middleware
        const { category, featured, search, limit, offset } = c.req.query();

        const where: any = { active: true };

        if (category) {
            where.category = category;
        }

        if (featured === "true") {
            where.featured = true;
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } },
            ];
        }

        const products = await prisma.product.findMany({
            where,
            take: limit ? parseInt(limit) : undefined,
            skip: offset ? parseInt(offset) : undefined,
            orderBy: { createdAt: "desc" },
        });

        return c.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        return c.json({ error: "Failed to fetch products" }, 500);
    }
});

app.get("/:id", async (c) => {
    try {
        const prisma = c.get('prisma') as PrismaClient;
        const id = parseInt(c.req.param("id"));
        const product = await prisma.product.findUnique({ where: { id } });

        if (!product || !product.active) {
            return c.json({ error: "Product not found" }, 404);
        }

        return c.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        return c.json({ error: "Failed to fetch product" }, 500);
    }
});

export default app;
