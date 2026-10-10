"use client";
import { useState } from "react";
import { Empty, Loaded, Notice, PageHead, statusChip } from "@/components/lms/ui";
import { downloadCsv, when } from "@/lib/lms/format";
import { fn, must, supabase } from "@/lib/lms/supabase";
import { useAction, useData } from "@/lib/lms/use-data";

type Tab = "buyers" | "admins";

// Everyone with an account: buyers (and what they bought) and the admins who run FinFun.
export default function Users() {
  const [tab, setTab] = useState<Tab>("buyers");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  return (
    <>
      <PageHead title="Users" sub="Find a buyer by phone, email or name, and see what they bought." />
      <div className="spread" style={{ marginBottom: 16 }}>
        <div className="tabs" style={{ width: 300, margin: 0 }}>
          <button aria-pressed={tab === "buyers"} onClick={() => setTab("buyers")}>Buyers</button>
          <button aria-pressed={tab === "admins"} onClick={() => setTab("admins")}>Admins</button>
        </div>
        <form className="row" onSubmit={(e) => { e.preventDefault(); setSearch(q.trim()); }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" aria-label="Search" style={{ width: 240 }} />
          <button className="btn white">Search</button>
        </form>
      </div>
      {tab === "buyers" ? <Buyers search={search} /> : <Admins search={search} />}
    </>
  );
}

const like = (q: string) => `%${q.replace(/[%_,()]/g, "")}%`;
const phone = (p: string | null) => (p ? `+${p}` : "");

function Buyers({ search }: { search: string }) {
  const { data, error } = useData(() => {
    let query = supabase.from("profiles")
      .select("id, full_name, phone, email, created_at, guardian_links(students(first_name, grade, enrolments(status, programs(name), batches(name))))")
      .eq("role", "parent").order("created_at", { ascending: false }).limit(200);
    if (search) query = query.or(`phone.ilike.${like(search)},email.ilike.${like(search)},full_name.ilike.${like(search)}`);
    return query.then(must);
  }, [search]);

  const exportCsv = (rows: any[]) => downloadCsv("finfun-buyers.csv", rows.flatMap((p) =>
    p.guardian_links.flatMap((g: any) => g.students.enrolments.map((e: any) => ({
      joined: p.created_at, name: p.full_name ?? "", phone: phone(p.phone), email: p.email ?? "",
      child: g.students.first_name, grade: g.students.grade, course: e.programs.name, status: e.status, batch: e.batches?.name ?? "",
    })))));

  return (
    <Loaded data={data} error={error}>
      {(rows) => rows.length ? (
        <>
          <div className="row end" style={{ marginBottom: 10 }}><button className="btn white sm" onClick={() => exportCsv(rows)}>Export CSV</button></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Buyer</th><th>Child</th><th>Courses</th><th>Joined</th></tr></thead>
              <tbody>
                {rows.map((p: any) => (
                  <tr key={p.id}>
                    <td>{p.full_name && <><strong>{p.full_name}</strong><br /></>}{phone(p.phone) || p.email}</td>
                    <td>{p.guardian_links.map((g: any, i: number) => <div key={i}>{g.students.first_name} · grade {g.students.grade}</div>)}</td>
                    <td>
                      {p.guardian_links.flatMap((g: any) => g.students.enrolments).map((e: any, i: number) => (
                        <div key={i}>{e.programs.name}{e.batches ? ` · ${e.batches.name}` : ""} {statusChip(e.status)}</div>
                      ))}
                      {!p.guardian_links.some((g: any) => g.students.enrolments.length) && <span className="muted">Nothing yet</span>}
                    </td>
                    <td>{when(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : <Empty>No buyers found.</Empty>}
    </Loaded>
  );
}

function Admins({ search }: { search: string }) {
  const { data, error, reload } = useData(() => {
    let query = supabase.from("profiles").select("id, full_name, email").eq("role", "admin").order("full_name");
    if (search) query = query.or(`email.ilike.${like(search)},full_name.ilike.${like(search)}`);
    return query.then(must);
  }, [search]);
  const remove = async (userId: string, email: string) => {
    if (!confirm(`Remove admin access for ${email}? They keep a normal buyer account.`)) return;
    try {
      await fn("admin", { action: "set_role", userId, role: "parent" });
      reload();
    } catch (e) {
      alert((e as Error).message);
    }
  };
  return (
    <Loaded data={data} error={error}>
      {(admins) => (
        <>
          <AddAdmin onDone={reload} />
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th></th></tr></thead>
              <tbody>
                {admins.map((a: any) => (
                  <tr key={a.id}>
                    <td>{a.full_name ?? "—"}</td>
                    <td>{a.email}</td>
                    <td className="num"><button className="btn danger sm" onClick={() => remove(a.id, a.email)}>Remove admin</button></td>
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

function AddAdmin({ onDone }: { onDone: () => void }) {
  const { busy, error, run } = useAction();
  const add = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    run(async () => {
      await fn("admin", { action: "create_staff", email: f.get("email"), fullName: f.get("name"), role: "admin" });
      form.reset();
      onDone();
    });
  };
  return (
    <details className="panel">
      <summary>Add an admin</summary>
      <div>
        <form className="stack" onSubmit={add}>
          <div className="fields">
            <label>Full name<input name="name" required /></label>
            <label>Email<input name="email" type="email" required /></label>
          </div>
          <p className="fine" style={{ margin: 0 }}>They log in at finfun.club/login with this email and a 6-digit code.</p>
          <Notice kind="error">{error}</Notice>
          <div className="row end"><button className="btn" disabled={busy}>{busy ? "Adding…" : "Add admin"}</button></div>
        </form>
      </div>
    </details>
  );
}
