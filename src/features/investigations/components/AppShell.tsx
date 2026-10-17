"use client";

import React, { useState } from "react";
import { OverviewScreen } from "./OverviewScreen";
import { InvestigationListScreen } from "./InvestigationListScreen";
import { InvestigationDesk } from "./InvestigationDesk";
import { NewInvestigationWizard } from "./NewInvestigationWizard";
import { DataSourcesScreen } from "./DataSourcesScreen";
import { BenchmarkScreen } from "./BenchmarkScreen";
import { getCaseById } from "../lib/caseRegistry";

export type NavigationTab =
  | "overview"
  | "investigations"
  | "desk"
  | "new"
  | "data-sources"
  | "benchmark";

export function AppShell() {
  const [activeTab, setActiveTab] = useState<NavigationTab>("overview");
  const [selectedCaseId, setSelectedCaseId] = useState<string>("PT-2026-004");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeCase = getCaseById(selectedCaseId);

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveTab("desk");
  };

  const handleNavigate = (screen: string) => {
    if (screen === "new" || screen === "wizard") {
      setActiveTab("new");
    } else if (
      screen === "overview" ||
      screen === "investigations" ||
      screen === "desk" ||
      screen === "data-sources" ||
      screen === "benchmark"
    ) {
      setActiveTab(screen as NavigationTab);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg)] text-[var(--text)] font-sans antialiased">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[var(--sidebar)] text-white border-r border-slate-800 shrink-0">
        {/* Brand header */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center font-bold text-white text-base shadow-sm tracking-tight font-mono">
              PT
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight flex items-center gap-1.5 text-white">
                ProofTrail
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  v0.1
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none mt-0.5">
                Audit-Grade Dispute Engine
              </p>
            </div>
          </div>
        </div>

        {/* Primary CTA Button */}
        <div className="p-4 border-b border-slate-800/60">
          <button
            type="button"
            onClick={() => setActiveTab("new")}
            className="w-full py-2.5 px-3 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>+ New Investigation</span>
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "overview"
                ? "bg-[var(--primary)] text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("investigations")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "investigations"
                ? "bg-[var(--primary)] text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span>Investigations</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("desk")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "desk"
                ? "bg-[var(--primary)] text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Investigation Desk</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
              {activeCase ? activeCase.invoiceId : "INV-1048"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("data-sources")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "data-sources"
                ? "bg-[var(--primary)] text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
              />
            </svg>
            <span>Data Sources</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("benchmark")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "benchmark"
                ? "bg-[var(--primary)] text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span>Benchmark</span>
          </button>
        </nav>

        {/* Sidebar Footer Integrity Info */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-200">AIMPACT 2026 Engine</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Deterministic accounting rules · Grounded source citations
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Header */}
        <header className="h-16 border-b border-[var(--border)] bg-white px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500">ProofTrail</span>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-[var(--text)] uppercase tracking-wider text-[11px]">
                {activeTab === "overview" && "Overview"}
                {activeTab === "investigations" && "Investigations Catalog"}
                {activeTab === "desk" && `Investigation Desk · ${activeCase ? activeCase.invoiceId : "INV-1048"}`}
                {activeTab === "new" && "New Investigation Wizard"}
                {activeTab === "data-sources" && "Data Sources & Records"}
                {activeTab === "benchmark" && "Synthetic Benchmark"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Synthetic Fixtures Active
            </span>

            {activeTab !== "new" && (
              <button
                type="button"
                onClick={() => setActiveTab("new")}
                className="px-3 py-1.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-medium shadow-xs transition-colors"
              >
                + New Case
              </button>
            )}
          </div>
        </header>

        {/* Mobile dropdown menu if open */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 text-white p-3 space-y-1 border-b border-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveTab("overview");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 text-xs rounded hover:bg-slate-800"
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("investigations");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 text-xs rounded hover:bg-slate-800"
            >
              Investigations
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("desk");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 text-xs rounded hover:bg-slate-800"
            >
              Investigation Desk ({activeCase?.invoiceId || "INV-1048"})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("data-sources");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 text-xs rounded hover:bg-slate-800"
            >
              Data Sources
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("benchmark");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 text-xs rounded hover:bg-slate-800"
            >
              Benchmark
            </button>
          </div>
        )}

        {/* Dynamic Screen Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "overview" && (
            <OverviewScreen
              onSelectCase={handleSelectCase}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === "investigations" && (
            <InvestigationListScreen
              onSelectCase={handleSelectCase}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === "desk" && (
            <InvestigationDesk
              initialCaseId={selectedCaseId}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === "new" && (
            <NewInvestigationWizard
              onComplete={(caseId) => {
                setSelectedCaseId(caseId);
                setActiveTab("desk");
              }}
              onCancel={() => setActiveTab("overview")}
            />
          )}

          {activeTab === "data-sources" && <DataSourcesScreen />}

          {activeTab === "benchmark" && <BenchmarkScreen />}
        </main>
      </div>
    </div>
  );
}

