import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";

type Bindings = {
    DB?: unknown;
};

type Variables = {
    prisma: PrismaClient;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.get("/", async (c) => {
    try {
        const prisma = c.get('prisma');
        const settings = await prisma.settings.findMany();
        const settingsMap = settings.reduce((acc: any, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});
        return c.json(settingsMap);
    } catch (error) {
        console.error("Error fetching settings:", error);
        return c.json({ error: "Failed to fetch settings" }, 500);
    }
});

export default app;

