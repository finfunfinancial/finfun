"use client";
import { useState } from "react";
import { Empty, Loaded, Notice, PageHead, statusChip } from "@/components/ui";
import { roleLabel, when } from "@/lib/format";
import { fn, must, supabase } from "@/lib/supabase";
import { useAction, useData } from "@/lib/use-data";

const STAFF = ["admin", "trainer", "school_admin", "teacher", "partner_viewer"];
type Tab = "parents" | "students" | "staff";

// Support lookups (ADM-3) and staff accounts.
export default function People() {
  const [tab, setTab] = useState<Tab>("parents");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  return (
    <>
      <PageHead title="People" sub="Find a parent by phone or email, a student by username, or manage staff." />
      <div className="spread" style={{ marginBottom: 16 }}>
        <div className="tabs" style={{ gridTemplateColumns: "repeat(3, 1fr)", width: 420, margin: 0 }}>
          {(["parents", "students", "staff"] as Tab[]).map((t) => (
            <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>
          ))}
        </div>
        <form className="row" onSubmit={(e) => { e.preventDefault(); setSearch(q.trim()); }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" aria-label="Search" style={{ width: 240 }} />
          <button className="btn white">Search</button>
        </form>
      </div>
      {tab === "parents" && <Parents search={search} />}
      {tab === "students" && <Students search={search} />}
      {tab === "staff" && <Staff search={search} />}
    </>
  );
}

const like = (q: string) => `%${q.replace(/[%_,()]/g, "")}%`;

function Parents({ search }: { search: string }) {
  const { data, error } = useData(() => {
    let query = supabase.from("profiles").select("id, full_name, phone, email, created_at, guardian_links(students(first_name, username, grade))")
      .eq("role", "parent").order("created_at", { ascending: false }).limit(100);
    if (search) query = query.or(`phone.ilike.${like(search)},email.ilike.${like(search)},full_name.ilike.${like(search)}`);
    return query.then(must);
  }, [search]);
  return (
    <Loaded data={data} error={error}>
      {(rows) => rows.length ? (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Parent</th><th>Phone</th><th>Email</th><th>Children</th><th>Joined</th></tr></thead>
            <tbody>
              {rows.map((p: any) => (
                <tr key={p.id}>
                  <td>{p.full_name ?? "—"}</td>
                  <td>{p.phone ? `+${p.phone}` : "—"}</td>
                  <td>{p.email ?? "—"}</td>
                  <td>{p.guardian_links.map((g: any) => `${g.students.first_name} (${g.students.username}, gr ${g.students.grade})`).join(", ") || "—"}</td>
                  <td>{when(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Empty>No parents found.</Empty>}
    </Loaded>
  );
}

function Students({ search }: { search: string }) {
  const [pin, setPin] = useState<{ username: string; pin: string } | null>(null);
  const { data, error, reload } = useData(() => {
    let query = supabase.from("students")
      .select("id, first_name, username, grade, locked_until, organisations(name), guardian_links(profiles(phone, email)), enrolments(status, programs(name), batches(name))")
      .order("created_at", { ascending: false }).limit(100);
    if (search) query = query.or(`username.ilike.${like(search)},first_name.ilike.${like(search)}`);
    return query.then(must);
  }, [search]);
  const reset = async (s: any) => {
    if (!confirm(`Give ${s.first_name} a new PIN? The old one stops working.`)) return;
    try {
      setPin(await fn("admin", { action: "reset_pin", studentId: s.id }));
      reload();
    } catch (e) {
      alert((e as Error).message);
    }
  };
  return (
    <>
      {pin && <Notice kind="ok">New login — username <span className="secret">{pin.username}</span> PIN <span className="secret">{pin.pin}</span>. Share it with the parent or school; it won't be shown again.</Notice>}
      <Loaded data={data} error={error}>
        {(rows) => rows.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Grade</th><th>Family / school</th><th>Enrolments</th><th></th></tr></thead>
              <tbody>
                {rows.map((s: any) => (
                  <tr key={s.id}>
                    <td><strong>{s.first_name}</strong><br /><span className="fine">{s.username}</span>
                      {s.locked_until && new Date(s.locked_until) > new Date() && <> <span className="chip s-failed">locked</span></>}
                    </td>
                    <td>{s.grade}</td>
                    <td>{s.organisations?.name ?? s.guardian_links.map((g: any) => g.profiles.phone ? `+${g.profiles.phone}` : g.profiles.email).join(", ")}</td>
                    <td>{s.enrolments.map((e: any, i: number) => <div key={i}>{e.programs.name}{e.batches ? ` · ${e.batches.name}` : ""} {statusChip(e.status)}</div>)}</td>
                    <td className="num"><button className="btn white sm" onClick={() => reset(s)}>Reset PIN</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>No students found.</Empty>}
      </Loaded>
    </>
  );
}

function Staff({ search }: { search: string }) {
  const { data, error, reload } = useData(async () => {
    let query = supabase.from("profiles").select("id, full_name, email, role, organisations(name)").in("role", STAFF).order("role").order("full_name");
    if (search) query = query.or(`email.ilike.${like(search)},full_name.ilike.${like(search)}`);
    const [staff, orgs] = await Promise.all([query.then(must), supabase.from("organisations").select("id, name").order("name").then(must)]);
    return { staff, orgs };
  }, [search]);
  const setRole = async (userId: string, role: string) => {
    if (!confirm(`Change this person's role to ${roleLabel[role]}?`)) return;
    try {
      await fn("admin", { action: "set_role", userId, role });
      reload();
    } catch (e) {
      alert((e as Error).message);
    }
  };
  return (
    <Loaded data={data} error={error}>
      {({ staff, orgs }) => (
        <>
          <AddStaff orgs={orgs} onDone={reload} />
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>School</th><th>Role</th></tr></thead>
              <tbody>
                {staff.map((p: any) => (
                  <tr key={p.id}>
                    <td>{p.full_name ?? "—"}</td>
                    <td>{p.email}</td>
                    <td>{p.organisations?.name ?? "FinFun"}</td>
                    <td>
                      <select value={p.role} onChange={(e) => setRole(p.id, e.target.value)} aria-label={`Role for ${p.email}`} style={{ width: "auto", minHeight: 34 }}>
                        {[...STAFF, "parent"].map((r) => <option key={r} value={r}>{roleLabel[r]}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Loaded>
  );
}

function AddStaff({ orgs, onDone }: { orgs: any[]; onDone: () => void }) {
  const { busy, error, run } = useAction();
  const add = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    run(async () => {
      await fn("admin", { action: "create_staff", email: f.get("email"), fullName: f.get("name"), role: f.get("role"), orgId: f.get("org") || undefined });
      form.reset();
      onDone();
    });
  };
  return (
    <details className="panel">
      <summary>Add staff member</summary>
      <div>
        <form className="stack" onSubmit={add}>
          <div className="fields">
            <label>Full name<input name="name" required /></label>
            <label>Email<input name="email" type="email" required /></label>
            <label>Role
              <select name="role" defaultValue="trainer">{STAFF.map((r) => <option key={r} value={r}>{roleLabel[r]}</option>)}</select>
            </label>
            <label>School (teachers and school admins)
              <select name="org"><option value="">FinFun</option>{orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
            </label>
          </div>
          <p className="fine" style={{ margin: 0 }}>They log in at this site with their email and a 6-digit code — no password to share.</p>
          <Notice kind="error">{error}</Notice>
          <div className="row end"><button className="btn" disabled={busy}>{busy ? "Adding…" : "Add staff member"}</button></div>
        </form>
      </div>
    </details>
  );
}
