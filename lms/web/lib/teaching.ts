import type { Me } from "./auth";
import { must, supabase } from "./supabase";

/** Batches this staff member teaches: their own as trainer, or their school sections' as teacher / school admin. */
export async function myBatchIds(me: Me): Promise<string[]> {
  const sections = me.role === "school_admin"
    ? supabase.from("sections").select("id").eq("org_id", me.org_id ?? "")
    : supabase.from("sections").select("id").eq("teacher_id", me.id);
  const sectionIds = must(await sections).map((s) => s.id);
  let query = supabase.from("batches").select("id");
  query = sectionIds.length ? query.or(`trainer_id.eq.${me.id},section_id.in.(${sectionIds.join(",")})`) : query.eq("trainer_id", me.id);
  return must(await query).map((b) => b.id);
}
