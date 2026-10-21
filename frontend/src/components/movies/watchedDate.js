// Watched-date handling shared by the add form and inline row editing.
// Users type DD/MM (current year) or DD/MM/YYYY; the backend stores ISO
// YYYY-MM-DD, or null when no date is given. Older rows may hold the text
// "Invalid date" (what the backend stored for blank dates) — treated as empty.

const pad = (n) => String(n).padStart(2, "0");

const isRealDate = (year, month, day) => {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

/**
 * Parses what the user typed.
 * Returns { valid: true, iso: "YYYY-MM-DD" | null } or { valid: false }.
 */
export const parseWatchedDate = (text) => {
  const value = (text ?? "").trim();
  if (!value || value === "Invalid date") return { valid: true, iso: null };

  let year, month, day;
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const slashed = value.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/);
  if (iso) {
    [year, month, day] = iso.slice(1).map(Number);
  } else if (slashed) {
    day = Number(slashed[1]);
    month = Number(slashed[2]);
    year = slashed[3] ? Number(slashed[3]) : new Date().getFullYear();
  } else {
    return { valid: false };
  }

  if (!isRealDate(year, month, day)) return { valid: false };
  return { valid: true, iso: `${year}-${pad(month)}-${pad(day)}` };
};

/** Stored ISO date → "DD/MM/YYYY" for an input field ("" when empty) */
export const toDateInput = (stored) => {
  const { valid, iso } = parseWatchedDate(stored);
  if (!valid || !iso) return "";
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
};

/** On blur: expand a valid entry to full DD/MM/YYYY; leave anything else as typed */
export const tidyDateInput = (text) => {
  const { valid, iso } = parseWatchedDate(text);
  return valid ? toDateInput(iso) : text;
};

export const DATE_HINT = "Use DD/MM or DD/MM/YYYY — or leave it empty";
