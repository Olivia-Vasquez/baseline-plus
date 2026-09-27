import { describe, expect, it } from "vitest";
import { requiredCsvHeaders, validateAndParseCsvRows, validateCsvHeaders } from "./csvImportValidation";

describe("validateCsvHeaders", () => {
  it("returns no errors when headers match exactly", () => {
    expect(validateCsvHeaders([...requiredCsvHeaders])).toEqual([]);
  });

  it("errors when a required header is missing", () => {
    const fields = requiredCsvHeaders.filter((header) => header !== "readinessScore");
    expect(validateCsvHeaders(fields)).toHaveLength(1);
  });

  it("errors when there is an unexpected extra header", () => {
    expect(validateCsvHeaders([...requiredCsvHeaders, "extraColumn"])).toHaveLength(1);
  });

  it("errors when headers are in a different set entirely", () => {
    expect(validateCsvHeaders(["foo", "bar"])).toHaveLength(1);
  });
});

describe("validateAndParseCsvRows", () => {
  const validRow = {
    date: "2026-01-01",
    steps: "1000",
    moveCalories: "200",
    restMinutes: "30",
    breatheMinutes: "10",
    readinessScore: "80",
  };

  it("parses a single valid row with no errors", () => {
    const { errors, parsedMetrics } = validateAndParseCsvRows([validRow], new Set());
    expect(errors).toEqual([]);
    expect(parsedMetrics).toHaveLength(1);
    expect(parsedMetrics[0]).toMatchObject({ date: "2026-01-01", steps: 1000, moveCalories: 200 });
  });

  it("rejects an invalid calendar date", () => {
    const { errors, parsedMetrics } = validateAndParseCsvRows(
      [{ ...validRow, date: "2026-02-30" }],
      new Set(),
    );
    expect(errors[0]).toMatch(/real date/);
    expect(parsedMetrics).toHaveLength(0);
  });

  it("rejects a malformed date string", () => {
    const { errors } = validateAndParseCsvRows([{ ...validRow, date: "01/01/2026" }], new Set());
    expect(errors[0]).toMatch(/YYYY-MM-DD/);
  });

  it("rejects negative or non-integer numeric fields", () => {
    const { errors } = validateAndParseCsvRows([{ ...validRow, steps: "-5" }], new Set());
    expect(errors.some((e) => e.includes("steps must be a non-negative whole number"))).toBe(true);
  });

  it("rejects a non-numeric field", () => {
    const { errors } = validateAndParseCsvRows([{ ...validRow, moveCalories: "abc" }], new Set());
    expect(errors.some((e) => e.includes("moveCalories"))).toBe(true);
  });

  it("rejects readinessScore above 100", () => {
    const { errors } = validateAndParseCsvRows([{ ...validRow, readinessScore: "150" }], new Set());
    expect(errors.some((e) => e.includes("readinessScore must be between 0 and 100"))).toBe(true);
  });

  it("rejects a date that already exists in the database", () => {
    const { errors, parsedMetrics } = validateAndParseCsvRows([validRow], new Set(["2026-01-01"]));
    expect(errors.some((e) => e.includes("already exists"))).toBe(true);
    expect(parsedMetrics).toHaveLength(0);
  });

  it("rejects duplicate dates within the same file", () => {
    const { errors, parsedMetrics } = validateAndParseCsvRows([validRow, validRow], new Set());
    expect(errors.some((e) => e.includes("appears more than once"))).toBe(true);
    expect(parsedMetrics).toHaveLength(1);
  });

  it("parses multiple valid rows with distinct dates", () => {
    const { errors, parsedMetrics } = validateAndParseCsvRows(
      [validRow, { ...validRow, date: "2026-01-02" }],
      new Set(),
    );
    expect(errors).toEqual([]);
    expect(parsedMetrics).toHaveLength(2);
  });
});
