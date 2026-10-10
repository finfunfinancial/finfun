"use client";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

export type Me = { id: string; role: string; full_name: string | null; org_id: string | null; email: string | null; phone: string | null };

/** Where each role lands after logging in. */
export const homeFor = (role: string) =>
  ({ admin: "/admin", trainer: "/teach", teacher: "/teach", school_admin: "/teach", parent: "/parent", student: "/learn" })[role] ?? "/";

/** The signed-in user's profile: undefined while loading, null when signed out. */
export function useMe() {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  useEffect(() => {
    const load = async (userId: string | undefined) => {
      if (!userId) return setMe(null);
      const { data } = await supabase.from("profiles").select("id, role, full_name, org_id, email, phone").eq("id", userId).maybeSingle();
      setMe(data ?? null);
    };
    supabase.auth.getSession().then(({ data }) => load(data.session?.user.id));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") load(session?.user.id);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return me;
}

const MeContext = createContext<Me | null>(null);
export const useUser = () => useContext(MeContext)!;

/** Renders children only for signed-in users with one of `roles`; sends everyone else to the right place. */
export function Gate({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const me = useMe();
  const router = useRouter();
  const allowed = !!me && roles.includes(me.role);
  useEffect(() => {
    if (me === null) router.replace("/");
    else if (me && !allowed) router.replace(homeFor(me.role));
  }, [me, allowed, router]);
  if (!allowed) return <p className="loading">Loading…</p>;
  return <MeContext.Provider value={me}>{children}</MeContext.Provider>;
}
