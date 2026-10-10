// Small HTTP helpers shared by every Edge Function.

export const cors = {
  "Access-Control-Allow-Origin": "*", // auth is a bearer token, not a cookie, so any origin is safe
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/** Throw this for an error the caller should see; anything else becomes a generic 500. */
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

export async function readJson<T>(req: Request): Promise<Partial<T>> {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, "Invalid JSON body.");
  }
}

/** Deno.serve with CORS preflight and error-to-JSON handling. */
export const serve = (handler: (req: Request) => Promise<Response>) =>
  Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    if (req.method !== "POST") return json({ error: "Use POST." }, 405);
    try {
      return await handler(req);
    } catch (e) {
      if (e instanceof HttpError) return json({ error: e.message }, e.status);
      console.error(e);
      return json({ error: "Something went wrong. Please try again." }, 500);
    }
  });
