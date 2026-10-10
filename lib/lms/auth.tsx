"use client";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

export type Me = { id: string; role: string; full_name: string | null; org_id: string | null; email: string | null; phone: string | null };

/** Where each role lands after logging in: admins to the admin portal, everyone who buys to My courses. */
export const homeFor = (role: string) => (role === "admin" ? "/admin" : role === "parent" ? "/my-courses" : "/");

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

/** Renders children only for signed-in users with one of `roles`; sends everyone else to log in or to their own area. */
export function Gate({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const me = useMe();
  const router = useRouter();
  const path = usePathname();
  const allowed = !!me && roles.includes(me.role);
  useEffect(() => {
    if (me === null) router.replace(`/login?next=${encodeURIComponent(path)}`);
    else if (me && !allowed) router.replace(homeFor(me.role));
  }, [me, allowed, router, path]);
  if (!allowed) return <p className="loading">Loading…</p>;
  return <MeContext.Provider value={me}>{children}</MeContext.Provider>;
}

/** Online accounts need the Supabase settings; until they're set on a deployment, portal pages say so. */
export const lmsReady = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_KEY);
