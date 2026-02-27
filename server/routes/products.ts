import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

// Public product endpoints
router.get("/", async (req, res) => {
    try {
        const { category, featured, search, limit, offset } = req.query;

        const where: any = { active: true };

        if (category) {
            where.category = category as string;
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

router.get("/:id", async (req, res) => {
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

export default router;
