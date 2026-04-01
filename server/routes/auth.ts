import { Hono } from "hono";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Prisma, Role, PrismaClient } from "@prisma/client";
import { ZodError } from "zod";
import { loginSchema, registerSchema } from "../schemas/index.js";
import { authenticateToken } from "../middleware/auth.js";
import { jwtSecretForSigning } from "../env.js";

type Bindings = {
    DB?: unknown;
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

        const jwtCfg = jwtSecretForSigning(c);
        if (!jwtCfg.ok) {
            return c.json({ error: jwtCfg.error }, 503);
        }
        const token = jwt.sign({ userId: user.id }, jwtCfg.secret, {
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
        if (error instanceof ZodError) {
            return c.json({ error: "Invalid input", details: error.flatten() }, 400);
        }
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes("does not exist") || msg.includes("no such table")) {
            return c.json({ error: "Database not set up. Run: npx prisma migrate dev && npx prisma db seed" }, 503);
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

        const jwtCfg = jwtSecretForSigning(c);
        if (!jwtCfg.ok) {
            return c.json({ error: jwtCfg.error }, 503);
        }
        const token = jwt.sign({ userId: user.id }, jwtCfg.secret, {
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
        if (error instanceof ZodError) {
            return c.json({ error: "Invalid input", details: error.flatten() }, 400);
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                const target = (error.meta?.target as string[] | undefined)?.join(", ");
                return c.json(
                    {
                        error: target?.includes("email")
                            ? "Email already registered"
                            : "This value is already in use",
                    },
                    400,
                );
            }
        }
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes("does not exist") || msg.includes("no such table")) {
            return c.json({ error: "Database not set up. Run: npx prisma migrate dev && npx prisma db seed" }, 503);
        }
        if (
            msg.includes("DATABASE_URL") ||
            msg.includes("P1001") ||
            msg.includes("Can't reach database") ||
            msg.includes("PrismaClientInitializationError") ||
            msg.includes("Server has closed the connection")
        ) {
            return c.json({ error: "Database not configured. Check DATABASE_URL in .env and restart the API server." }, 503);
        }
        if (msg.includes("secret") && msg.includes("JWT")) {
            return c.json(
                { error: "JWT signing failed. Set JWT_SECRET in .env (at least 8 characters)." },
                503,
            );
        }
        const expose =
            process.env.NODE_ENV !== "production" && error instanceof Error ? error.message : null;
        return c.json(
            {
                error: expose ? `Registration failed: ${expose}` : "Internal server error",
            },
            500,
        );
    }
});

// Authenticated user profile routes — `/me/*` does NOT match `/me` in Hono; use a sub-app so GET/PUT /me are protected.
const meRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();
meRoutes.use("*", authenticateToken);

meRoutes.get("/", async (c) => {
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

meRoutes.put("/", async (c) => {
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

app.route("/me", meRoutes);

export default app;
