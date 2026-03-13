import { Hono } from "hono";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role, PrismaClient } from "@prisma/client";
import { loginSchema, registerSchema } from "../schemas";
import { authenticateToken } from "../middleware/auth";
import { getJwtSecret } from "../env";

type Bindings = {
    DB?: D1Database;
};

type Variables = {
    prisma: PrismaClient;
    user: any;
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

        const token = jwt.sign({ userId: user.id }, getJwtSecret(c), {
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
                address: user.address,
                city: user.city,
            },
        });
    } catch (error: unknown) {
        console.error("Login error:", error);
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes("does not exist") || msg.includes("no such table")) {
            return c.json({ error: "Database not set up. Run: npm run db:setup:local" }, 503);
        }
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

        console.log("SUCCESS: User created in DB:", user.email, "ID:", user.id);
        const count = await prisma.user.count();
        console.log("Total users in this DB session:", count);

        const token = jwt.sign({ userId: user.id }, getJwtSecret(c), {
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
                address: user.address,
                city: user.city,
            },
        });
    } catch (error: unknown) {
        console.error("Registration error:", error);
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes("does not exist") || msg.includes("no such table")) {
            return c.json({ error: "Database not set up. Run: npm run db:setup:local" }, 503);
        }
        return c.json({ error: "Internal server error" }, 500);
    }
});

// Authenticated user profile routes
app.use("/me/*", authenticateToken);

app.get("/me", async (c) => {
    const user = c.get("user");

    return c.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            avatar: user.avatar,
            address: user.address,
            city: user.city,
        },
    });
});

app.put("/me", async (c) => {
    try {
        const prisma = c.get("prisma");
        const currentUser = c.get("user");
        const { name, phone, avatar, address, city } = await c.req.json();

        const updated = await prisma.user.update({
            where: { id: currentUser.id },
            data: {
                name: name ?? currentUser.name,
                phone: phone ?? currentUser.phone,
                avatar: avatar ?? currentUser.avatar,
                address: address ?? currentUser.address,
                city: city ?? currentUser.city,
            },
        });

        return c.json({
            user: {
                id: updated.id,
                name: updated.name,
                email: updated.email,
                role: updated.role,
                phone: updated.phone,
                avatar: updated.avatar,
                address: updated.address,
                city: updated.city,
            },
        });
    } catch (error) {
        console.error("Profile update error:", error);
        return c.json({ error: "Failed to update profile" }, 500);
    }
});

export default app;
