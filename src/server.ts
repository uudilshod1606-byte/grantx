import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

/**
 * Serve the premium INTIL onboarding HTML from the same origin.
 *
 * The onboarding design is stored in GitHub as a gzip-compressed, self-contained
 * HTML file. Fetching that file from the browser caused a CORS/network failure
 * in the Lovable preview. Fetching it here on the server avoids cross-origin
 * browser requests while keeping the original HTML completely unchanged.
 */
async function serveIntilOnboarding(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (url.pathname !== "/intil-onboarding-loader.html") return null;

  try {
    const assetUrl =
      "https://raw.githubusercontent.com/uudilshod1606-byte/grantx/main/public/intil-onboarding-v5-premium.html.gz";
    const asset = await fetch(assetUrl, { cf: { cacheTtl: 0 } } as RequestInit);

    if (!asset.ok || !asset.body) {
      throw new Error(`INTIL onboarding asset failed: ${asset.status}`);
    }

    const htmlStream = asset.body.pipeThrough(new DecompressionStream("gzip"));

    return new Response(htmlStream, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store, max-age=0",
        "x-intil-onboarding": "premium-v5",
      },
    });
  } catch (error) {
    console.error("INTIL onboarding asset error:", error);
    return new Response(
      "<!doctype html><html lang=\"uz\"><head><meta charset=\"utf-8\"><title>INTIL — Onboarding</title></head><body style=\"margin:0\"><pre style=\"font:14px monospace;padding:24px\">INTIL onboarding yuklanmadi.</pre></body></html>",
      {
        status: 503,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
      },
    );
  }
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const onboardingResponse = await serveIntilOnboarding(request);
      if (onboardingResponse) return onboardingResponse;

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
