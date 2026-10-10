import { createClient } from "npm:@supabase/supabase-js@2";
import { HttpError } from "./http.ts";

const url = Deno.env.get("SUPABASE_URL")!;

/** Service-role client: bypasses RLS, so every function must check the caller itself. */
export const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

/** A fresh anon client, for signing someone in without sharing session state between requests. */
export const anonClient = () => createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { auth: { persistSession: false } });

export type Caller = { id: string; role: string; org_id: string | null };

/** The signed-in user behind the request's bearer token. Throws 401 if none, 403 if their role isn't allowed. */
export async function caller(req: Request, ...roles: string[]): Promise<Caller> {
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  const { data } = token ? await admin.auth.getUser(token) : { data: { user: null } };
  if (!data.user) throw new HttpError(401, "Please log in.");
  const { data: profile } = await admin.from("profiles").select("id, role, org_id").eq("id", data.user.id).single();
  if (!profile || (roles.length && !roles.includes(profile.role))) throw new HttpError(403, "You can't do that.");
  return profile;
}

/** Throws a 500 (logged) when a Supabase query failed; returns its data otherwise. */
export function must<T>({ data, error }: { data: T; error: unknown }): T {
  if (error) throw error;
  return data;
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
