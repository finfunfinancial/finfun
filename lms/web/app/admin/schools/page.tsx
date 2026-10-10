"use client";
import { useState } from "react";
import { Empty, Loaded, Notice, PageHead } from "@/components/ui";
import { fn, must, supabase } from "@/lib/supabase";
import { useAction, useData } from "@/lib/use-data";

type Slip = { name: string; username: string; pin: string };

// Schools and partners (SCH-1, SCH-2, ACC-5): organisations, class sections, bulk student logins.
export default function Schools() {
  const [slips, setSlips] = useState<{ section: string; students: Slip[] } | null>(null);
  const { data, error, reload } = useData(async () => {
    const [orgs, teachers] = await Promise.all([
      supabase.from("organisations").select("*, sections(id, grade, name, teacher_id, students(count))").order("name").then(must),
      supabase.from("profiles").select("id, full_name, email, org_id").in("role", ["teacher", "school_admin"]).then(must),
    ]);
    return { orgs, teachers };
  });

  if (slips) return <LoginSlips {...slips} onClose={() => setSlips(null)} />;

  return (
    <>
      <PageHead title="Schools and partners" sub="Add a school, its class sections, then import students to print their login slips." />
      <Loaded data={data} error={error}>
        {({ orgs, teachers }) => (
          <>
            <NewOrg onDone={reload} />
            {orgs.length ? orgs.map((o: any) => (
              <section key={o.id} className="card">
                <div className="spread">
                  <h2 style={{ margin: 0 }}>{o.name}</h2>
                  <span className="chip">{o.type}</span>
                </div>
                <p className="fine">{[o.district, o.state].filter(Boolean).join(", ")}</p>
                {o.sections.length ? (
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Section</th><th>Teacher</th><th className="num">Students</th><th>Import students</th></tr></thead>
                      <tbody>
                        {o.sections.sort((a: any, b: any) => a.grade - b.grade || a.name.localeCompare(b.name)).map((s: any) => (
                          <tr key={s.id}>
                            <td><strong>{s.name}</strong> · grade {s.grade}</td>
                            <td>
                              <TeacherPicker section={s} teachers={teachers.filter((t: any) => t.org_id === o.id)} onDone={reload} />
                            </td>
                            <td className="num">{s.students[0]?.count ?? 0}</td>
                            <td><Import section={s} onDone={(students) => { setSlips({ section: `${o.name} · ${s.name}`, students }); reload(); }} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <Empty>No sections yet.</Empty>}
                <NewSection orgId={o.id} onDone={reload} />
              </section>
            )) : <Empty>No schools yet.</Empty>}
            <p className="fine">Teachers and school admins are added on the People page (Staff), with their school picked.</p>
          </>
        )}
      </Loaded>
    </>
  );
}

function NewOrg({ onDone }: { onDone: () => void }) {
  const { busy, error, run } = useAction();
  const create = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    run(async () => {
      must(await supabase.from("organisations").insert({
        type: f.get("type"), name: String(f.get("name")).trim(),
        district: String(f.get("district")).trim() || null, state: String(f.get("state")).trim() || null,
      }));
      form.reset();
      onDone();
    });
  };
  return (
    <details className="panel">
      <summary>New school or partner</summary>
      <div>
        <form className="stack" onSubmit={create}>
          <div className="fields">
            <label>Name<input name="name" required /></label>
            <label>Type
              <select name="type"><option value="school">School</option><option value="csr">CSR funder</option><option value="government">Government</option></select>
            </label>
            <label>District<input name="district" /></label>
            <label>State<input name="state" /></label>
          </div>
          <Notice kind="error">{error}</Notice>
          <div className="row end"><button className="btn" disabled={busy}>Add</button></div>
        </form>
      </div>
    </details>
  );
}

function NewSection({ orgId, onDone }: { orgId: string; onDone: () => void }) {
  const { busy, error, run } = useAction();
  const create = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    run(async () => {
      must(await supabase.from("sections").insert({ org_id: orgId, grade: Number(f.get("grade")), name: String(f.get("name")).trim() }));
      form.reset();
      onDone();
    });
  };
  return (
    <form className="row" onSubmit={create} style={{ marginTop: 14 }}>
      <input name="name" placeholder="Section name, e.g. 6A" required style={{ width: 200 }} />
      <select name="grade" defaultValue={6} aria-label="Grade" style={{ width: 120 }}>
        {[3, 4, 5, 6, 7, 8, 9, 10].map((g) => <option key={g} value={g}>Grade {g}</option>)}
      </select>
      <button className="btn white" disabled={busy}>Add section</button>
      <Notice kind="error">{error}</Notice>
    </form>
  );
}

function TeacherPicker({ section, teachers, onDone }: { section: any; teachers: any[]; onDone: () => void }) {
  if (!teachers.length) return <span className="fine">Add a teacher on People</span>;
  const change = async (teacherId: string) => {
    const { error } = await supabase.from("sections").update({ teacher_id: teacherId || null }).eq("id", section.id);
    if (error) alert(error.message);
    onDone();
  };
  return (
    <select value={section.teacher_id ?? ""} onChange={(e) => change(e.target.value)} aria-label="Teacher" style={{ width: "auto", minHeight: 34 }}>
      <option value="">None</option>
      {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name ?? t.email}</option>)}
    </select>
  );
}

/** Paste one student per line: "First name" (uses the section's grade) or "First name, grade". */
function Import({ section, onDone }: { section: any; onDone: (students: Slip[]) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const { busy, error, run } = useAction();
  const go = () => run(async () => {
    const rows = text.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
      const [firstName, grade] = l.split(/[,\t]/).map((x) => x.trim());
      return { firstName: firstName.split(/\s+/)[0], grade: Number(grade) || section.grade }; // first names only (DPDP)
    });
    if (!rows.length) throw new Error("Paste at least one name.");
    const { students } = await fn<{ students: Slip[] }>("admin", { action: "import_students", sectionId: section.id, rows });
    setText("");
    setOpen(false);
    onDone(students);
  });
  if (!open) return <button className="btn white sm" onClick={() => setOpen(true)}>Import…</button>;
  return (
    <div className="stack" style={{ minWidth: 260 }}>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={"One per line:\nAarav\nDiya, 7"} rows={6} />
      <span className="fine">First names only. Surnames are dropped to protect children's data.</span>
      <Notice kind="error">{error}</Notice>
      <div className="row">
        <button className="btn sm" onClick={go} disabled={busy}>{busy ? "Creating logins…" : "Create logins"}</button>
        <button className="link" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </div>
  );
}

function LoginSlips({ section, students, onClose }: { section: string; students: Slip[]; onClose: () => void }) {
  return (
    <>
      <div className="no-print">
        <PageHead title="Login slips" sub={`${section} · ${students.length} students. Print now: PINs are not shown again.`}>
          <button className="btn" onClick={() => window.print()}>Print</button>
          <button className="btn white" onClick={onClose}>Done</button>
        </PageHead>
      </div>
      <div className="grid">
        {students.map((s) => (
          <div key={s.username} className="card" style={{ boxShadow: "none", breakInside: "avoid" }}>
            <h3>{s.name}</h3>
            <p style={{ margin: 0 }}>Go to <strong>{typeof window !== "undefined" ? window.location.host : ""}</strong> → Student</p>
            <p style={{ margin: "6px 0 0" }}>Username <span className="secret">{s.username}</span></p>
            <p style={{ margin: "6px 0 0" }}>PIN <span className="secret">{s.pin}</span></p>
          </div>
        ))}
      </div>
    </>
  );
}
