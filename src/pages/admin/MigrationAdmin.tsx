import { useState } from "react";
import { Database, Download, RefreshCw, ShieldCheck } from "lucide-react";
import {
  buildMigrationPayload,
  downloadMigrationPayload,
  importMigrationViaApi,
  MigrationApiError,
  type MigrationApiResult,
  type MigrationPayload,
  validateMigrationPayload,
  validateMigrationViaApi,
} from "../../services/migrationExport";

function formatCounts(counts: Record<string, number> | undefined): string[] {
  if (!counts) return [];
  return Object.entries(counts).map(([key, value]) => `${key.replaceAll("_", " ")}: ${value}`);
}

export default function MigrationAdmin() {
  const [payload, setPayload] = useState<MigrationPayload | null>(null);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [result, setResult] = useState<MigrationApiResult | null>(null);
  const [error, setError] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  const preparePayload = (): MigrationPayload | null => {
    try {
      const nextPayload = buildMigrationPayload();
      const localValidation = validateMigrationPayload(nextPayload);
      if (!localValidation.valid) {
        setError(localValidation.errors.join(" "));
        return null;
      }
      setPayload(nextPayload);
      setCounts(localValidation.counts);
      setResult(null);
      setError("");
      return nextPayload;
    } catch (migrationError) {
      setError(migrationError instanceof Error ? migrationError.message : "The migration payload could not be prepared.");
      return null;
    }
  };

  const handleValidate = async () => {
    const nextPayload = payload ?? preparePayload();
    if (!nextPayload) return;

    setIsWorking(true);
    setError("");
    try {
      const response = await validateMigrationViaApi(nextPayload);
      setResult(response);
    } catch (migrationError) {
      setError(migrationError instanceof MigrationApiError ? migrationError.message : "The migration validation failed.");
    } finally {
      setIsWorking(false);
    }
  };

  const handleImport = async () => {
    const nextPayload = payload ?? preparePayload();
    if (!nextPayload) return;

    setIsWorking(true);
    setError("");
    try {
      // Validate against MySQL immediately before importing. The PHP endpoint
      // performs additive ID-based upserts inside its existing transaction.
      await validateMigrationViaApi(nextPayload);
      const response = await importMigrationViaApi(nextPayload);
      setResult(response);
    } catch (migrationError) {
      setError(migrationError instanceof MigrationApiError ? migrationError.message : "The migration import failed.");
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-2xl border border-white/10 bg-[#0B241F] p-6 text-white shadow-xl md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#123832] text-[#7FF5DE]">
            <Database size={24} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">CMS Data Migration</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-300">
              Prepare the original browser/static CMS records and safely upsert them into PHP/MySQL. This migration never deletes records that are absent from the export.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-amber-300/30 bg-amber-950/20 p-4 text-sm leading-relaxed text-amber-100">
          <strong>Data safety:</strong> review the counts, run validation first, and keep a copy of the downloaded JSON. The import is additive and ID/slug-aware; it does not replace the collections.
        </div>

        {error && (
          <p role="alert" className="mt-6 rounded-xl border border-red-300/40 bg-red-950/30 px-4 py-3 text-sm font-medium text-red-200">
            {error}
          </p>
        )}

        {counts && (
          <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {formatCounts(counts).map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-black/10 px-3 py-2 text-xs capitalize text-gray-200">
                {item}
              </div>
            ))}
          </div>
        )}

        {result && (
          <div role="status" className="mt-6 rounded-xl border border-emerald-300/30 bg-emerald-950/25 p-4 text-sm text-emerald-100">
            <p className="font-semibold">{result.message || (result.imported ? "Migration imported." : "Migration validated.")}</p>
            {result.created && <p className="mt-1">Created: {formatCounts(result.created).join(" · ")}</p>}
            {result.updated && <p className="mt-1">Updated: {formatCounts(result.updated).join(" · ")}</p>}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={preparePayload}
            disabled={isWorking}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} /> Prepare export
          </button>
          <button
            type="button"
            onClick={() => {
              try {
                downloadMigrationPayload();
              } catch (downloadError) {
                setError(downloadError instanceof Error ? downloadError.message : "The migration backup could not be downloaded.");
              }
            }}
            disabled={isWorking}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download size={16} /> Download JSON backup
          </button>
          <button
            type="button"
            onClick={() => void handleValidate()}
            disabled={isWorking}
            className="inline-flex items-center gap-2 rounded-xl bg-[#14B8A6] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0d9488] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShieldCheck size={16} /> Validate against MySQL
          </button>
          <button
            type="button"
            onClick={() => void handleImport()}
            disabled={isWorking}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0D2B24] transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isWorking ? "Working..." : "Import additive records"}
          </button>
        </div>
      </div>
    </div>
  );
}
