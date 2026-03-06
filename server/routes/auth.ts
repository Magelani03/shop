import { Hono } from "hono";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { loginSchema, registerSchema } from "../schemas";
import { PrismaClient } from "@prisma/client";

type Bindings = {
    DB: D1Database;
    JWT_SECRET: string;
};

type Variables = {
    prisma: PrismaClient;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.post("/login", async (c) => {
    try {
        const body = await c.req.json();
        const validatedData = loginSchema.parse(body);
        const { email, password } = validatedData;
        const prisma = c.get('prisma');

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return c.json({ error: "Invalid credentials" }, 401);
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isValidPassword) {
            return c.json({ error: "Invalid credentials" }, 401);
        }

        const token = jwt.sign({ userId: user.id }, c.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        return c.json({
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
        return c.json({ error: "Internal server error" }, 500);
    }
});

app.post("/register", async (c) => {
    try {
        const body = await c.req.json();
        const validatedData = registerSchema.parse(body);
        const { name, email, password, phone } = validatedData;
        const prisma = c.get('prisma');

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return c.json({ error: "User already exists" }, 400);
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

        const token = jwt.sign({ userId: user.id }, c.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        return c.json({
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
        return c.json({ error: "Internal server error" }, 500);
    }
});

export default app;
