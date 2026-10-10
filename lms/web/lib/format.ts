const IST = { timeZone: "Asia/Kolkata" } as const;

export const inr = (paise: number) =>
  "₹" + (paise / 100).toLocaleString("en-IN", { minimumFractionDigits: paise % 100 ? 2 : 0, maximumFractionDigits: 2 });

export const day = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { ...IST, weekday: "short", day: "numeric", month: "short" });

/** "10 October 2026" — for certificates and anything kept long-term. */
export const longDay = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { ...IST, day: "numeric", month: "long", year: "numeric" });

export const time = (iso: string) => new Date(iso).toLocaleTimeString("en-IN", { ...IST, hour: "numeric", minute: "2-digit" });

export const when = (iso: string) => `${day(iso)}, ${time(iso)}`;

/** Today's date in IST as YYYY-MM-DD. */
export const istToday = () => new Date().toLocaleDateString("en-CA", IST);

/** Midnight IST of a YYYY-MM-DD date, as an ISO timestamp for queries. */
export const istMidnight = (ymd: string) => `${ymd}T00:00:00+05:30`;

/** Downloads rows as a CSV file (ADM-5). */
export function downloadCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const cell = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = name;
  a.click();
}

export const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "10:00:00" → "10:00 AM" */
export const clock = (hms: string) => {
  const [h, m] = hms.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

export const roleLabel: Record<string, string> = {
  parent: "Parent",
  student: "Student",
  trainer: "Trainer",
  school_admin: "School admin",
  teacher: "Teacher",
  partner_viewer: "Partner",
  admin: "FinFun admin",
};
