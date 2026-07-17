import React, { useState } from "react";
import { 
  Database, 
  Activity, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  Gauge, 
  TrendingUp, 
  Clock, 
  FileCheck, 
  ArrowUpRight 
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { Document, RoleType, WorkOrder } from "../types";

interface DashboardViewProps {
  documents: Document[];
  workOrders: WorkOrder[];
  activeRole: RoleType;
  setActiveTab: (tab: string) => void;
  setSelectedDocId: (id: string | null) => void;
}

export default function DashboardView({
  documents,
  workOrders,
  activeRole,
  setActiveTab,
  setSelectedDocId
}: DashboardViewProps) {
  
  // High-fidelity Mock Alerts Feed
  const [alerts, setAlerts] = useState([
    {
      id: "ALT-091",
      code: "EGT-SPREAD-WARNING",
      system: "Gas Turbine SGT-900",
      message: "Circumferential exhaust spread thermocouple offset reached 32°F. Limit: 30°F.",
      severity: "warning",
      timestamp: "10 mins ago",
      refDocId: "MAN-SGT-901",
      status: "unresolved"
    },
    {
      id: "ALT-104",
      code: "BMS-PURGE-REQUIRED",
      system: "Boiler HPB-201",
      message: "Pre-purge cycle started. Maintain 12,000 CFM airflow for 300 seconds.",
      severity: "info",
      timestamp: "24 mins ago",
      refDocId: "SOP-HPB-702",
      status: "unresolved"
    },
    {
      id: "ALT-112",
      code: "PUMP-CAVITATION-CRITICAL",
      system: "Feedwater Loop P-201B",
      message: "Suction pressure PT-202 plummeted below 12 psi. Interlock triggered shutdown.",
      severity: "critical",
      timestamp: "1 hour ago",
      refDocId: "INC-2026-042",
      status: "unresolved"
    }
  ]);

  // Handle resolving an alert locally using state
  const handleResolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "resolved" } : a));
  };

  // Recharts Data 1: Knowledge Distribution by category
  const categoriesCount = documents.reduce((acc: Record<string, number>, doc) => {
    acc[doc.category] = (acc[doc.category] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoriesCount).map(([name, value]) => ({
    name,
    "Knowledge Assets": value
  }));

  // Recharts Data 2: Exhaust Temperature readings from Gas Turbine MAN-SGT-901 data
  const turbineEgtData = [
    { thermocouple: "TC-01", temp: 1025, limit: 1050 },
    { thermocouple: "TC-02", temp: 1030, limit: 1050 },
    { thermocouple: "TC-03", temp: 1045, limit: 1050 }, // Hotspot
    { thermocouple: "TC-04", temp: 1022, limit: 1050 },
    { thermocouple: "TC-05", temp: 1018, limit: 1050 },
    { thermocouple: "TC-06", temp: 1011, limit: 1050 },
    { thermocouple: "TC-07", temp: 1008, limit: 1050 },
    { thermocouple: "TC-08", temp: 1012, limit: 1050 },
    { thermocouple: "TC-09", temp: 1039, limit: 1050 },
    { thermocouple: "TC-10", temp: 1040, limit: 1050 },
    { thermocouple: "TC-11", temp: 1025, limit: 1050 },
    { thermocouple: "TC-12", temp: 1015, limit: 1050 }
  ];

  // Recharts Data 3: Asset System coverage pie chart
  const systemDistributionData = [
    { name: "Boiler System", value: 35, color: "#f97316" }, // Orange
    { name: "Turbine Unit", value: 25, color: "#3b82f6" },  // Blue
    { name: "Piping & Valves", value: 20, color: "#10b981" }, // Emerald
    { name: "EHS Standards", value: 20, color: "#eab308" }  // Yellow
  ];

  // Total words calculation
  const totalWords = documents.reduce((sum, doc) => {
    return sum + (doc.metadata?.wordCount || (doc.content ? doc.content.split(/\s+/).length : 0));
  }, 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-elegant-dark font-sans text-slate-200">
      
      {/* Upper Title Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">
            Asset Operations Cockpit
          </h2>
          <p className="text-slate-400 text-sm">
            Plant instrumentation telemetry indicators, knowledge-base indexing, and real-time alert triage.
          </p>
        </div>

        {/* Quick Dashboard Stat badge */}
        <div className="flex items-center gap-3 bg-elegant-card px-4 py-2 border border-slate-800 rounded">
          <Clock className="w-4 h-4 text-blue-400" />
          <div className="text-xs">
            <div className="text-slate-500 font-mono text-[9px] uppercase leading-none">System Clock (Local)</div>
            <div className="font-mono font-semibold text-slate-200 mt-1 leading-none">
              {new Date().toISOString().substring(11, 19)} UTC
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Knowledge Ingested */}
        <div className="bg-elegant-card border border-slate-800 p-5 rounded relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 hazard-stripes-dark h-1 w-full opacity-10"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase text-slate-500">Knowledge Assets</span>
            <Database className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-display font-bold text-white leading-none">
            {documents.length} Files
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
            <span className="font-semibold text-blue-400">
              {(totalWords / 1000).toFixed(1)}k
            </span>
            <span>words ingested and indexed</span>
          </div>
        </div>

        {/* Card 2: Plant Safety Record */}
        <div className="bg-elegant-card border border-slate-800 p-5 rounded relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase text-slate-500">EHS Compliance Check</span>
            <FileCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-display font-bold text-white leading-none">
            100% Audited
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-2">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Zero OSHA 1910 violations flagged</span>
          </div>
        </div>

        {/* Card 3: Reliability Index */}
        <div className="bg-elegant-card border border-slate-800 p-5 rounded hover:border-blue-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase text-slate-500">Fleet Reliability</span>
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-display font-bold text-white leading-none">
            98.4% Uptime
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
            <span>Critical assets monitored: </span>
            <span className="font-semibold text-slate-300">6 units</span>
          </div>
        </div>

        {/* Card 4: Open Actions */}
        <div className="bg-elegant-card border border-slate-800 p-5 rounded hover:border-purple-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase text-slate-500">Active Work Orders</span>
            <Gauge className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-display font-bold text-white leading-none">
            {workOrders.length} Pending
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
            <span className="font-semibold text-blue-400">
              {workOrders.filter(w => w.priority === "HIGH" || w.priority === "CRITICAL").length} High-Risk
            </span>
            <span>tasks active</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Exhaust Temperature Spread Chart (Turbine data) */}
        <div className="lg:col-span-2 bg-elegant-card border border-slate-800 p-5 rounded">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                SGT-900 Turbine Exhaust Thermocouple Spread
              </h3>
              <p className="text-[11px] text-slate-500">
                Exhaust temperature circumferential spread (EGT) compared against thermal alarm limit (1050°F).
              </p>
            </div>
            <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase">
              Manual Sect 4.1
            </span>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={turbineEgtData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="thermocouple" stroke="#475569" fontSize={10} fontStyle="italic" />
                <YAxis stroke="#475569" fontSize={10} domain={[900, 1080]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#0F1219", 
                    borderColor: "#1F242D", 
                    borderRadius: "4px",
                    color: "#f8fafc"
                  }} 
                  labelClassName="text-xs font-bold text-blue-400"
                />
                <Area type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#tempGradient)" name="Measured Temp (°F)" />
                <Area type="monotone" dataKey="limit" stroke="#ef4444" strokeDasharray="5 5" fill="none" name="Safety Limit (°F)" />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Distribution Pie */}
        <div className="bg-elegant-card border border-slate-800 p-5 rounded flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">
              Knowledge Asset Coverage
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Classification of active knowledge procedures by critical plant subsystem.
            </p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={systemDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {systemDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Legends custom */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {systemDistributionData.map((sys) => (
              <div key={sys.name} className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sys.color }} />
                <span className="truncate">{sys.name} ({sys.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Panel: Live Safety Alerts Feed + Quick Ingestion Triage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Alarm Desk / Safety Alerts */}
        <div className="lg:col-span-2 bg-elegant-card border border-slate-800 p-5 rounded">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-400 animate-pulse" />
              <h3 className="text-sm font-semibold text-slate-200">
                Live Plant Alarm Desk & Triage Feed
              </h3>
            </div>
            <span className="text-[10px] bg-[#0F1219] border border-slate-800 px-2 py-1 rounded text-slate-400 font-mono">
              ROLE: {activeRole.toUpperCase()}
            </span>
          </div>

          <div className="space-y-3.5">
            {alerts.filter(a => a.status === "unresolved").map((alert) => {
              const isCritical = alert.severity === "critical";
              const isWarning = alert.severity === "warning";
              
              return (
                <div 
                  key={alert.id}
                  className={`p-4 rounded border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${
                    isCritical 
                      ? "bg-rose-500/5 border-rose-500/20" 
                      : isWarning 
                        ? "bg-yellow-500/5 border-yellow-500/20" 
                        : "bg-blue-500/5 border-blue-500/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isCritical ? (
                        <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-bold text-slate-500">
                          {alert.id}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                          isCritical ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400" :
                          isWarning ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400" :
                          "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400"
                        }`}>
                          {alert.code}
                        </span>
                        <span className="text-slate-400 text-[10px]">{alert.system}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {alert.message}
                      </p>
                      
                      {/* Technical Document Link */}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] text-slate-550">Referenced SOP/Technical Asset:</span>
                        <button 
                          onClick={() => {
                            setSelectedDocId(alert.refDocId);
                            setActiveTab("documents");
                          }}
                          className="text-[10px] font-mono text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          {alert.refDocId} <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Operational triage button */}
                  <div className="flex-shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="px-3 py-1.5 bg-[#0F1219] border border-slate-800 text-slate-300 hover:border-emerald-500 hover:bg-emerald-500/5 hover:text-emerald-400 rounded text-xs transition-all duration-300 font-medium cursor-pointer"
                    >
                      Acknowledge & Clear
                    </button>
                  </div>
                </div>
              );
            })}

            {alerts.filter(a => a.status === "unresolved").length === 0 && (
              <div className="py-8 text-center text-slate-500 border border-dashed border-slate-800 rounded">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs">All active telemetry spreads and safety purge sequences are operating within normal limits.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Ingestion Action Panel */}
        <div className="bg-elegant-card border border-slate-800 p-5 rounded flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">
              Operations Brain Navigation
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Access other specialized sub-modules in the Unified Operations Brain.
            </p>
            
            <div className="space-y-2.5">
              <button 
                onClick={() => setActiveTab("documents")} 
                className="w-full text-left p-3 border border-slate-800 rounded hover:border-blue-500 hover:bg-blue-500/5 group transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-blue-400">
                    Ingest & Inspect Drawings
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[10px] text-slate-550 mt-0.5">Upload P&IDs, manuals and SOPs for immediate AI parsing.</p>
              </button>

              <button 
                onClick={() => setActiveTab("copilot")} 
                className="w-full text-left p-3 border border-slate-800 rounded hover:border-blue-500 hover:bg-blue-500/5 group transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-blue-400">
                    Active AI Copilot Terminal
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[10px] text-slate-550 mt-0.5">Chat directly with the Gemini model on any uploaded SOP.</p>
              </button>

              <button 
                onClick={() => setActiveTab("maintenance")} 
                className="w-full text-left p-3 border border-slate-800 rounded hover:border-purple-500 hover:bg-purple-500/5 group transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-purple-400">
                    Reliability FMEA Analysis
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[10px] text-slate-550 mt-0.5">Simulate failures and let Gemini build an FMEA risk matrix.</p>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-500">
            <span>DCS Interlock Protection</span>
            <span className="text-emerald-500 font-bold uppercase">ACTIVE (SIL-3)</span>
          </div>
        </div>

      </div>

    </div>
  );
}
