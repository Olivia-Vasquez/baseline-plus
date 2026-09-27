import type { DailyMetrics } from "@/types/metrics";

export const requiredCsvHeaders = [
  "date",
  "steps",
  "moveCalories",
  "restMinutes",
  "breatheMinutes",
  "readinessScore",
] as const;

export const makeImportedMetric = (row: Record<string, string>, rowNumber: number): DailyMetrics => {
  const date = row.date.trim();
  const steps = Number(row.steps);
  const moveCalories = Number(row.moveCalories);
  const restMinutes = Number(row.restMinutes);
  const breatheMinutes = Number(row.breatheMinutes);
  const readinessScore = Number(row.readinessScore);

  return {
    date,
    source: "import",
    steps,
    moveCalories,
    restMinutes,
    breatheMinutes,
    readinessScore,
    activities: [{
      id: `${date}-imported-move-${rowNumber}`,
      name: "Imported activity total",
      durationMinutes: 0,
      calories: moveCalories,
    }],
    stepActivities: [{
      id: `${date}-imported-steps-${rowNumber}`,
      name: "Imported step total",
      durationMinutes: 0,
      steps,
    }],
    restPeriods: [{
      id: `${date}-imported-rest-${rowNumber}`,
      name: "Imported rest total",
      durationMinutes: restMinutes,
    }],
    breathworkSessions: [{
      id: `${date}-imported-breathwork-${rowNumber}`,
      name: "Imported breathwork total",
      durationMinutes: breatheMinutes,
    }],
  };
};

export const validateCsvHeaders = (fields: string[]): string[] => {
  const missingHeaders = requiredCsvHeaders.filter((header) => !fields.includes(header));
  const unexpectedHeaders = fields.filter((header) => !(requiredCsvHeaders as readonly string[]).includes(header));

  if (missingHeaders.length || unexpectedHeaders.length || fields.length !== requiredCsvHeaders.length) {
    return [`Headers must be exactly: ${requiredCsvHeaders.join(", ")}.`];
  }

  return [];
};

export const validateAndParseCsvRows = (
  rows: Record<string, string>[],
  existingDates: Set<string>,
): { errors: string[]; parsedMetrics: DailyMetrics[] } => {
  const validationErrors: string[] = [];
  const incomingDates = new Set<string>();
  const parsedMetrics: DailyMetrics[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const date = row.date?.trim() ?? "";
    const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? new Date(`${date}T00:00:00.000Z`)
      : null;
    const validDate = parsedDate !== null
      && Number.isFinite(parsedDate.getTime())
      && parsedDate.toISOString().slice(0, 10) === date;

    if (!validDate) {
      validationErrors.push(`Row ${rowNumber}: date must be a real date in YYYY-MM-DD format.`);
    }

    const numericFields = requiredCsvHeaders.slice(1).map((header) => ({
      header,
      rawValue: row[header]?.trim() ?? "",
      value: Number(row[header]),
    }));

    for (const field of numericFields) {
      if (!field.rawValue || !Number.isSafeInteger(field.value) || field.value < 0) {
        validationErrors.push(`Row ${rowNumber}: ${field.header} must be a non-negative whole number.`);
      }
    }

    const readiness = numericFields.find((field) => field.header === "readinessScore")?.value;
    if (readiness !== undefined && readiness > 100) {
      validationErrors.push(`Row ${rowNumber}: readinessScore must be between 0 and 100.`);
    }

    if (date && existingDates.has(date)) {
      validationErrors.push(`Row ${rowNumber}: ${date} already exists in your data.`);
    }

    if (date && incomingDates.has(date)) {
      validationErrors.push(`Row ${rowNumber}: ${date} appears more than once in this file.`);
    }

    if (date) {
      incomingDates.add(date);
    }

    if (
      validDate
      && numericFields.every((field) => field.rawValue && Number.isSafeInteger(field.value) && field.value >= 0)
      && readiness !== undefined
      && readiness <= 100
      && !existingDates.has(date)
      && !parsedMetrics.some((metric) => metric.date === date)
    ) {
      parsedMetrics.push(makeImportedMetric(row, rowNumber));
    }
  });

  return { errors: validationErrors, parsedMetrics };
};
