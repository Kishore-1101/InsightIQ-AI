import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL environment variable is required"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().optional(),
});

// Parse environments safely at startup
const parsed = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL,
});

if (!parsed.success) {
  if (process.env.NODE_ENV === "production") {
    console.error("❌ Invalid environment variables during startup:");
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error("Missing or invalid database configuration. Please inspect your environment variables.");
  } else {
    console.warn("⚠️ Local environment validation warnings:", parsed.error.format());
  }
}

export const env = parsed.success ? parsed.data : null;
