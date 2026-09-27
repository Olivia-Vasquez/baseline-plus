"use client";

import { useState, type ChangeEvent } from "react";
import Papa from "papaparse";
import Link from "next/link";
import { useDailyMetrics } from "@/lib/useDailyMetrics";
import type { DailyMetrics } from "@/types/metrics";
import { requiredCsvHeaders, validateAndParseCsvRows, validateCsvHeaders } from "@/lib/csvImportValidation";
import styles from "./page.module.css";

const downloadTemplate = () => {
  const csv = `${requiredCsvHeaders.join(",")}\n`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "baseline-metrics-template.csv";
  link.click();
  URL.revokeObjectURL(url);
};

export default function ImportDataPage() {
  const { metrics: existingMetrics, loading, error: databaseError, refresh } = useDailyMetrics();
  const [selectedFile, setSelectedFile] = useState("");
  const [preview, setPreview] = useState<DailyMetrics[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setPreview([]);
    setErrors([]);
    setSuccessMessage("");
    setSelectedFile(file?.name ?? "");

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setErrors(["Choose a CSV file to continue."]);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(["This file is larger than 5 MB. Split it into smaller CSV files and try again."]);
      return;
    }

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header) => header.trim(),
      complete: (result) => {
        const validationErrors: string[] = [];
        const fields = result.meta.fields ?? [];
        validationErrors.push(...validateCsvHeaders(fields));

        if (result.errors.length) {
          validationErrors.push(...result.errors.slice(0, 5).map((error) =>
            `CSV parse error${error.row === undefined ? "" : ` on row ${error.row + 2}`}: ${error.message}`,
          ));
        }

        const existingDates = new Set(existingMetrics.map((metric) => metric.date));
        const { errors: rowErrors, parsedMetrics } = validateAndParseCsvRows(result.data, existingDates);
        validationErrors.push(...rowErrors);

        if (!result.data.length) {
          validationErrors.push("The CSV has a header but no data rows.");
        }

        if (validationErrors.length) {
          setErrors(validationErrors.slice(0, 10));
          return;
        }

        setPreview(parsedMetrics);
      },
      error: (error) => setErrors([`Could not read the CSV file: ${error.message}`]),
    });
  };

  const handleImport = async () => {
    try {
      const response = await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preview),
      });
      const result = await response.json() as { inserted?: number; error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "The records could not be imported.");
      }

      setSuccessMessage(`${result.inserted ?? preview.length} ${preview.length === 1 ? "record" : "records"} added to PostgreSQL.`);
      setPreview([]);
      setSelectedFile("");
      refresh();
    } catch (importError) {
      setErrors([importError instanceof Error ? importError.message : "The records could not be imported."]);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <Link className={styles.backLink} href="/home">Back to dashboard</Link>

        <header className={styles.header}>
          <p className={styles.eyebrow}>DATA MANAGEMENT</p>
          <h1>Import data</h1>
          <p className={styles.description}>
            Add daily metric records to your existing Baseline data.
          </p>
        </header>

        <section className={styles.importPanel} aria-labelledby="upload-title">
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.eyebrow}>CSV FILE</p>
              <h2 id="upload-title">Choose a data file</h2>
            </div>
            <button className={styles.templateButton} type="button" onClick={downloadTemplate}>
              Download CSV template
            </button>
          </div>

          <label className={styles.filePicker}>
            <span className={styles.filePickerTitle}>{selectedFile || "Select a CSV file"}</span>
            <span className={styles.filePickerHelp}>
              {loading ? "Connecting to PostgreSQL..." : databaseError || "CSV only, up to 5 MB"}
            </span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              disabled={loading || Boolean(databaseError)}
            />
          </label>

          <div className={styles.formatInfo}>
            <h3>Required columns</h3>
            <code>{requiredCsvHeaders.join(", ")}</code>
            <p>
              Dates use YYYY-MM-DD. Metric values must be non-negative whole numbers;
              readinessScore must be from 0 to 100. Dates already in your data are rejected.
            </p>
          </div>

          {errors.length > 0 && (
            <div className={styles.errorBox} role="alert">
              <h3>File needs attention</h3>
              <ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul>
            </div>
          )}

          {preview.length > 0 && (
            <div className={styles.preview}>
              <div className={styles.previewHeading}>
                <div>
                  <h3>Ready to import</h3>
                  <p>{preview.length} valid records. Existing records will be kept.</p>
                </div>
                <button className={styles.importButton} type="button" onClick={handleImport}>
                  Add records
                </button>
              </div>
              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Steps</th>
                      <th>Move kcal</th>
                      <th>Rest min</th>
                      <th>Breathwork min</th>
                      <th>Readiness</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((metric) => (
                      <tr key={metric.date}>
                        <td>{metric.date}</td>
                        <td>{metric.steps.toLocaleString("en-US")}</td>
                        <td>{metric.moveCalories}</td>
                        <td>{metric.restMinutes}</td>
                        <td>{metric.breatheMinutes}</td>
                        <td>{metric.readinessScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {successMessage && (
            <p className={styles.successMessage} role="status">
              {successMessage} <Link href="/home">View dashboard</Link>
            </p>
          )}
        </section>
      </div>
    </main>
  );
}