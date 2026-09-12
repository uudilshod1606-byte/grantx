import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ADMIN_EMAIL = "dilshoduktamov34@gmail.com";

/** Returns configured Gemini key(s) to the signed-in admin only. */
export const getGeminiApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<string[]> => {
    const email = String(
      (context.claims as { email?: string } | null)?.email ?? "",
    ).toLowerCase();
    if (email !== ADMIN_EMAIL) throw new Error("Forbidden");

    // Support one comma-separated secret and separate *_1..*_10 secrets.
    const values = [
      process.env["GEMINI_API_KEY"],
      ...Array.from({ length: 10 }, (_, i) => process.env[`GEMINI_API_KEY_${i + 1}`]),
    ];
    const keys = values
      .flatMap((value) => (value ?? "").split(","))
      .map((key) => key.trim())
      .filter(Boolean);
    const unique = [...new Set(keys)];
    if (!unique.length) throw new Error("GEMINI_API_KEY sozlanmagan");
    return unique;
  });
