import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ADMIN_EMAIL = "dilshoduktamov34@gmail.com";

/**
 * Returns the Gemini API key to the signed-in admin ONLY.
 * The Gemini request itself runs in the browser (Google blocks the
 * server data-centre IPs with "User location is not supported"),
 * so the key has to reach the admin's browser — but it is never
 * baked into the public bundle.
 */
/**
 * Returns the Gemini API key(s) to the signed-in admin ONLY.
 * The Gemini request itself runs in the browser (Google blocks the
 * server data-centre IPs with "User location is not supported"),
 * so the key has to reach the admin's browser — but it is never
 * baked into the public bundle.
 *
 * GEMINI_API_KEY may hold several keys separated by commas
 * (e.g. from different free Google accounts) — the client rotates
 * between them automatically when one hits a quota limit.
 */
export const getGeminiApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<string[]> => {
    const email = String(
      (context.claims as { email?: string } | null)?.email ?? "",
    ).toLowerCase();
    if (email !== ADMIN_EMAIL) throw new Error("Forbidden");

    const raw = process.env["GEMINI_API_KEY"];
    if (!raw) throw new Error("GEMINI_API_KEY sozlanmagan");
    const keys = raw.split(",").map((k) => k.trim()).filter(Boolean);
    if (keys.length === 0) throw new Error("GEMINI_API_KEY sozlanmagan");
    return keys;
  });
