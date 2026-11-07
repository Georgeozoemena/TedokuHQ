import { describe, expect, it } from "vitest";
import { CSV_COLUMNS, escapeCsvCell, eventToCsvLine, toCsvLine } from "@/lib/admin/csv";

describe("escapeCsvCell", () => {
  it("prefixes formula starters with an apostrophe", () => {
    for (const s of ["=SUM(A1)", "+1", "-1", "@cmd", "\tx", "\rx"]) expect(escapeCsvCell(s).replace(/^"/, "")).toMatch(/^'/);
    expect(escapeCsvCell("=HYPERLINK(\"http://x\")")).toBe('"\'=HYPERLINK(""http://x"")"');
  });
  it("quotes commas, quotes and line breaks", () => {
    expect(escapeCsvCell("a,b")).toBe('"a,b"');
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvCell("a\nb")).toBe('"a\nb"');
  });
  it("leaves normal values alone and turns null into empty", () => {
    expect(escapeCsvCell("example.com")).toBe("example.com");
    expect(escapeCsvCell(null)).toBe("");
    expect(escapeCsvCell(true)).toBe("true");
    expect(escapeCsvCell(12)).toBe("12");
  });
  it("only writes the safe columns, never identifiers", () => {
    expect(CSV_COLUMNS).not.toContain("visitor_id");
    expect(CSV_COLUMNS).not.toContain("ip_hash");
    const line = eventToCsvLine({ created_at: "t", country: "NG", utm_source: "=1+1", visitor_id: "secret" } as never);
    expect(line).not.toContain("secret");
    expect(line).toContain("'=1+1");
  });
  it("ends lines with CRLF", () => expect(toCsvLine(["a", "b"])).toBe("a,b\r\n"));
});
