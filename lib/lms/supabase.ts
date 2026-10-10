import { createClient } from "@supabase/supabase-js";

// Placeholders keep pages importable on deployments without Supabase settings; portal pages check `lmsReady` first.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://not-configured.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_KEY || "not-configured",
);

/** Calls an Edge Function; throws with the function's own error message so pages can show it. */
export async function fn<T = any>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    const message = await error.context?.json?.().then((j: { error?: string }) => j.error).catch(() => null);
    throw Object.assign(new Error(message ?? error.message), { status: error.context?.status as number | undefined });
  }
  return data;
}

/** Unwraps a Supabase query result, throwing its error. Lists are never null without an error;
 *  `.maybeSingle()` can still give null at runtime, so callers keep their `if (!row)` checks. */
export function must<T>({ data, error }: { data: T; error: { message: string } | null }): NonNullable<T> {
  if (error) throw new Error(error.message);
  return data as NonNullable<T>;
}

/** A short-lived link to a private file. */
export async function fileUrl(bucket: string, path: string) {
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
