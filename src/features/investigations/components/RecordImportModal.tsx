"use client";

import React, { useState, useRef, useId } from "react";
import {
  parseRecords,
  RECORD_CATEGORIES,
  CATEGORY_LABELS,
  SAMPLE_DATA_SNIPPETS,
  type RecordCategory,
  type ParseResult,
  type ValidatedRecord,
} from "../lib/recordParser";

export interface RecordImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newRecords: ValidatedRecord[]) => void;
  existingRecordIds: Set<string>;
}

export function RecordImportModal({
  isOpen,
  onClose,
  onImport,
  existingRecordIds,
}: RecordImportModalProps) {
  const [activeTab, setActiveTab] = useState<"file" | "paste">("file");
  const [fileContent, setFileContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [defaultCategory, setDefaultCategory] = useState<RecordCategory>("invoices");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate unique IDs for accessibility
  const titleId = useId();
  const fileInputId = useId();
  const pasteAreaId = useId();
  const categorySelectId = useId();

  if (!isOpen) {
    return null;
  }

  const handleReset = () => {
    setFileContent("");
    setFileName("");
    setParseResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const processContent = (content: string, name: string, cat?: RecordCategory) => {
    setFileContent(content);
    setFileName(name);
    const result = parseRecords(content, {
      fileName: name,
      defaultCategory: cat || defaultCategory,
      existingRecordIds,
    });
    setParseResult(result);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processContent(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processContent(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = (sample: (typeof SAMPLE_DATA_SNIPPETS)[0]) => {
    const name = sample.format === "json" ? "sample_evidence.json" : "sample_records.csv";
    const cat = sample.defaultCategory || defaultCategory;
    if (sample.defaultCategory) {
      setDefaultCategory(sample.defaultCategory);
    }
    processContent(sample.content, name, cat);
    setActiveTab("paste");
  };

  const handlePasteChange = (text: string) => {
    const guessedName = text.trim().startsWith("{") || text.trim().startsWith("[") ? "pasted_data.json" : "pasted_data.csv";
    processContent(text, guessedName);
  };

  const handleCategoryChange = (cat: RecordCategory) => {
    setDefaultCategory(cat);
    if (fileContent) {
      const result = parseRecords(fileContent, {
        fileName: fileName || "pasted_records.csv",
        defaultCategory: cat,
        existingRecordIds,
      });
      setParseResult(result);
    }
  };

  const handleConfirmImport = () => {
    if (!parseResult || parseResult.valid_records.length === 0) return;
    onImport(parseResult.valid_records);
    handleReset();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="bg-[var(--surface)] w-full max-w-2xl rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-muted)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold text-xs shadow-xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <h2 id={titleId} className="text-base font-bold text-[var(--text)] tracking-tight">
                Import Commercial Records
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Import structured JSON or CSV records into your local Evidence Inventory.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close import dialog"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[var(--text)] flex-1">
          {/* Top Controls: Input Mode Tabs & Sample Loaders */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-[var(--border)]">
            <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200/70">
              <button
                type="button"
                onClick={() => setActiveTab("file")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeTab === "file"
                    ? "bg-white text-[var(--primary)] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Upload File (.json / .csv)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("paste")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeTab === "paste"
                    ? "bg-white text-[var(--primary)] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Direct Paste / Editor
              </button>
            </div>

            {/* Quick Test Data Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[var(--text-muted)] font-medium">Load Preset:</span>
              {SAMPLE_DATA_SNIPPETS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLoadSample(s)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-mono text-slate-700 border border-slate-200 transition-colors"
                  title={`Load ${s.label}`}
                >
                  {s.label.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Fallback Category Selector for single-category CSV files */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label htmlFor={categorySelectId} className="font-semibold text-slate-800 block">
                Target Record Category (for CSV)
              </label>
              <span className="text-[11px] text-slate-500">
                Used if the CSV does not have a <code>record_category</code> column.
              </span>
            </div>
            <select
              id={categorySelectId}
              value={defaultCategory}
              onChange={(e) => handleCategoryChange(e.target.value as RecordCategory)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            >
              {RECORD_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          {/* Tab 1: Drag & Drop File Zone */}
          {activeTab === "file" && (
            <div>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragOver
                    ? "border-[var(--primary)] bg-blue-50/50"
                    : "border-slate-300 hover:border-slate-400 bg-slate-50/40"
                }`}
              >
                <input
                  id={fileInputId}
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-blue-100 text-[var(--primary)] mx-auto flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  {fileName ? (
                    <span className="font-mono text-[var(--primary)]">{fileName}</span>
                  ) : (
                    "Click to browse or drop your JSON or CSV file here"
                  )}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supports Purchase Orders, Invoices, Dispatches, PODs, Payments, and Credit Notes
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Direct Paste / Raw Editor */}
          {activeTab === "paste" && (
            <div className="space-y-1.5">
              <label htmlFor={pasteAreaId} className="font-semibold text-slate-800 flex items-center justify-between">
                <span>Raw Content (JSON or CSV)</span>
                {fileName && <span className="font-mono text-[11px] text-slate-500">{fileName}</span>}
              </label>
              <textarea
                id={pasteAreaId}
                rows={6}
                value={fileContent}
                onChange={(e) => handlePasteChange(e.target.value)}
                placeholder='Paste raw JSON collection or CSV rows here...'
                className="w-full font-mono text-xs rounded-xl border border-[var(--border-strong)] p-3 bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-slate-800"
              />
            </div>
          )}

          {/* Validation Analysis Box */}
          {parseResult && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[var(--text)]">Validation Results</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                    Format: {parseResult.file_format}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span>Total: <strong>{parseResult.total_rows}</strong></span>
                  <span>•</span>
                  <span className="text-[var(--success)]">Valid: <strong>{parseResult.valid_count}</strong></span>
                  <span>•</span>
                  <span className={parseResult.invalid_count > 0 ? "text-[var(--danger)]" : "text-slate-400"}>
                    Rejected: <strong>{parseResult.invalid_count}</strong>
                  </span>
                </div>
              </div>

              {/* Global Error Banner */}
              {parseResult.error_message && (
                <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-900 space-y-1">
                  <span className="font-semibold text-xs flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-rose-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    File Parsing Error
                  </span>
                  <p className="text-xs text-rose-800">{parseResult.error_message}</p>
                </div>
              )}

              {/* Category Breakdown Chips */}
              {parseResult.valid_count > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
                    Valid Categories:
                  </span>
                  {RECORD_CATEGORIES.map((cat) => {
                    const count = parseResult.category_counts[cat];
                    if (count === 0) return null;
                    return (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 font-mono text-[11px]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{CATEGORY_LABELS[cat]}:</span>
                        <strong className="text-[var(--primary)]">{count}</strong>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Row-Level Errors Report (Safeguard 1: Partial Imports) */}
              {parseResult.rejected_rows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-rose-800 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Rejected Rows Breakdown ({parseResult.rejected_rows.length})
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      Valid rows can still be imported
                    </span>
                  </div>

                  <div className="max-h-36 overflow-y-auto rounded-lg border border-rose-200 bg-rose-50/40 divide-y divide-rose-100 font-mono text-[11px]">
                    {parseResult.rejected_rows.map((rej, idx) => (
                      <div key={idx} className="p-2 flex items-start justify-between gap-3 text-rose-900">
                        <div>
                          <span className="font-bold text-rose-700 mr-2">Row {rej.row}:</span>
                          {rej.record_id && (
                            <span className="font-semibold text-slate-800 mr-2">[{rej.record_id}]</span>
                          )}
                          <span className="font-sans text-rose-800">{rej.message}</span>
                        </div>
                        {rej.category && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-200/60 text-rose-900 text-[10px] uppercase font-bold flex-shrink-0">
                            {rej.category}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Validity vs Verification Disclosure (Safeguard 3) */}
              <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-[11px] text-blue-900 leading-relaxed">
                <span className="font-bold uppercase tracking-wider block text-[10px] text-blue-800 mb-0.5">
                  Audit Standard Disclosure
                </span>
                Passing schema validation establishes that record attributes conform to ProofTrail specifications. It does NOT constitute independent verification of claims, proof of delivery, or balance deductions.
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-muted)] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:bg-slate-50 transition-colors font-medium"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {parseResult && parseResult.valid_count > 0 && (
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-4 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                {parseResult.invalid_count > 0
                  ? `Import ${parseResult.valid_count} Valid Record(s) (Skip ${parseResult.invalid_count})`
                  : `Import All ${parseResult.valid_count} Record(s)`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
