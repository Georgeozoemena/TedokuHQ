// CSV helpers for the export. Two safety rules:
// 1) A cell that starts with = + - @ (or a tab / carriage return) could be run as a formula when the file is
//    opened in Excel or Google Sheets. Referrer and UTM values come from strangers, so we put an apostrophe in front.
// 2) Cells with commas, quotes or line breaks are wrapped in quotes, with inner quotes doubled.
// No identifiers (visitor id, ip hash, row id) are ever exported.

export type CsvValue = string | number | boolean | null | undefined;

export const CSV_COLUMNS = [
  "created_at",
  "country",
  "device_type",
  "os",
  "browser",
  "referrer_host",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "button_location",
  "is_bot",
] as const;

export function escapeCsvCell(value: CsvValue): string {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[",\r\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsvLine(values: CsvValue[]): string {
  return values.map(escapeCsvCell).join(",") + "\r\n";
}

export function csvHeaderLine(): string {
  return toCsvLine([...CSV_COLUMNS]);
}

export function eventToCsvLine(row: Partial<Record<(typeof CSV_COLUMNS)[number], CsvValue>>): string {
  return toCsvLine(CSV_COLUMNS.map((c) => row[c]));
}
