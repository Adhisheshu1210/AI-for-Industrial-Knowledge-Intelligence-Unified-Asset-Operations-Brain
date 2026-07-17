import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Database, 
  Cpu, 
  Activity, 
  ShieldCheck, 
  Clock, 
  Users, 
  Download, 
  Play, 
  Pause, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  LineChart as LineIcon,
  Search,
  Network,
  Award,
  Zap,
  BarChart2,
  PieChart as PieIcon,
  BookOpen,
  Brain,
  Layers,
  Wrench,
  HelpCircle,
  Eye,
  Settings
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
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
  LineChart,
  Line
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { RoleType } from "../types";

interface AnalyticsViewProps {
  documents: any[];
  workOrders: any[];
  activeRole: RoleType;
}

// Sub-Tab options for the Analytics view
type DashboardSubTab = "executive" | "assets" | "ai_ingest" | "users_deps";

// Filtering States
type TimeRange = "24h" | "7d" | "30d" | "3m";
type AssetFilter = "all" | "gt900" | "hpb201" | "p201b" | "ehs";

export default function AnalyticsView({
  documents = [],
  workOrders = [],
  activeRole
}: AnalyticsViewProps) {
  
  // Tab states
  const [activeSubTab, setActiveSubTab] = useState<DashboardSubTab>("executive");
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [assetFilter, setAssetFilter] = useState<AssetFilter>("all");
  const [selectedPersona, setSelectedPersona] = useState<"all" | "manager" | "engineer" | "executive" | "compliance">("all");

  // Real-time telemetry simulation state
  const [isLiveRunning, setIsLiveRunning] = useState<boolean>(true);
  const [liveMetrics, setLiveMetrics] = useState({
    activeSessions: 14,
    vibrationVps: 1.42,
    avgLatencyMs: 412,
    queriesPerMin: 18.5,
    lastUpdate: new Date().toLocaleTimeString()
  });

  // Simulated notifications state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Time range-dependent multipliers for mock statistics
  const rangeMultiplier = timeRange === "24h" ? 0.15 : timeRange === "7d" ? 1 : timeRange === "30d" ? 3.8 : 11.5;

  // Real-time updates effect
  useEffect(() => {
    if (!isLiveRunning) return;

    const interval = setInterval(() => {
      setLiveMetrics(prev => {
        // Random drift
        const sessionDrift = Math.random() > 0.5 ? 1 : -1;
        const newSessions = Math.max(8, Math.min(35, prev.activeSessions + sessionDrift));
        
        const vibDrift = (Math.random() - 0.5) * 0.15;
        const newVib = Math.max(0.8, Math.min(2.8, parseFloat((prev.vibrationVps + vibDrift).toFixed(2))));
        
        const latencyDrift = Math.floor((Math.random() - 0.5) * 45);
        const newLatency = Math.max(280, Math.min(680, prev.avgLatencyMs + latencyDrift));
        
        const qpmDrift = parseFloat((Math.random() - 0.5).toFixed(1));
        const newQpm = Math.max(5, Math.min(45, parseFloat((prev.queriesPerMin + qpmDrift).toFixed(1))));

        return {
          activeSessions: newSessions,
          vibrationVps: newVib,
          avgLatencyMs: newLatency,
          queriesPerMin: newQpm,
          lastUpdate: new Date().toLocaleTimeString()
        };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isLiveRunning]);

  // Export functions
  const triggerExport = (format: "csv" | "json") => {
    // Compile some high-fidelity statistics object
    const exportData = {
      timestamp: new Date().toISOString(),
      reportName: "Industrial Asset & AI Knowledge Executive Report",
      filterSettings: { timeRange, assetFilter, selectedPersona },
      metrics: {
        totalIngestedDocuments: documents.length,
        totalWorkOrders: workOrders.length,
        uptimeIndex: "98.84%",
        overallEquipmentEffectiveness: "86.5%",
        energyIndexKWh: "12,482",
        complianceHoldsActive: 2,
        semanticSearchAccuracy: "94.2%",
        knowledgeGraphNodes: 1422,
        meanTimeToRepairMin: 145,
        meanTimeBetweenFailuresDays: 122
      }
    };

    if (format === "json") {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `indus_ai_analytics_${timeRange}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      // Build simple CSV row
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Metric,Value,Threshold\n";
      csvContent += `Document Ingestion Count,${documents.length},100\n`;
      csvContent += `Work Orders Backlog,${workOrders.length},20\n`;
      csvContent += "Overall Plant OEE,86.5%,85%\n";
      csvContent += "Vibration VPS Monitor,1.42,2.5\n";
      csvContent += "Mean Time Between Failures (days),122,90\n";
      csvContent += "Mean Time To Repair (min),145,180\n";
      csvContent += "Semantic Search MRR Score,0.92,0.85\n";

      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", encodeURI(csvContent));
      downloadAnchor.setAttribute("download", `indus_ai_analytics_${timeRange}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }

    setToastMessage(`Export Successful! Downloaded ${format.toUpperCase()} asset manifest.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- MOCK DATA SECTION (GORGEOUSLY HIGH-FIDELITY & RESPONSIVE TO FILTERS) ---
  
  // 1. Ingestion Volume by Format
  const getIngestionData = () => {
    const scale = rangeMultiplier;
    return [
      { name: "P&ID Drawings", volume: Math.round(18 * scale), color: "#3b82f6" },
      { name: "SOP Manuals", volume: Math.round(35 * scale), color: "#10b981" },
      { name: "Equipment Manuals", volume: Math.round(22 * scale), color: "#8b5cf6" },
      { name: "Incident Reports", volume: Math.round(14 * scale), color: "#f43f5e" },
      { name: "Tribal Floor Logs", volume: Math.round(29 * scale), color: "#f59e0b" }
    ];
  };

  // 2. AI Response Latencies (P50, P95, P99) over time
  const getAiLatencyData = () => {
    return [
      { time: "08:00", avg: 312, p95: 450, p99: 680, queries: 120 },
      { time: "10:00", avg: 380, p95: 520, p99: 890, queries: 280 },
      { time: "12:00", avg: 410, p95: 590, p99: 1020, queries: 350 },
      { time: "14:00", avg: 340, p95: 490, p99: 720, queries: 190 },
      { time: "16:00", avg: 395, p95: 540, p99: 940, queries: 310 },
      { time: "18:00", avg: 290, p95: 410, p99: 610, queries: 140 },
      { time: "20:00", avg: 260, p95: 380, p99: 550, queries: 90 }
    ];
  };

  // 3. Overall Equipment Effectiveness (OEE) trends
  const getOeeTrendData = () => {
    return [
      { date: "Day 1", Availability: 92, Performance: 88, Quality: 99, OEE: 80.2 },
      { date: "Day 2", Availability: 94, Performance: 89, Quality: 98.8, OEE: 82.6 },
      { date: "Day 3", Availability: 95, Performance: 91, Quality: 99.1, OEE: 85.7 },
      { date: "Day 4", Availability: 88, Performance: 85, Quality: 99.2, OEE: 74.3 }, // Planned maintenance
      { date: "Day 5", Availability: 96, Performance: 93, Quality: 99.5, OEE: 88.8 },
      { date: "Day 6", Availability: 98, Performance: 92, Quality: 99.6, OEE: 89.8 },
      { date: "Day 7", Availability: 97, Performance: 94, Quality: 99.4, OEE: 90.6 }
    ];
  };

  // 4. Semantic Search Trends (Most frequent topics parsed)
  const getSearchTrendData = () => {
    return [
      { topic: "Lockout Tagout (LOTO)", searches: Math.round(145 * rangeMultiplier), accuracy: 96.2 },
      { topic: "Exhaust Thermocouple", searches: Math.round(98 * rangeMultiplier), accuracy: 94.1 },
      { topic: "BMS Purge CFM Limits", searches: Math.round(88 * rangeMultiplier), accuracy: 95.5 },
      { topic: "Feedwater Pump Cavitation", searches: Math.round(112 * rangeMultiplier), accuracy: 92.8 },
      { topic: "Boiler Safety Valve", searches: Math.round(76 * rangeMultiplier), accuracy: 93.9 },
      { topic: "Electrical Line Diagram", searches: Math.round(62 * rangeMultiplier), accuracy: 89.4 }
    ];
  };

  // 5. Equipment Reliability Radar Chart (Reliability indices by subsystem)
  const getSubsystemReliabilityData = () => {
    return [
      { subject: "Mechanical Uptime", SGT_900: 98, HPB_201: 94, Feedwater: 95, limit: 90 },
      { subject: "Thermal Tolerance", SGT_900: 94, HPB_201: 98, Feedwater: 92, limit: 90 },
      { subject: "Telemetry Accuracy", SGT_900: 96, HPB_201: 91, Feedwater: 97, limit: 90 },
      { subject: "Safety Hold Rate", SGT_900: 99, HPB_201: 96, Feedwater: 99, limit: 90 },
      { subject: "SOP Audited Ratio", SGT_900: 100, HPB_201: 100, Feedwater: 98, limit: 90 },
      { subject: "LOTO Compliance", SGT_900: 95, HPB_201: 97, Feedwater: 96, limit: 90 }
    ];
  };

  // 6. User activity by Role (Pie distribution)
  const getUserRoleSessions = () => {
    return [
      { name: "Control Room Operator", value: Math.round(142 * rangeMultiplier), color: "#f97316" },
      { name: "Reliability Engineer", value: Math.round(94 * rangeMultiplier), color: "#3b82f6" },
      { name: "EHS Safety Director", value: Math.round(48 * rangeMultiplier), color: "#eab308" },
      { name: "General Plant Manager", value: Math.round(52 * rangeMultiplier), color: "#10b981" }
    ];
  };

  // 7. Thermal & Vibration Anomaly Correlation (Scatter Bubble Plot)
  const getScatterAnomalyData = () => {
    return [
      { temperature: 910, vibration: 1.1, anomalyScore: 10, asset: "P-201A Feedwater" },
      { temperature: 950, vibration: 1.4, anomalyScore: 20, asset: "P-201B Feedwater" },
      { temperature: 1025, vibration: 1.8, anomalyScore: 50, asset: "SGT-900 Core" },
      { temperature: 1045, vibration: 2.3, anomalyScore: 85, asset: "SGT-900 Exhaust" }, // Hotspot
      { temperature: 450, vibration: 0.9, anomalyScore: 5, asset: "HPB-201 Drum" },
      { temperature: 510, vibration: 1.5, anomalyScore: 35, asset: "HPB-201 Valve" }
    ];
  };

  // Calculated variables
  const processedDocsCount = documents.length || 18;
  const wordCountEstimated = documents.reduce((sum, d) => sum + (d.metadata?.wordCount || 850), 0) || 15400;
  const mtbfCalculated = assetFilter === "gt900" ? 180 : assetFilter === "hpb201" ? 140 : 122;
  const mttrCalculated = assetFilter === "gt900" ? 110 : assetFilter === "hpb201" ? 155 : 145;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0B0D13] font-sans text-slate-200" id="executive-analytics-platform">
      
      {/* Toast Notification Container */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 bg-[#161B29] border border-emerald-500/30 text-emerald-400 text-xs px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-slate-900 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-600/15 text-indigo-400 border border-indigo-500/15 uppercase">
              Executive Analytics Station
            </span>
            <span className="text-slate-500 font-mono text-xs">• plant-wide intelligence & performance indexes</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2.5 mt-1">
            <BarChart2 className="w-6 h-6 text-indigo-500 glow-indigo-svg" />
            <span>Industrial Intelligence Executive Cockpit</span>
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Real-time monitoring of document ingestion statistics, operational performance (OEE), maintenance KPIs, EHS compliance, and AI query latencies.
          </p>
        </div>

        {/* Real-time Telemetry simulated ticker */}
        <div className="flex items-center gap-4 bg-[#10141F] border border-slate-800/80 rounded px-4 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isLiveRunning ? "bg-emerald-500 animate-ping" : "bg-slate-600"}`}></span>
            <span className="text-[10px] uppercase font-mono text-slate-550 font-bold">Telemetry Stream</span>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div className="grid grid-cols-3 gap-x-4 gap-y-0.5 text-[10.5px]">
            <div>
              <span className="text-slate-500 font-mono text-[9px] uppercase">Active Users:</span>{" "}
              <span className="font-mono text-slate-300 font-bold">{liveMetrics.activeSessions}</span>
            </div>
            <div>
              <span className="text-slate-500 font-mono text-[9px] uppercase">Latency:</span>{" "}
              <span className="font-mono text-slate-300 font-bold">{liveMetrics.avgLatencyMs}ms</span>
            </div>
            <div>
              <span className="text-slate-500 font-mono text-[9px] uppercase">Vibration:</span>{" "}
              <span className={`font-mono font-bold ${liveMetrics.vibrationVps > 2 ? "text-rose-400" : "text-emerald-400"}`}>{liveMetrics.vibrationVps} VPS</span>
            </div>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <button
            onClick={() => setIsLiveRunning(!isLiveRunning)}
            className="p-1 hover:bg-slate-800/80 rounded transition-colors text-slate-400 hover:text-white cursor-pointer"
            title={isLiveRunning ? "Pause live telemetry" : "Resume live telemetry"}
          >
            {isLiveRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Control Filters & Exports Panel */}
      <div className="bg-[#10141F] border border-slate-900 rounded-lg p-4 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        
        {/* Dynamic Filters */}
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Time range filter */}
          <div className="space-y-1">
            <label className="text-[9px] font-mono uppercase text-slate-500 font-bold block">Temporal Horizon</label>
            <div className="flex bg-[#090C12] rounded p-0.5 border border-slate-800">
              {(["24h", "7d", "30d", "3m"] as TimeRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2 py-1 rounded text-[10.5px] font-mono uppercase font-bold transition-all cursor-pointer ${
                    timeRange === r 
                      ? "bg-indigo-600 text-white shadow-sm" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px h-8 bg-slate-800 hidden md:block"></div>

          {/* Subsystem filter */}
          <div className="space-y-1">
            <label className="text-[9px] font-mono uppercase text-slate-500 font-bold block">Subsystem Domain</label>
            <select
              value={assetFilter}
              onChange={(e) => setAssetFilter(e.target.value as AssetFilter)}
              className="bg-[#090C12] border border-slate-800 text-slate-200 rounded px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600 cursor-pointer"
            >
              <option value="all">Global Plant (All Assets)</option>
              <option value="gt900">Gas Turbine SGT-900</option>
              <option value="hpb201">Boiler HPB-201</option>
              <option value="p201b">Feedwater Loop D-201</option>
              <option value="ehs">EHS Safety & Compliance</option>
            </select>
          </div>

          <div className="w-px h-8 bg-slate-800 hidden md:block"></div>

          {/* Audience Perspective Selector */}
          <div className="space-y-1">
            <label className="text-[9px] font-mono uppercase text-slate-500 font-bold block">Audience View Drill-Down</label>
            <div className="flex gap-1">
              {[
                { id: "all", label: "Full Matrix" },
                { id: "manager", label: "Plant Manager" },
                { id: "engineer", label: "Reliability Eng" },
                { id: "executive", label: "Executive View" },
                { id: "compliance", label: "EHS Officer" }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPersona(p.id as any)}
                  className={`px-2 py-1 rounded text-[10px] font-medium border transition-all cursor-pointer ${
                    selectedPersona === p.id 
                      ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/30 font-semibold" 
                      : "bg-[#090C12] text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Export Data buttons */}
        <div className="flex items-center gap-2 self-stretch lg:self-auto border-t border-slate-800/80 pt-3 lg:pt-0 lg:border-t-0">
          <span className="text-[10px] text-slate-500 font-mono hidden xl:inline">Export Metrics:</span>
          <button
            onClick={() => triggerExport("csv")}
            className="flex-1 lg:flex-none px-3 py-1.5 bg-[#090C12] hover:bg-slate-800/50 text-slate-300 border border-slate-800 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => triggerExport("json")}
            className="flex-1 lg:flex-none px-3 py-1.5 bg-[#090C12] hover:bg-slate-800/50 text-slate-300 border border-slate-800 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>JSON Report</span>
          </button>
        </div>
      </div>

      {/* Dashboard Sub-Tabs Panel */}
      <div className="flex border-b border-slate-800/60 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveSubTab("executive")}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "executive"
              ? "border-indigo-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Award className="w-4 h-4 text-indigo-400" />
          <span>Executive & OEE Summary</span>
        </button>
        <button
          onClick={() => setActiveSubTab("assets")}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "assets"
              ? "border-indigo-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Activity className="w-4 h-4 text-blue-400" />
          <span>Asset Health & Predictive Maintenance</span>
        </button>
        <button
          onClick={() => setActiveSubTab("ai_ingest")}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "ai_ingest"
              ? "border-indigo-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Cpu className="w-4 h-4 text-purple-400" />
          <span>AI Engine, Ingestion & Search</span>
        </button>
        <button
          onClick={() => setActiveSubTab("users_deps")}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "users_deps"
              ? "border-indigo-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="w-4 h-4 text-teal-400" />
          <span>User Activity & Departments</span>
        </button>
      </div>

      {/* --- DRILL-DOWN DASHBOARD VIEW 1: EXECUTIVE & OEE SUMMARY --- */}
      {activeSubTab === "executive" && (
        <div className="space-y-6">
          
          {/* Executive KPI Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* OEE Index */}
            <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Overall Equipment Effectiveness</span>
                  <div className="text-3xl font-display font-bold text-white mt-1.5 leading-none">86.5%</div>
                </div>
                <span className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 text-[10px] font-mono font-bold">
                  +1.2% MoM
                </span>
              </div>
              <div className="mt-3.5 space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Target Benchmark: 85.0%</span>
                  <span>91% Available</span>
                </div>
                <div className="w-full bg-[#090C12] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: "86.5%" }}></div>
                </div>
              </div>
            </div>

            {/* Ingestion & Graph Node counts */}
            <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Knowledge Core Growth</span>
                  <div className="text-3xl font-display font-bold text-white mt-1.5 leading-none">1,422 Nodes</div>
                </div>
                <span className="p-1.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 text-[10px] font-mono font-bold">
                  Active Graph
                </span>
              </div>
              <div className="mt-3.5 text-[11px] text-slate-400 leading-tight">
                <span>Ingested </span>
                <span className="font-semibold text-white">{processedDocsCount} files</span>
                <span> establishing </span>
                <span className="font-mono text-indigo-400 font-bold">2,410</span>
                <span> semantic asset links.</span>
              </div>
            </div>

            {/* Tribal wisdom index */}
            <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Tribal wisdom Codification</span>
                  <div className="text-3xl font-display font-bold text-white mt-1.5 leading-none">94.2%</div>
                </div>
                <span className="p-1.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/15 text-[10px] font-mono font-bold">
                  High Capture
                </span>
              </div>
              <div className="mt-3.5 text-[11px] text-slate-400 leading-tight">
                <span>Codified </span>
                <span className="text-purple-400 font-bold">42 operator floor observations</span>
                <span> into formalized plant operating limits.</span>
              </div>
            </div>

            {/* Energy and Utility Index */}
            <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Plant Energy Consumption</span>
                  <div className="text-3xl font-display font-bold text-white mt-1.5 leading-none">12,482 MWh</div>
                </div>
                <span className="p-1.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/15 text-[10px] font-mono font-bold">
                  Efficient
                </span>
              </div>
              <div className="mt-3.5 text-[11px] text-slate-400 leading-tight flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Operating 2.4% below seasonal historical mean limits.</span>
              </div>
            </div>

          </div>

          {/* OEE Trend and Subsystem Utilization side-by-side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* OEE Trend Area Chart */}
            <div className="lg:col-span-2 bg-[#10141F] border border-slate-900 rounded-lg p-5">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">Overall Equipment Effectiveness (OEE) Timeline</h3>
                  <p className="text-[11px] text-slate-500">Continuous 7-day performance profiling covering Availability, Performance, and Quality components.</p>
                </div>
                <span className="text-[10px] font-mono bg-[#090C12] border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                  Target: 85%
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getOeeTrendData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="oeeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#475569" fontSize={10} fontStyle="italic" />
                    <YAxis stroke="#475569" fontSize={10} domain={[60, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0F1219", borderColor: "#1F242D", borderRadius: "4px", color: "#f8fafc" }} 
                      labelClassName="text-xs font-bold text-indigo-400"
                    />
                    <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                    <Area type="monotone" dataKey="OEE" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#oeeGradient)" name="Overall OEE (%)" />
                    <Line type="monotone" dataKey="Availability" stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="3 3" name="Availability (%)" />
                    <Line type="monotone" dataKey="Performance" stroke="#3b82f6" strokeWidth={1.5} dot={false} strokeDasharray="3 3" name="Performance (%)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Knowledge and SOP reference rate */}
            <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 mb-1">Knowledge Reference Utilization</h3>
                <p className="text-[11px] text-slate-500 mb-4">Percentage of ingested procedures dynamically linked or consulted in active work orders.</p>
              </div>

              <div className="space-y-4">
                {[
                  { name: "Gas Turbine SGT-900 SOPs", percent: 94, color: "bg-blue-500", count: "18 references" },
                  { name: "HPB-201 Boiler Safety Procedures", percent: 88, color: "bg-emerald-500", count: "12 references" },
                  { name: "P-201B Cavitation Corrective Plans", percent: 97, color: "bg-rose-500", count: "35 references" },
                  { name: "OSHA LOTO Safety Standard Auditing", percent: 91, color: "bg-amber-500", count: "8 references" }
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-300 font-medium truncate">{item.name}</span>
                      <span className="text-slate-500 font-mono text-[10px]">{item.count}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-[#090C12] h-2 rounded-full overflow-hidden border border-slate-800/40">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percent}%` }}></div>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-200">{item.percent}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/60 text-[10.5px] text-slate-400 italic bg-[#090C12] p-2.5 rounded border">
                <strong>Executive Insight:</strong> High linkage of cavitation plans reflects successful structural propagation of the module RCA amendments.
              </div>
            </div>

          </div>

          {/* Plant Energy Index and Compliance Gauge info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Energy Distribution */}
            <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5 lg:col-span-1">
              <h3 className="text-sm font-semibold text-slate-200 mb-1">Utility & Energy Consumption Index</h3>
              <p className="text-[11px] text-slate-500 mb-5">Subsystem power allocation compared to target baseline thresholds.</p>
              
              <div className="h-60 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: "SGT-900", Power: 4500, Target: 4800 },
                    { name: "HPB-201", Power: 3900, Target: 4100 },
                    { name: "D-201 Loop", Power: 2800, Target: 2700 },
                    { name: "Support Services", Power: 1282, Target: 1350 }
                  ]}>
                    <XAxis dataKey="name" stroke="#475569" fontSize={9} />
                    <YAxis stroke="#475569" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: "#0F1219", borderColor: "#1F242D", color: "#f8fafc" }} />
                    <Bar dataKey="Power" fill="#f59e0b" name="Allocated MWh" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Target" fill="#475569" name="Baseline Threshold" radius={[3, 3, 0, 0]} opacity={0.4} />
                    <Legend wrapperStyle={{ fontSize: 9 }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Compliance Audit status */}
            <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5 lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">EHS Compliance Audit Performance Tracker</h3>
                  <p className="text-[11px] text-slate-500">Live tracker evaluating daily Isolation Procedures (LOTO) and OSHA 1910 checks.</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  98.2% Pass Rate
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {[
                  { title: "Isolation Verification Checklists", status: "100% Complete", score: 100, desc: "All 18 active steam isolates fully double-audited by EHS Director.", color: "text-emerald-400" },
                  { title: "SOP Safety Tag Amendments", status: "12 of 14 Completed", score: 85, desc: "LOTO hazard tags actively synchronized with physical locks.", color: "text-indigo-400" },
                  { title: "OSHA 1910 Compliance Holds", status: "Zero Flagged Alerts", score: 100, desc: "Zero unresolved safety holds or isolation breaches.", color: "text-emerald-400" }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-[#090C12] border border-slate-800 p-4 rounded-lg flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">{stat.title}</span>
                      <span className={`text-sm font-semibold block mt-1.5 ${stat.color}`}>{stat.status}</span>
                      <p className="text-[11.5px] text-slate-450 mt-2 leading-relaxed">{stat.desc}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center text-[10px] font-mono">
                      <span className="text-slate-500">Confidence Score:</span>
                      <span className="text-slate-300 font-bold">{stat.score}/100</span>
                    </div>
                  </div>
                ))}

              </div>
            </div>

          </div>

        </div>
      )}

      {/* --- DRILL-DOWN DASHBOARD VIEW 2: ASSET HEALTH & PREDICTIVE MAINTENANCE --- */}
      {activeSubTab === "assets" && (
        <div className="space-y-6">
          
          {/* Sub-tab 2 KPI cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* MTBF Card */}
            <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5 relative overflow-hidden">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Mean Time Between Failures</span>
              <div className="text-3xl font-display font-bold text-white mt-1.5 leading-none">{mtbfCalculated} Days</div>
              <p className="text-[11px] text-slate-400 mt-2.5">
                Target: {mtbfCalculated + 10} days. Standard rotation cycle optimized by predictive sensor checks.
              </p>
            </div>

            {/* MTTR Card */}
            <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5 relative overflow-hidden">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Mean Time To Repair</span>
              <div className="text-3xl font-display font-bold text-white mt-1.5 leading-none">{mttrCalculated} Mins</div>
              <p className="text-[11px] text-slate-400 mt-2.5 text-emerald-400">
                Reduced by 18 minutes over last quarter via direct AI manual context lookups.
              </p>
            </div>

            {/* Predictive FMEA accuracy */}
            <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5 relative overflow-hidden">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Predictive Model Accuracy</span>
              <div className="text-3xl font-display font-bold text-indigo-400 mt-1.5 leading-none">94.8% Precision</div>
              <p className="text-[11px] text-slate-400 mt-2.5">
                FMEA critical risk failure modes predicted with less than 2.1% false alarm index rate.
              </p>
            </div>

            {/* Projected RUL */}
            <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5 relative overflow-hidden">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Critical Remaining Useful Life</span>
              <div className="text-3xl font-display font-bold text-rose-400 mt-1.5 leading-none">P-201B: 14 Days</div>
              <p className="text-[11px] text-slate-400 mt-2.5">
                Calculated RUL for P-201B mechanical seal face. Standard maintenance replacement flagged in calendar.
              </p>
            </div>

          </div>

          {/* Core Assets Visualizer: Scatter plot and Subsystem Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Heatmap / Scatter of anomalies */}
            <div className="lg:col-span-2 bg-[#10141F] border border-slate-900 rounded-lg p-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Vibration Profile vs Temperature Anomalies</h3>
                <p className="text-[11px] text-slate-500 mb-5">
                  Bivariate correlation mapping high vibration (VPS) against gas/fluid temperatures to identify mechanical seal stress points.
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
                    <XAxis 
                      type="number" 
                      dataKey="temperature" 
                      name="Temperature" 
                      unit="°F" 
                      stroke="#475569" 
                      fontSize={10} 
                      domain={[400, 1100]}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="vibration" 
                      name="Vibration" 
                      unit=" VPS" 
                      stroke="#475569" 
                      fontSize={10} 
                      domain={[0, 3]}
                    />
                    <ZAxis type="number" dataKey="anomalyScore" range={[60, 400]} name="Anomaly Score" />
                    <Tooltip 
                      cursor={{ strokeDasharray: "3 3" }} 
                      contentStyle={{ backgroundColor: "#0F1219", borderColor: "#1F242D", color: "#f8fafc" }}
                    />
                    <Legend wrapperStyle={{ fontSize: 9 }} />
                    <Scatter name="SGT-900 Subsystem" data={getScatterAnomalyData().filter(d => d.asset.includes("SGT-900"))} fill="#f43f5e" />
                    <Scatter name="Feedwater & Pumps" data={getScatterAnomalyData().filter(d => d.asset.includes("P-201"))} fill="#3b82f6" />
                    <Scatter name="HPB-201 Boiler" data={getScatterAnomalyData().filter(d => d.asset.includes("HPB-201"))} fill="#10b981" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subsystem health radar chart */}
            <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-1">Subsystem Health Index Radar</h3>
              <p className="text-[11px] text-slate-500 mb-4">Evaluates multi-point performance margins relative to minimum safety limits.</p>
              
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getSubsystemReliabilityData()}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                    <PolarRadiusAxis angle={30} domain={[80, 100]} stroke="#475569" fontSize={8} />
                    <Radar name="SGT-900 Gas Turbine" dataKey="SGT_900" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                    <Radar name="HPB-201 Boiler" dataKey="HPB_201" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                    <Radar name="Feedwater Loop" dataKey="Feedwater" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} />
                    <Legend wrapperStyle={{ fontSize: 9 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Maintenance KPIs: Mean failure tracking table / MTBF Comparison */}
          <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Preventive vs. Corrective Maintenance Ratios</h3>
                <p className="text-[11px] text-slate-500">Evaluating work orders, critical backlogs, and planned intervention counts.</p>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">FMEA COMPLIANCE ACTIVE</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Progress bars of ratio */}
              <div className="bg-[#090C12] border border-slate-800 p-4 rounded-lg space-y-4">
                <span className="text-[10.5px] font-mono uppercase text-slate-400 font-bold block">Planned vs. Unplanned Ratio</span>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Preventive Maintenance (PM)</span>
                    <span className="font-mono text-emerald-400 font-bold">78%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: "78%" }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Corrective / Breakdown (CM)</span>
                    <span className="font-mono text-rose-400 font-bold">22%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded overflow-hidden">
                    <div className="bg-rose-500 h-full" style={{ width: "22%" }}></div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 italic leading-snug pt-2">
                  World-class standard target ratio is 80/20. Current 78/22 profile demonstrates highly mature proactive maintenance routines.
                </p>
              </div>

              {/* Asset systems MTBF comparisons */}
              <div className="bg-[#090C12] border border-slate-800 p-4 rounded-lg col-span-2">
                <span className="text-[10.5px] font-mono uppercase text-slate-400 font-bold block mb-3">MTBF and MTTR Benchmarking by Subsystem</span>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 font-mono text-[9px] uppercase text-slate-500">
                        <th className="pb-2">Subsystem Name</th>
                        <th className="pb-2">Active MTBF (Days)</th>
                        <th className="pb-2">Target MTBF</th>
                        <th className="pb-2">Mean Repair Time</th>
                        <th className="pb-2">Critical Failure Modes Detected (FMEA)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/45 pt-2">
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2.5 font-medium text-slate-200">SGT-900 Gas Turbine Unit</td>
                        <td className="py-2.5 font-mono">180</td>
                        <td className="py-2.5 font-mono text-slate-500">200</td>
                        <td className="py-2.5 font-mono text-emerald-400">110 mins</td>
                        <td className="py-2.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/15">14 High-risk</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2.5 font-medium text-slate-200">HPB-201 Steam Boiler</td>
                        <td className="py-2.5 font-mono">140</td>
                        <td className="py-2.5 font-mono text-slate-500">150</td>
                        <td className="py-2.5 font-mono text-amber-400">155 mins</td>
                        <td className="py-2.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/15">8 Medium-risk</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2.5 font-medium text-slate-200">Feedwater Pump P-201B</td>
                        <td className="py-2.5 font-mono">92</td>
                        <td className="py-2.5 font-mono text-slate-500">120</td>
                        <td className="py-2.5 font-mono text-rose-400">245 mins</td>
                        <td className="py-2.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/15">6 High-risk</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* --- DRILL-DOWN DASHBOARD VIEW 3: AI ENGINE, PROCESSING & SEARCH --- */}
      {activeSubTab === "ai_ingest" && (
        <div className="space-y-6">
          
          {/* Sub-tab 3 KPI cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* API Ingestion Token Count */}
            <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5 relative overflow-hidden">
              <span className="text-[10px] font-mono text-slate-550 uppercase font-bold">AI API Tokens Consumed</span>
              <div className="text-3xl font-display font-bold text-white mt-1.5 leading-none">
                {Math.round(48500 * rangeMultiplier).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-2.5">
                Approximate Gemini structural payload tokens indexed in secure local buffer cache.
              </p>
            </div>

            {/* AI Latency performance */}
            <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5 relative overflow-hidden">
              <span className="text-[10px] font-mono text-slate-550 uppercase font-bold">P95 AI Response Latency</span>
              <div className="text-3xl font-display font-bold text-purple-400 mt-1.5 leading-none">512 ms</div>
              <p className="text-[11px] text-slate-400 mt-2.5 text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                <span>Operating within standard 1.2s SLA buffer limit.</span>
              </p>
            </div>

            {/* Retrieval MRR */}
            <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5 relative overflow-hidden">
              <span className="text-[10px] font-mono text-slate-550 uppercase font-bold">Retrieval Accuracy (MRR)</span>
              <div className="text-3xl font-display font-bold text-white mt-1.5 leading-none">0.94 / 1.0</div>
              <p className="text-[11px] text-slate-400 mt-2.5">
                Mean Reciprocal Rank tracking semantic relevance match for top-K vector results.
              </p>
            </div>

            {/* OCR Success Rate */}
            <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5 relative overflow-hidden">
              <span className="text-[10px] font-mono text-slate-550 uppercase font-bold">Drawing Ingestion OCR success</span>
              <div className="text-3xl font-display font-bold text-white mt-1.5 leading-none">99.1% Confidence</div>
              <p className="text-[11px] text-slate-400 mt-2.5 text-indigo-400">
                P&ID blueprint schematics and raster drawings successfully formalized into vector tables.
              </p>
            </div>

          </div>

          {/* AI Response latencies chart & Ingestion format breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* AI Response Latency & Query Volume Area Chart */}
            <div className="lg:col-span-2 bg-[#10141F] border border-slate-900 rounded-lg p-5">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">AI Response Latency Profile (Gemini-3.5-Flash)</h3>
                  <p className="text-[11px] text-slate-500">Compares Average, P95, and P99 prompt-to-token response latency over daily hourly intervals.</p>
                </div>
                <span className="text-[10px] font-mono bg-[#090C12] border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                  Model: Gemini-3.5-Flash
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getAiLatencyData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                    <YAxis stroke="#475569" fontSize={10} unit="ms" />
                    <Tooltip contentStyle={{ backgroundColor: "#0F1219", borderColor: "#1F242D", color: "#f8fafc" }} />
                    <Area type="monotone" dataKey="avg" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#latencyGradient)" name="Average Latency (ms)" />
                    <Area type="monotone" dataKey="p95" stroke="#ec4899" strokeWidth={1.5} strokeDasharray="3 3" fill="none" name="P95 Latency (ms)" />
                    <Area type="monotone" dataKey="p99" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 5" fill="none" name="P99 Latency (ms)" />
                    <Legend wrapperStyle={{ fontSize: 9, paddingTop: 10 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ingestion counts by format bar chart */}
            <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-1">Knowledge Ingestion Volume by Format</h3>
              <p className="text-[11px] text-slate-500 mb-5">Distributes ingested technical drawings and logs in the current timeframe.</p>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getIngestionData()} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <XAxis type="number" stroke="#475569" fontSize={9} />
                    <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={9} width={110} />
                    <Tooltip contentStyle={{ backgroundColor: "#0F1219", borderColor: "#1F242D", color: "#f8fafc" }} />
                    <Bar dataKey="volume" fill="#8b5cf6" radius={[0, 3, 3, 0]} name="Pages/Files Indexed">
                      {getIngestionData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Semantic Search Topic trends and accuracies */}
          <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-1">Semantic Search Relevance Trends</h3>
            <p className="text-[11px] text-slate-500 mb-4">Most frequently queried search topics mapped against actual vector retrieval accuracy percentages.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Relevance table */}
              <div className="bg-[#090C12] border border-slate-800 p-4 rounded-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 font-mono text-[9px] uppercase text-slate-550 pb-2">
                        <th>Search Query Intent</th>
                        <th className="text-right">Searches Run</th>
                        <th className="text-right">Retrieval Match Accuracy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {getSearchTrendData().map((item, i) => (
                        <tr key={i} className="hover:bg-slate-900/35">
                          <td className="py-2 font-medium text-slate-250 flex items-center gap-1.5">
                            <Search className="w-3 h-3 text-slate-500" />
                            <span>{item.topic}</span>
                          </td>
                          <td className="py-2 text-right font-mono">{item.searches}</td>
                          <td className="py-2 text-right font-mono font-bold text-emerald-400">{item.accuracy}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Accuracy insight block */}
              <div className="bg-[#090C12] border border-slate-800 p-4 rounded-lg flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-550 block uppercase font-bold">Vector Ingestion & Embedding Pipeline</span>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Our semantic retrieval indices are mapped using high-performance vector embeddings. Retrieval Match Accuracy averages 94.2% across technical documents, ensuring operators get direct and high-precision reference links in under 450ms.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center text-[10px] font-mono">
                  <span>Cosine Similarity Index threshold:</span>
                  <span className="text-indigo-400 font-bold">0.82 (Tight Match)</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* --- DRILL-DOWN DASHBOARD VIEW 4: USER ACTIVITY & DEPARTMENTS --- */}
      {activeSubTab === "users_deps" && (
        <div className="space-y-6">
          
          {/* Sub-tab 4 KPI cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total active sessions */}
            <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5 relative overflow-hidden">
              <span className="text-[10px] font-mono text-slate-550 uppercase font-bold">Active User Sessions</span>
              <div className="text-3xl font-display font-bold text-white mt-1.5 leading-none">{liveMetrics.activeSessions} Terminal nodes</div>
              <p className="text-[11px] text-slate-400 mt-2.5">
                Synchronized station operators actively querying the Unified Asset Brain database.
              </p>
            </div>

            {/* Avg Session Duration */}
            <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5 relative overflow-hidden">
              <span className="text-[10px] font-mono text-slate-550 uppercase font-bold">Average Session Duration</span>
              <div className="text-3xl font-display font-bold text-white mt-1.5 leading-none">42.4 Mins</div>
              <p className="text-[11px] text-slate-400 mt-2.5">
                Measures duration of active plant control-room sessions per shift operator login.
              </p>
            </div>

            {/* Queries per minute */}
            <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5 relative overflow-hidden">
              <span className="text-[10px] font-mono text-slate-550 uppercase font-bold">Live AI Queries Per Minute</span>
              <div className="text-3xl font-display font-bold text-teal-400 mt-1.5 leading-none">{liveMetrics.queriesPerMin} QPM</div>
              <p className="text-[11px] text-slate-400 mt-2.5 text-teal-400">
                Averages 18.5 queries per minute during active turbine thermocouple spread transients.
              </p>
            </div>

            {/* Tribal wisdom addition count */}
            <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5 relative overflow-hidden">
              <span className="text-[10px] font-mono text-slate-550 uppercase font-bold">Tribal Submissions This Month</span>
              <div className="text-3xl font-display font-bold text-white mt-1.5 leading-none">+12 Observations</div>
              <p className="text-[11px] text-slate-400 mt-2.5">
                New practical maintenance procedures submitted by boiler floor maintenance crew.
              </p>
            </div>

          </div>

          {/* User query distribution by role and department task execution time */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Active session role pie chart */}
            <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 mb-1">Session Distribution by Operator Role</h3>
                <p className="text-[11px] text-slate-500 mb-4">Indicates proportion of searches and interactions initiated by role persona.</p>
              </div>

              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getUserRoleSessions()}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {getUserRoleSessions().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                {getUserRoleSessions().map((role) => (
                  <div key={role.name} className="flex items-center gap-2 text-[10.5px] text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: role.color }} />
                    <span className="truncate">{role.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Department task execution times */}
            <div className="lg:col-span-2 bg-[#10141F] border border-slate-900 rounded-lg p-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Task Completion Lead-Time by Department</h3>
                <p className="text-[11px] text-slate-500 mb-5">
                  Tracks the speed (hours) at which active maintenance, safety audits, and corrective procedures are resolved.
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: "Operations Crew", PM: 4.2, CM: 8.5, Audit: 2.1 },
                    { name: "Maintenance A", PM: 6.8, CM: 14.2, Audit: 4.5 },
                    { name: "Engineering", PM: 12.5, CM: 24.0, Audit: 8.0 },
                    { name: "Safety Inspector", PM: 3.5, CM: 6.0, Audit: 1.5 }
                  ]}>
                    <XAxis dataKey="name" stroke="#475569" fontSize={10} />
                    <YAxis stroke="#475569" fontSize={10} unit=" hrs" />
                    <Tooltip contentStyle={{ backgroundColor: "#0F1219", borderColor: "#1F242D", color: "#f8fafc" }} />
                    <Bar dataKey="PM" fill="#10b981" name="Planned PM (hrs)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="CM" fill="#f43f5e" name="Corrective CM (hrs)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Audit" fill="#3b82f6" name="Compliance Audits (hrs)" radius={[3, 3, 0, 0]} />
                    <Legend wrapperStyle={{ fontSize: 9 }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Real-time Scrolling telemetry log stream */}
          <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5">
            <span className="text-[10px] font-mono text-slate-550 block uppercase font-bold mb-3">Live Operator Event Stream</span>
            
            <div className="bg-[#090C12] border border-slate-800 rounded p-3 font-mono text-[10.5px] text-slate-400 space-y-2 max-h-40 overflow-y-auto leading-normal">
              <div>
                <span className="text-slate-600">[10:05:42]</span> <span className="text-indigo-400">[SEARCH_API]</span> Operator <span className="text-slate-200">"OPS-LVL-1"</span> queried LOTO isolation checklist for bypass valve D-201. Match Similarity: <span className="text-emerald-400">96.2%</span>.
              </div>
              <div>
                <span className="text-slate-600">[10:04:18]</span> <span className="text-purple-400">[RCA_ENGINE]</span> Generated FMEA breakdown for P-201B cavitation incident. Extracted <span className="text-slate-200">4 corrective actions</span>.
              </div>
              <div>
                <span className="text-slate-600">[10:02:11]</span> <span className="text-amber-400">[DCS_SYSTEM]</span> Recalibrated EGT sensors on turbine thermocouple TC-03. Offsets aligned back to normal limit spreads.
              </div>
              <div>
                <span className="text-slate-600">[09:58:35]</span> <span className="text-emerald-400">[COMPLIANCE]</span> Safety Inspector <span className="text-slate-200">"EHS-DIR-2"</span> signed off daily steam isolation audit sheet.
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
