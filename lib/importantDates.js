/**
 * Important dates parsing + presentation helpers.
 *
 * Supports the human-friendly CMS format (important_dates_text):
 *
 *   Application Start: 01 August 2026
 *   Last Date: 01 September 2026
 *   Exam Date: 15 October 2026
 *
 * while remaining backward compatible with the legacy structured JSON
 * (important_dates) field.
 */

// "Label: value" lines; also tolerates "Label - value" and bullet lists.
const LINE_RE = /^\s*(?:[-*•]?\s*)([A-Za-z0-9 ./&()\-]+?)\s*[:\-\u2013]\s*(.+?)\s*$/;

function dotForLabel(label) {
  const l = label.toLowerCase();
  if (/(start|begin|released|release|out)/.test(l)) return { color: "bg-green-500" };
  if (/(last|end|close|deadline|final)/.test(l)) return { color: "bg-red-500" };
  if (/(exam|interview|admit|result|merit)/.test(l)) return { color: "bg-amber-400" };
  return { color: "bg-yellow-400" };
}

/** Parse `important_dates_text` into [{label, value, color}]. */
export function parseImportantDatesText(text) {
  if (!text || typeof text !== "string") return [];
  const rows = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const m = line.match(LINE_RE);
    if (!m) continue;
    const label = m[1].trim();
    rows.push({ label, value: m[2].trim(), ...dotForLabel(label) });
  }
  // Drop duplicate labels, keeping the first occurrence.
  const seen = new Set();
  return rows.filter((r) => {
    const key = r.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Legacy {"apply_start": "...", "exam": "..."} -> readable rows.
const LEGACY_LABELS = {
  apply_start: "Application Start",
  application_start: "Application Start",
  apply_end: "Last Date",
  application_end: "Application End",
  last_date: "Last Date",
  exam: "Exam Date",
  exam_date: "Exam Date",
  admit_card: "Admit Card Release",
  result: "Result Date",
  interview: "Interview Date",
};

function prettifyKey(key) {
  return (
    LEGACY_LABELS[key.toLowerCase()] ||
    key.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

/** Parse legacy JSON dates into the same row shape. */
export function parseImportantDatesJson(json) {
  if (!json || typeof json !== "object" || Array.isArray(json)) return [];
  return Object.entries(json)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([key, value]) => {
      const label = prettifyKey(key);
      return { label, value: String(value), ...dotForLabel(label) };
    });
}

/**
 * Combined view model for the Important Dates section. Text format wins
 * when present; structured JSON is the fallback for legacy records.
 */
export function buildImportantDates(text, json) {
  const fromText = parseImportantDatesText(text);
  if (fromText.length > 0) return fromText;
  return parseImportantDatesJson(json);
}
