import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { ZodError } from "zod";
import { contactWhatsAppSchema } from "../schemas/index.js";

type Variables = {
    prisma: PrismaClient;
};

const app = new Hono<{ Variables: Variables }>();

function getAdminWhatsApp(
    settingsMap: Record<string, string>,
): string {
    const fromDb = settingsMap.admin_whatsapp?.trim();
    const fromEnv = process.env.ADMIN_WHATSAPP?.trim();
    return fromDb || fromEnv || "";
}

app.post("/whatsapp", async (c) => {
    try {
        const body = await c.req.json();
        const data = contactWhatsAppSchema.parse(body);
        const prisma = c.get("prisma");

        const settings = await prisma.settings.findMany();
        const settingsMap = settings.reduce((acc: Record<string, string>, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});

        const whatsappNumber = getAdminWhatsApp(settingsMap);

        if (!whatsappNumber) {
            return c.json({
                configured: false,
                whatsappUrl: null,
                error: "WhatsApp number not configured for the store.",
            });
        }

        const typeLabels: Record<string, string> = {
            general: "General inquiry",
            complaint: "Complaint / issue",
            question: "Question",
        };
        const typeLabel = data.inquiryType
            ? typeLabels[data.inquiryType] ?? "Message"
            : "Contact form";

        const lines = [
            `*${typeLabel}*`,
            `Subject: ${data.subject}`,
            "",
            `From: ${data.name}`,
            `Email: ${data.email}`,
            ...(data.phone ? [`Phone: ${data.phone}`] : []),
            "",
            data.message,
        ];
        let text = lines.join("\n");
        if (text.length > 1800) {
            text = `${text.slice(0, 1797)}...`;
        }

        const whatsappUrl =
            `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

        return c.json({ configured: true, whatsappUrl, message: text });
    } catch (error) {
        if (error instanceof ZodError) {
            return c.json({ error: "Invalid form data", details: error.flatten() }, 400);
        }
        console.error("Error building contact WhatsApp URL:", error);
        return c.json({ error: "Failed to prepare WhatsApp message" }, 500);
    }
});

export default app;
