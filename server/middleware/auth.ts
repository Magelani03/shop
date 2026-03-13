import { createMiddleware } from "hono/factory";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { getJwtSecret } from "../env";

type Bindings = {
    JWT_SECRET?: string;
};

type Variables = {
    user: any;
    prisma: PrismaClient;
    JWT_SECRET?: string;
    ALLOWED_ORIGINS?: string;
};

export const authenticateToken = createMiddleware<{ Bindings: Bindings; Variables: Variables }>(async (c, next) => {
    const authHeader = c.req.header("authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return c.json({ error: "Access denied. No token provided." }, 401);
    }

    const secret = getJwtSecret(c);
    if (!secret) {
        return c.json({ error: "Server misconfiguration: JWT_SECRET not set" }, 500);
    }

    try {
        const decoded = jwt.verify(token, secret) as any;
        const prisma = c.get('prisma');
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) {
            return c.json({ error: "Invalid token" }, 401);
        }

        c.set("user", user);
        await next();
    } catch (error) {
        return c.json({ error: "Invalid token" }, 403);
    }
});

export const requireAdmin = createMiddleware<{ Variables: Variables }>(async (c, next) => {
    const user = c.get("user");
    if (user?.role !== "ADMIN") {
        return c.json({ error: "Admin access required" }, 403);
    }
    await next();
});

