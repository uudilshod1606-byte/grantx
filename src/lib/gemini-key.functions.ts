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
export const getGeminiApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<string> => {
    const email = String(
      (context.claims as { email?: string } | null)?.email ?? "",
    ).toLowerCase();
    if (email !== ADMIN_EMAIL) throw new Error("Forbidden");

    const key = process.env["GEMINI_API_KEY"];
    if (!key) throw new Error("GEMINI_API_KEY sozlanmagan");
    return key;
  });
