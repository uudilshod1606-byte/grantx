import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ADMIN_EMAIL = "dilshoduktamov34@gmail.com";

export type AdminUserRow = {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  confirmed: boolean;
};

export const listPlatformUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminUserRow[]> => {
    const email = String(
      (context.claims as { email?: string } | null)?.email ?? "",
    ).toLowerCase();
    if (email !== ADMIN_EMAIL) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) throw new Error(error.message);

    return data.users.map((u) => {
      const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
      const mail = (u.email ?? "").toLowerCase();
      return {
        id: u.id,
        email: mail,
        fullName: String(meta['full_name'] ?? "").trim() || mail.split("@")[0] || "—",
        createdAt: u.created_at,
        confirmed: Boolean(u.email_confirmed_at),
      };
    });
  });
