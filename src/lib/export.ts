import type { Model, ExportMeta } from "@/types";

// ── CSV helpers ──

/** Escape a CSV field: wrap in quotes if it contains comma, quote, or newline */
function escapeCSVField(value: string): string {
  if (
    value.includes(",") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Parse a single CSV row respecting quoted fields */
function parseCSVRow(row: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < row.length) {
    const ch = row[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < row.length && row[i + 1] === '"') {
          current += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        current += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ",") {
        fields.push(current);
        current = "";
        i++;
      } else {
        current += ch;
        i++;
      }
    }
  }
  fields.push(current);
  return fields;
}

// ── Export functions ──

/**
 * Export models to CSV format.
 * First line is a comment with meta info, followed by header and data rows.
 */
export function exportToCSV(
  models: Model[],
  meta: ExportMeta,
  dimensions: string[]
): string {
  const lines: string[] = [];

  // Meta comment line
  lines.push(
    `# source=${meta.source}, exportedAt=${meta.exportedAt}, dataLastUpdated=${meta.dataLastUpdated}`
  );

  // Header row
  const headers = [
    "id",
    "name",
    "vendor",
    "releaseDate",
    "paramSize",
    "openSource",
    ...dimensions,
  ];
  lines.push(headers.map(escapeCSVField).join(","));

  // Data rows
  for (const model of models) {
    const row = [
      model.id,
      model.name,
      model.vendor,
      model.releaseDate ?? "",
      model.paramSize ?? "",
      String(model.openSource),
      ...dimensions.map((dim) => {
        const score = model.scores[dim];
        return score != null ? String(score) : "";
      }),
    ];
    lines.push(row.map(escapeCSVField).join(","));
  }

  return lines.join("\n");
}

/**
 * Export models to JSON format with pretty printing.
 */
export function exportToJSON(models: Model[], meta: ExportMeta): string {
  return JSON.stringify({ meta, models }, null, 2);
}

// ── Parse functions ──

/**
 * Parse CSV back into Model objects and meta info.
 */
export function parseCSV(
  csv: string
): { models: Model[]; meta: Partial<ExportMeta> } {
  const lines = csv.split("\n").filter((line) => line !== "");
  const meta: Partial<ExportMeta> = {};
  let startIndex = 0;

  // Extract meta from comment line
  if (lines.length > 0 && lines[0].startsWith("#")) {
    const commentLine = lines[0].substring(1).trim();
    const pairs = commentLine.split(", ");
    for (const pair of pairs) {
      const eqIndex = pair.indexOf("=");
      if (eqIndex === -1) continue;
      const key = pair.substring(0, eqIndex).trim();
      const value = pair.substring(eqIndex + 1).trim();
      if (key === "source") meta.source = value;
      else if (key === "exportedAt") meta.exportedAt = value;
      else if (key === "dataLastUpdated") meta.dataLastUpdated = value;
    }
    startIndex = 1;
  }

  if (lines.length <= startIndex) {
    return { models: [], meta };
  }

  // Parse header
  const headers = parseCSVRow(lines[startIndex]);
  startIndex++;

  // Find dimension columns (everything after the 6 base fields)
  const baseFields = ["id", "name", "vendor", "releaseDate", "paramSize", "openSource"];
  const dimensionNames = headers.slice(baseFields.length);

  // Parse data rows
  const models: Model[] = [];
  for (let i = startIndex; i < lines.length; i++) {
    const fields = parseCSVRow(lines[i]);
    if (fields.length < baseFields.length) continue;

    const scores: Record<string, number | null> = {};
    for (let d = 0; d < dimensionNames.length; d++) {
      const raw = fields[baseFields.length + d] ?? "";
      scores[dimensionNames[d]] = raw === "" ? null : Number(raw);
    }

    models.push({
      id: fields[0],
      name: fields[1],
      vendor: fields[2],
      releaseDate: fields[3] === "" ? null : fields[3],
      paramSize: fields[4] === "" ? null : fields[4],
      openSource: fields[5] === "true",
      scores,
    });
  }

  return { models, meta };
}

/**
 * Parse JSON export back into Model objects and meta.
 */
export function parseExportJSON(
  json: string
): { models: Model[]; meta: ExportMeta } {
  const parsed = JSON.parse(json);
  return { models: parsed.models, meta: parsed.meta };
}
