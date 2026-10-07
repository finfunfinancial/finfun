export type LeadType = "partnership" | "report" | "enrol";

export const REQUIRED: Record<LeadType, string[]> = {
  partnership: ["name", "role", "organisation", "city", "state", "students", "phone", "email"],
  report: ["name", "email"],
  enrol: ["program", "parentName", "email", "phone", "childName", "grade", "school", "city", "consent"],
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+\d][\d\s-]{7,15}$/;

/** Returns an error message, or null if the lead is valid. Shared by the form and the API. */
export function validateLead(type: string, data: Record<string, string>): string | null {
  const req = REQUIRED[type as LeadType];
  if (!req) return "Unknown form.";
  const missing = req.filter((k) => !data[k]?.trim());
  if (missing.length) return "Please fill in all required fields.";
  if (data.email && !EMAIL.test(data.email)) return "Please enter a valid email address.";
  if (data.phone && !PHONE.test(data.phone)) return "Please enter a valid phone number.";
  if (Object.values(data).some((v) => v.length > 2000)) return "One of the fields is too long.";
  return null;
}
