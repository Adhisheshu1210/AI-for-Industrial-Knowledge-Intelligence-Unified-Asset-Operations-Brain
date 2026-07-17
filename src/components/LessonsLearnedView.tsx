import React, { useState, useEffect } from "react";
import { 
  Lightbulb, 
  Cpu, 
  Sparkles, 
  BookOpen, 
  Sliders, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight,
  TrendingUp,
  Brain,
  FileText,
  Activity,
  Send,
  Copy,
  Clipboard,
  RefreshCw,
  Bell,
  Users,
  Shield,
  Layers,
  ArrowRight,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { RoleType } from "../types";

// Types for RCA Engine
interface FiveWhysStep {
  step: number;
  question: string;
  answer: string;
}

interface FishboneData {
  people: string[];
  process: string[];
  equipment: string[];
  environment: string[];
  management: string[];
  materials: string[];
}

interface CapaAction {
  type: string;
  action: string;
  priority: string;
  assignedTo: string;
  deadline: string;
  isCompleted?: boolean;
}

interface RiskEstimation {
  likelihood: number;
  impact: number;
  riskScore: number;
  riskTier: string;
}

interface RcaResult {
  title: string;
  incidentSummary: string;
  failureMode: string;
  fiveWhys: FiveWhysStep[];
  fishbone: FishboneData;
  capa: CapaAction[];
  riskEstimation: RiskEstimation;
  knowledgeArticle: string;
  affectedDepartments: string[];
}

// Types for Patterns / Continuous Learning
interface FailurePattern {
  mode: string;
  description: string;
  frequency: number;
}

interface HiddenRelationship {
  sourceAsset: string;
  targetAsset: string;
  correlation: string;
}

interface OperationalRiskPattern {
  risk: string;
  probability: string;
  impact: string;
  mitigation: string;
}

interface PatternsData {
  recurringFailureModes: FailurePattern[];
  hiddenRelationships: HiddenRelationship[];
  operationalRisks: OperationalRiskPattern[];
  proactiveRecommendations: string[];
  summary: string;
}

interface LessonsLearnedViewProps {
  activeRole: RoleType;
  isApiConfigured: boolean;
  documents?: any[];
}

export default function LessonsLearnedView({
  activeRole,
  isApiConfigured,
  documents = []
}: LessonsLearnedViewProps) {
  
  // Navigation: "rca", "tribal", "patterns"
  const [activeSubTab, setActiveSubTab] = useState<"rca" | "tribal" | "patterns">("rca");

  // --- SUB-TAB 1: ROOT CAUSE ANALYSIS (RCA) WORKSPACE STATE ---
  const incidentDocs = documents.filter(doc => 
    doc.category === "incident" || 
    doc.title.toLowerCase().includes("incident") || 
    doc.id.startsWith("INC")
  );

  const [selectedRcaDocId, setSelectedRcaDocId] = useState<string>("INC-2026-042");
  const [customRcaTitle, setCustomRcaTitle] = useState<string>("SGT-900 Turbine Flame Scanner Lens Fogging");
  const [customRcaDesc, setCustomRcaDesc] = useState<string>("During winter cold start procedures on the SGT-900 gas turbine, exhaust sensor spread limits tripped the unit. Operators discovered water vapor and carbon soot condensation on the optical UV scanner lens, causing a false flameout detection.");
  const [rcaResult, setRcaResult] = useState<RcaResult | null>(null);
  const [isRcaLoading, setIsRcaLoading] = useState<boolean>(false);
  const [rcaError, setRcaError] = useState<string | null>(null);

  // Department dispatch state
  const [notifiedDeps, setNotifiedDeps] = useState<Record<string, boolean>>({
    Operations: true,
    Maintenance: true,
    Safety: true,
    Engineering: true,
    Compliance: false
  });
  const [dispatchLogs, setDispatchLogs] = useState<string[]>([]);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [copiedArticle, setCopiedArticle] = useState<boolean>(false);

  // Completed CAPA state tracker
  const [completedCapas, setCompletedCapas] = useState<Record<number, boolean>>({});

  // --- SUB-TAB 2: TRIBAL KNOWLEDGE CODIFICATION STATE (Existing features preserved) ---
  const [rawObservation, setRawObservation] = useState<string>("When the deaerator pre-heater gets sticky during hot summer weeks, the feed bypass valve sometimes chatters. We usually tap the pneumatic pilot housing lightly with a brass hammer to release trapped moisture pockets and stabilize the instrumentation feed.");
  const [lessonContextTitle, setLessonContextTitle] = useState<string>("Deaerator Pre-Heater Bypass valve chattering in high heat");
  const [formalizedResult, setFormalizedResult] = useState<any>({
    formalTitle: "Deaerator Pre-Heater Bypass Valve Pneumatic Chattering & Pilot Desiccant Exhaustion",
    assetCategory: "Feedwater & Thermal Deaeration System (D-201)",
    scientificExplanation: "In high ambient temperatures and humidity, moisture condensation rates inside service air lines exceed the water-stripping capacity of localized coalescing filters. Water droplets accumulate inside the valve pilot chamber, causing hydraulic lock and rapid oscillatory pressure fluctuations (chattering) across the pneumatic valve diaphragm.",
    underlyingEngineeringCause: "The pilot housing acts as an unintended condensing chamber when warm, saturated service air is cooled rapidly inside localized line runs, leading to air binding of the pilot instrumentation valve.",
    interimWorkaroundInstructions: [
      "Operators must conduct manual blowdown on the primary air separator trap filter.",
      "If chattering persists, tap the pilot housing with a non-sparking brass hammer (strictly do NOT use steel or carbon steel tools in gas-rated areas).",
      "Verify valve travel returns to smooth, linear alignment."
    ],
    permanentEngineeringSolution: "Install a localized heated membrane desiccant air dryer upstream of the pneumatic control loop, and transition the chattering pneumatic actuator to a fully electric variable frequency linear drive.",
    safetyCautions: [
      "Never strike a pressurized valve casing with a standard sparking steel tool.",
      "Ensure personal hearing protection is worn during chattering cycles due to decibel thresholds exceeding 85 dBA."
    ]
  });
  const [isTribalLoading, setIsTribalLoading] = useState<boolean>(false);
  const [tribalError, setTribalError] = useState<string | null>(null);
  const [historicalLessons, setHistoricalLessons] = useState([
    {
      id: "LL-042",
      title: "Boiler Furnace Pilot Scanner UV Optical Glass Condensation",
      category: "Boiler BMS (HPB-201)",
      author: "Art Vance (2025)",
      preview: "UV flame scanner lens frequently fogged up during winter cold startups due to vapor condensation."
    },
    {
      id: "LL-018",
      title: "Turbine Thermocouple Calibrations during SGT-900 Exhaust Spread",
      category: "Gas Turbine (SGT-900)",
      author: "S. Jenkins (2024)",
      preview: "EGT thermocouple wires degrade and experience calibration drift due to cyclical exhaust duct hot-path heat stresses."
    }
  ]);

  // --- SUB-TAB 3: CONTINUOUS LEARNING & RISK RADAR STATE ---
  const [patternsData, setPatternsData] = useState<PatternsData | null>(null);
  const [isPatternsLoading, setIsPatternsLoading] = useState<boolean>(false);
  const [patternsError, setPatternsError] = useState<string | null>(null);

  // --- EFFECT: Initial RCA Load to ensure rich default presentation ---
  useEffect(() => {
    handleRunRca();
    handleFetchPatterns(true); // Silent initial load
  }, []);

  // Trigger RCA Analysis
  const handleRunRca = async () => {
    setIsRcaLoading(true);
    setRcaError(null);
    setDispatchLogs([]);
    setCompletedCapas({});

    try {
      const isCustom = selectedRcaDocId === "custom";
      const payload = isCustom ? {
        rawDescription: customRcaDesc,
        title: customRcaTitle
      } : {
        documentId: selectedRcaDocId
      };

      const response = await fetch("/api/lessons/rca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to trigger RCA engine.");
      }

      setRcaResult(data.data);
    } catch (err: any) {
      console.error(err);
      setRcaError(err.message || "Failed to establish AI Root Cause Analysis handshake.");
    } finally {
      setIsRcaLoading(false);
    }
  };

  // Trigger Tribal knowledge codification
  const handleFormalizeLesson = async () => {
    if (!rawObservation.trim()) return;

    setIsTribalLoading(true);
    setTribalError(null);

    try {
      const response = await fetch("/api/lessons/formalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawInput: rawObservation,
          title: lessonContextTitle
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to formalize tribal knowledge.");
      }

      setFormalizedResult(data.data);
      
      const newHistoryLog = {
        id: `LL-${Math.floor(100 + Math.random() * 900)}`,
        title: data.data.formalTitle,
        category: data.data.assetCategory,
        author: activeRole === "operator" ? "Ops Room Crew" : "Reliability Engineer",
        preview: data.data.scientificExplanation.substring(0, 100) + "..."
      };
      setHistoricalLessons(prev => [newHistoryLog, ...prev]);

    } catch (err: any) {
      console.error(err);
      setTribalError(err.message || "Failed to formalize observation standard.");
    } finally {
      setIsTribalLoading(false);
    }
  };

  // Trigger Cross-Document Continuous Learning Patterns
  const handleFetchPatterns = async (isInitial: boolean = false) => {
    if (!isInitial) {
      setIsPatternsLoading(true);
    }
    setPatternsError(null);

    try {
      const response = await fetch("/api/lessons/cross-patterns");
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to scan database patterns.");
      }
      setPatternsData(data.data);
    } catch (err: any) {
      console.error(err);
      if (!isInitial) {
        setPatternsError(err.message || "Failed to query continuous learning pattern engine.");
      }
    } finally {
      if (!isInitial) {
        setIsPatternsLoading(false);
      }
    }
  };

  // Notify escalation flow
  const handleDispatchNotifications = () => {
    setIsDispatching(true);
    setDispatchLogs([]);
    
    const selectedDeps = Object.entries(notifiedDeps)
      .filter(([_, active]) => active)
      .map(([name]) => name);

    if (selectedDeps.length === 0) {
      setDispatchLogs(["[ERROR] No departments selected for notification."]);
      setIsDispatching(false);
      return;
    }

    const timestamp = () => new Date().toLocaleTimeString();

    const steps = [
      () => `[${timestamp()}] [DISPATCHER] Initializing safety alert sequence for incident: "${rcaResult?.title || 'Asset Failure'}"`,
      () => `[${timestamp()}] [EVAL] Fetching corrective action items (CAPA) and risk score (${rcaResult?.riskEstimation.riskScore || '12'})...`,
      ...selectedDeps.map(dep => () => `[${timestamp()}] [SUCCESS] Safety bulletin broadcasted to ${dep.toUpperCase()} pipeline with corrective task.`),
      () => `[${timestamp()}] [SUCCESS] Standard Procedure amendments locked and deployed to the Digital Knowledge Repository.`
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setDispatchLogs(prev => [...prev, steps[currentStep]()]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsDispatching(false);
      }
    }, 600);
  };

  const copyToClipboard = () => {
    if (!rcaResult) return;
    navigator.clipboard.writeText(rcaResult.knowledgeArticle);
    setCopiedArticle(true);
    setTimeout(() => setCopiedArticle(false), 2000);
  };

  // Dynamic risk grid styling helpers
  const getRiskCellColor = (row: number, col: number) => {
    const product = row * col;
    if (product >= 15) return "bg-rose-500/20 border-rose-500/40 text-rose-400";
    if (product >= 8) return "bg-amber-500/20 border-amber-500/40 text-amber-400";
    return "bg-emerald-500/20 border-emerald-500/40 text-emerald-400";
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0B0D13] font-sans text-slate-200" id="lessons-view">
      
      {/* Title Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-600/10 text-blue-400 border border-blue-500/15 uppercase">
              Module 04: Reliability & Learning
            </span>
            <span className="text-slate-500 font-mono text-xs">• root cause analysis & cross-document patterns</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2 mt-1">
            <Brain className="w-6 h-6 text-indigo-500 glow-indigo-svg" />
            <span>Reliability Learning & Root Cause Engine</span>
          </h2>
          <p className="text-slate-500 text-xs">
            Synthesize historical incident reports, analyze failures using 5-Whys and Fishbone diagrams, and proactively map cross-document risk correlations.
          </p>
        </div>

        {/* Global Tab Navigator */}
        <div className="bg-[#121622] p-1 rounded-lg border border-slate-800 flex gap-1">
          <button
            onClick={() => setActiveSubTab("rca")}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === "rca" 
                ? "bg-indigo-600 text-white shadow-sm" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>RCA Workspace</span>
          </button>
          <button
            onClick={() => setActiveSubTab("patterns")}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === "patterns" 
                ? "bg-indigo-600 text-white shadow-sm" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Continuous Learning</span>
            {patternsData && (
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab("tribal")}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === "tribal" 
                ? "bg-indigo-600 text-white shadow-sm" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Tribal Codification</span>
          </button>
        </div>
      </div>

      {/* --- SUB-TAB 1: AI ROOT CAUSE ANALYSIS (RCA) WORKSPACE --- */}
      {activeSubTab === "rca" && (
        <div className="space-y-6">
          
          {/* Analysis Selection Panel */}
          <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-slate-400 mb-4 font-bold">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Incident Selector & Diagnostics Console</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              
              {/* Document Dropdown Selector */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1.5 font-bold">
                  Choose Incident Document / Operational Log
                </label>
                <div className="relative">
                  <select
                    value={selectedRcaDocId}
                    onChange={(e) => setSelectedRcaDocId(e.target.value)}
                    className="w-full appearance-none bg-[#090C12] border border-slate-800 text-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium pr-10"
                  >
                    {/* Add predefined high-fidelity default */}
                    <option value="INC-2026-042">INC-2026-042: Feedwater Pump P-201B Cavitation Incident Report</option>
                    {incidentDocs.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.id}: {doc.title}</option>
                    ))}
                    <option value="custom">-- Custom Diagnostics Incident Input --</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Action Button */}
              <div className="md:col-span-2">
                <button
                  onClick={handleRunRca}
                  disabled={isRcaLoading}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer glow-indigo disabled:opacity-50 h-9"
                >
                  {isRcaLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Deconstructing Failure Physics...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-indigo-200" />
                      <span>Generate AI Root Cause Analysis</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Custom Input Fields (Visible only if custom is selected) */}
            <AnimatePresence>
              {selectedRcaDocId === "custom" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1 font-bold">
                      Custom Case Title
                    </label>
                    <input
                      type="text"
                      value={customRcaTitle}
                      onChange={(e) => setCustomRcaTitle(e.target.value)}
                      placeholder="e.g. Turbine Exhaust Overheat Trip"
                      className="w-full bg-[#090C12] border border-slate-800 text-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1 font-bold">
                      Incident Summary / Symptom Description
                    </label>
                    <input
                      type="text"
                      value={customRcaDesc}
                      onChange={(e) => setCustomRcaDesc(e.target.value)}
                      placeholder="e.g. SGT-900 gas turbine thermocouple spread limit exceeded..."
                      className="w-full bg-[#090C12] border border-slate-800 text-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {rcaError && (
              <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded">
                {rcaError}. Showing high-fidelity offline reliability knowledge card.
              </div>
            )}
          </div>

          {/* Core RCA Workspace Bento Grid */}
          {isRcaLoading ? (
            <div className="h-96 flex flex-col items-center justify-center bg-[#10141F] border border-slate-900 rounded-lg space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-center space-y-1">
                <p className="text-xs font-mono font-bold text-indigo-400 animate-pulse">RUNNING FIVE-WHYS SEQUENCE & FISHBONE GENERATION...</p>
                <p className="text-[10px] text-slate-550">Compiling failure logs, SOP limits, and material shear constants.</p>
              </div>
            </div>
          ) : rcaResult ? (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Left Column (2/3 width on wide screens): Failure diagnostics */}
              <div className="xl:col-span-2 space-y-6">
                
                {/* Incident Briefing & Failure Mode */}
                <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wider">
                        Active Incident Dossier
                      </span>
                      <h3 className="text-base font-bold text-white mt-2 leading-snug">
                        {rcaResult.title}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-mono uppercase text-slate-550 block">Risk Status</span>
                      <span className={`text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded mt-1 inline-block border ${
                        rcaResult.riskEstimation.riskTier === "CRITICAL"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse"
                          : rcaResult.riskEstimation.riskTier === "HIGH"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {rcaResult.riskEstimation.riskTier} (Score: {rcaResult.riskEstimation.riskScore})
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-350 leading-relaxed bg-[#090C12] p-3 rounded border border-slate-800/80 italic mt-4">
                    "{rcaResult.incidentSummary}"
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800/60">
                    <div>
                      <span className="text-[9px] font-mono uppercase text-slate-500 block font-bold">Failure Mode Signature</span>
                      <p className="text-xs font-semibold text-slate-300 mt-1">
                        {rcaResult.failureMode}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono uppercase text-slate-500 block font-bold">Affected Core Departments</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rcaResult.affectedDepartments.map((dep, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-[#1A1E2C] border border-slate-800 text-[9px] text-slate-400 font-medium uppercase font-mono">
                            {dep}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5-Whys Analysis Cascade */}
                <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5">
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-indigo-400 mb-5 font-bold">
                    <Layers className="w-4 h-4" />
                    <span>The Five Whys Systematic Cascade</span>
                  </div>

                  <div className="space-y-4">
                    {rcaResult.fiveWhys.map((w, index) => (
                      <div key={index} className="relative pl-9 border-l border-slate-800 pb-2 last:pb-0">
                        {/* Number bullet */}
                        <div className="absolute -left-[14px] top-0 w-7 h-7 rounded-full bg-[#161B29] border border-slate-800 flex items-center justify-center text-xs font-mono font-bold text-indigo-400 shadow-sm">
                          Y{w.step}
                        </div>

                        <div className="bg-[#090C12] border border-slate-800/80 p-3 rounded-md space-y-1.5 shadow-sm hover:border-slate-800 transition-colors">
                          <span className="text-[9px] font-mono uppercase text-indigo-400 block font-bold">
                            Question: {w.question}
                          </span>
                          <p className="text-xs text-slate-300 font-medium">
                            Answer: {w.answer}
                          </p>
                        </div>

                        {index < rcaResult.fiveWhys.length - 1 && (
                          <div className="absolute -left-[3px] top-8 text-indigo-500/40">
                            <ArrowRight className="w-3 h-3 rotate-90" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Ishikawa Fishbone Diagram */}
                <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5">
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-indigo-400 font-bold">
                      <Cpu className="w-4 h-4 text-purple-400" />
                      <span>Ishikawa Fishbone Diagram (Organizational Causes)</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-550 uppercase">Structured Taxonomy</span>
                  </div>

                  {/* Fishbone bento layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    
                    {/* People */}
                    <div className="bg-[#090C12] border border-slate-800 p-3 rounded-lg space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                        <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold">PEOPLE</span>
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      <ul className="space-y-1.5">
                        {rcaResult.fishbone.people.map((item, i) => (
                          <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5 leading-snug">
                            <span className="text-indigo-400 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Process */}
                    <div className="bg-[#090C12] border border-slate-800 p-3 rounded-lg space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                        <span className="text-[10px] font-mono uppercase text-teal-400 font-bold">PROCESS</span>
                        <Sliders className="w-3.5 h-3.5 text-teal-400" />
                      </div>
                      <ul className="space-y-1.5">
                        {rcaResult.fishbone.process.map((item, i) => (
                          <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5 leading-snug">
                            <span className="text-teal-400 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Equipment */}
                    <div className="bg-[#090C12] border border-slate-800 p-3 rounded-lg space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                        <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">EQUIPMENT</span>
                        <Cpu className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <ul className="space-y-1.5">
                        {rcaResult.fishbone.equipment.map((item, i) => (
                          <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5 leading-snug">
                            <span className="text-amber-400 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Environment */}
                    <div className="bg-[#090C12] border border-slate-800 p-3 rounded-lg space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                        <span className="text-[10px] font-mono uppercase text-sky-400 font-bold">ENVIRONMENT</span>
                        <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                      </div>
                      <ul className="space-y-1.5">
                        {rcaResult.fishbone.environment.map((item, i) => (
                          <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5 leading-snug">
                            <span className="text-sky-400 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Management */}
                    <div className="bg-[#090C12] border border-slate-800 p-3 rounded-lg space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                        <span className="text-[10px] font-mono uppercase text-rose-400 font-bold">MANAGEMENT</span>
                        <Shield className="w-3.5 h-3.5 text-rose-400" />
                      </div>
                      <ul className="space-y-1.5">
                        {rcaResult.fishbone.management.map((item, i) => (
                          <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5 leading-snug">
                            <span className="text-rose-400 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Materials */}
                    <div className="bg-[#090C12] border border-slate-800 p-3 rounded-lg space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                        <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">MATERIALS</span>
                        <Layers className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <ul className="space-y-1.5">
                        {rcaResult.fishbone.materials.map((item, i) => (
                          <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5 leading-snug">
                            <span className="text-purple-400 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>
                </div>

                {/* Corrective & Preventive Action Plan (CAPA) */}
                <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-indigo-400 font-bold">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>CAPA Action Center (Mitigation & Redundancies)</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15">
                      Verify Actions Live
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-800 rounded-lg">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#090C12] text-slate-400 font-mono text-[9px] uppercase border-b border-slate-800">
                          <th className="p-3 w-12 text-center">Status</th>
                          <th className="p-3 w-20">Type</th>
                          <th className="p-3">Corrective / Preventive Action Item</th>
                          <th className="p-3 w-20">Priority</th>
                          <th className="p-3 w-24">Owner</th>
                          <th className="p-3 w-20">Deadline</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {rcaResult.capa.map((item, index) => {
                          const isCompleted = completedCapas[index] || false;
                          return (
                            <tr key={index} className={`hover:bg-[#151A29]/30 transition-all ${isCompleted ? "opacity-55 line-through text-slate-500" : ""}`}>
                              <td className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isCompleted}
                                  onChange={() => setCompletedCapas(prev => ({ ...prev, [index]: !isCompleted }))}
                                  className="w-3.5 h-3.5 rounded border-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                                />
                              </td>
                              <td className="p-3">
                                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase border font-bold ${
                                  item.type === "Corrective" 
                                    ? "bg-amber-500/15 text-amber-400 border-amber-500/20" 
                                    : "bg-blue-500/15 text-blue-400 border-blue-500/20"
                                }`}>
                                  {item.type}
                                </span>
                              </td>
                              <td className="p-3 font-medium text-slate-200">
                                {item.action}
                              </td>
                              <td className="p-3">
                                <span className={`text-[9px] font-mono font-bold uppercase ${
                                  item.priority === "CRITICAL" || item.priority === "HIGH"
                                    ? "text-rose-400"
                                    : "text-amber-400"
                                }`}>
                                  {item.priority}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-[10px] text-slate-400">
                                {item.assignedTo}
                              </td>
                              <td className="p-3 font-mono text-[10px] text-slate-400">
                                {item.deadline}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Right Column (1/3 width): Risk, Dispatcher, Knowledge article */}
              <div className="space-y-6">
                
                {/* Visual Risk Grid Visualizer */}
                <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5">
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-indigo-400 mb-4 font-bold">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    <span>Future Risk Matrix Estimator</span>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-4 leading-normal">
                    Likelihood vs Impact assessment. Blinking ring signals projected asset operational risk if corrective measures are deferred.
                  </p>

                  <div className="flex flex-col items-center">
                    
                    {/* Matrix grid container */}
                    <div className="grid grid-cols-6 gap-1 w-full max-w-[280px]">
                      
                      {/* Empty top corner */}
                      <div></div>
                      {/* Header row 1-5 */}
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="text-center font-mono text-[9px] font-bold text-slate-500 pb-1">I{i}</div>
                      ))}

                      {/* Row loop 5 down to 1 */}
                      {[5, 4, 3, 2, 1].map(row => (
                        <React.Fragment key={row}>
                          {/* Row label */}
                          <div className="flex items-center justify-end font-mono text-[9px] font-bold text-slate-500 pr-1.5">L{row}</div>
                          
                          {/* 5 data cells */}
                          {[1, 2, 3, 4, 5].map(col => {
                            const isMatch = rcaResult.riskEstimation.likelihood === row && rcaResult.riskEstimation.impact === col;
                            return (
                              <div
                                key={col}
                                className={`aspect-square rounded border flex items-center justify-center relative transition-all ${getRiskCellColor(row, col)} ${isMatch ? "ring-2 ring-indigo-500 scale-105 shadow-md" : ""}`}
                              >
                                <span className="text-[9px] font-mono font-bold opacity-30">{row * col}</span>
                                {isMatch && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping absolute"></span>
                                    <span className="w-2.5 h-2.5 rounded-full bg-white border border-indigo-600 shadow-md"></span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>

                    <div className="flex justify-between w-full max-w-[280px] text-[8px] text-slate-550 font-mono mt-2 px-1">
                      <span>L: Likelihood (1-5)</span>
                      <span>I: Impact (1-5)</span>
                    </div>

                    {/* Calculated values block */}
                    <div className="mt-4 pt-4 border-t border-slate-800/60 w-full flex justify-between items-center bg-[#090C12] p-3 rounded-lg border">
                      <div>
                        <span className="text-[9px] font-mono uppercase text-slate-500 block">Calculated Risk Index</span>
                        <span className="text-base font-mono font-bold text-white mt-1 block">
                          {rcaResult.riskEstimation.likelihood} × {rcaResult.riskEstimation.impact} = {rcaResult.riskEstimation.riskScore}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-mono uppercase text-slate-500 block">Assessed Severity</span>
                        <span className={`text-[10px] font-bold font-mono uppercase mt-1 inline-block ${
                          rcaResult.riskEstimation.riskTier === "CRITICAL" ? "text-rose-400" : rcaResult.riskEstimation.riskTier === "HIGH" ? "text-amber-400" : "text-emerald-400"
                        }`}>
                          {rcaResult.riskEstimation.riskTier}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Escalation & Notification Station */}
                <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5">
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-indigo-400 mb-4 font-bold">
                    <Bell className="w-4 h-4 text-amber-500" />
                    <span>HSE Escalation Dispatcher</span>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-4 leading-normal">
                    Select operations centers and departments to propagate standard procedure changes and corrective actions.
                  </p>

                  <div className="space-y-2 mb-4 bg-[#090C12] p-3 rounded-lg border border-slate-800/80">
                    {Object.keys(notifiedDeps).map((dep) => (
                      <label key={dep} className="flex items-center gap-2 text-xs text-slate-300 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifiedDeps[dep]}
                          onChange={(e) => setNotifiedDeps(prev => ({ ...prev, [dep]: e.target.checked }))}
                          className="w-3.5 h-3.5 rounded border-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                        />
                        <span className="uppercase font-mono text-[10px]">{dep} Center</span>
                      </label>
                    ))}
                  </div>

                  <button
                    onClick={handleDispatchNotifications}
                    disabled={isDispatching}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isDispatching ? "Propagating Alerts..." : "Dispatch Safety bulletins"}</span>
                  </button>

                  {/* Dispatch Console Output */}
                  {dispatchLogs.length > 0 && (
                    <div className="mt-4 bg-[#050608] border border-slate-900 rounded p-3 font-mono text-[9px] text-slate-400 space-y-1.5 max-h-32 overflow-y-auto leading-normal">
                      {dispatchLogs.map((log, index) => (
                        <div key={index} className="border-b border-slate-950 pb-1 last:border-b-0">
                          {log}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Standards amendment draft copyable area */}
                <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-indigo-400 font-bold">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>Knowledge Article (KA)</span>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white cursor-pointer flex items-center gap-1 text-[10px] font-mono border border-slate-800"
                    >
                      {copiedArticle ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Draft</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-[#090C12] border border-slate-800 rounded-lg p-3 max-h-72 overflow-y-auto font-mono text-[10px] text-slate-450 whitespace-pre-wrap leading-relaxed">
                    {rcaResult.knowledgeArticle}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center bg-[#10141F] border border-slate-900 rounded-lg">
              <Brain className="w-12 h-12 text-slate-700 mb-3" />
              <p className="text-xs text-slate-500">No Root Cause Analysis compiled yet. Trigger the diagnostics suite above.</p>
            </div>
          )}

        </div>
      )}

      {/* --- SUB-TAB 2: CONTINUOUS LEARNING & CROSS-DOCUMENT RISK RADAR --- */}
      {activeSubTab === "patterns" && (
        <div className="space-y-6">
          
          {/* Diagnostic overview banner */}
          <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider">
                Continuous Learning Engine
              </span>
              <h3 className="text-base font-bold text-white mt-1.5">
                Cross-Document Pattern Classifier
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Reads all uploaded manuals, historical shift logs, and SOPs to surface recurring failure modes and map system interdependencies.
              </p>
            </div>
            
            <button
              onClick={() => handleFetchPatterns(false)}
              disabled={isPatternsLoading}
              className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPatternsLoading ? "animate-spin" : ""}`} />
              <span>{isPatternsLoading ? "Re-Scanning Repository..." : "Scan Document Database"}</span>
            </button>
          </div>

          {isPatternsLoading ? (
            <div className="h-96 flex flex-col items-center justify-center bg-[#10141F] border border-slate-900 rounded-lg space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-center space-y-1">
                <p className="text-xs font-mono font-bold text-indigo-400 animate-pulse">CLASSIFYING CORRELATIONS ACROSS ASSET LOGS...</p>
                <p className="text-[10px] text-slate-550">Processing Gas Turbine manuals, Boiler SOPs, and Incident reports.</p>
              </div>
            </div>
          ) : patternsData ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column (2/3 width): Failure modes & interdependencies */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Recurring Failure Modes */}
                <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5">
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-indigo-400 mb-4 font-bold">
                    <Activity className="w-4 h-4 text-rose-400" />
                    <span>Systemic Recurring Failure Modes</span>
                  </div>

                  <div className="space-y-3.5">
                    {patternsData.recurringFailureModes.map((pattern, index) => (
                      <div key={index} className="bg-[#090C12] border border-slate-850 p-4 rounded-lg flex justify-between gap-4 hover:border-slate-850 transition-colors">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                            {pattern.mode}
                          </h4>
                          <p className="text-xs text-slate-400 leading-normal">
                            {pattern.description}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-[9px] font-mono text-slate-500 uppercase block">Frequency</span>
                          <span className="text-sm font-mono font-bold text-rose-400 block mt-1">
                            {pattern.frequency} Matches
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hidden System Interdependencies & Relationships */}
                <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5">
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-indigo-400 mb-4 font-bold">
                    <Layers className="w-4 h-4 text-teal-400" />
                    <span>Hidden System Interdependencies (Cross-Asset Impacts)</span>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-4">
                    The cognitive engine identified direct relationships between different physical subsystems that contribute to safety limit triggers.
                  </p>

                  <div className="space-y-3">
                    {patternsData.hiddenRelationships.map((rel, index) => (
                      <div key={index} className="bg-[#090C12] border border-slate-800 p-3.5 rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-mono">
                          <span className="text-teal-400 font-bold uppercase">{rel.sourceAsset}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-indigo-400 font-bold uppercase">{rel.targetAsset}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-normal">
                          <strong className="text-slate-350">Correlative Impact:</strong> {rel.correlation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column (1/3 width): Global risks & recommendations */}
              <div className="space-y-6">
                
                {/* Global Operational Risks */}
                <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5">
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-indigo-400 mb-4 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Top Global Operational Risks</span>
                  </div>

                  <div className="space-y-3">
                    {patternsData.operationalRisks.map((risk, index) => (
                      <div key={index} className="bg-[#090C12] border border-slate-800 p-3 rounded-lg space-y-1.5">
                        <div className="flex justify-between items-center">
                          <h5 className="text-[11px] font-bold text-slate-200 uppercase">{risk.risk}</h5>
                          <span className="text-[9px] font-mono font-bold uppercase text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/15">
                            {risk.impact}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          <strong className="text-slate-500">Mitigation:</strong> {risk.mitigation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proactive Reliability Recommendations */}
                <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5">
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-indigo-400 mb-4 font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Proactive Reliability Recommendations</span>
                  </div>

                  <ul className="space-y-3">
                    {patternsData.proactiveRecommendations.map((rec, index) => (
                      <li key={index} className="flex gap-2 text-xs text-slate-300 items-start leading-snug">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cognitive Engine Summary */}
                <div className="bg-[#10141F] border border-slate-900 rounded-lg p-5">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block font-bold">Cognitive Engine Summary</span>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed italic bg-[#090C12] p-3 rounded border border-slate-800">
                    "{patternsData.summary}"
                  </p>
                </div>

              </div>

            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center bg-[#10141F] border border-slate-900 rounded-lg">
              <TrendingUp className="w-12 h-12 text-slate-700 mb-3" />
              <p className="text-xs text-slate-500">No failure patterns mapped yet. Trigger the re-scan of the repository above.</p>
            </div>
          )}

        </div>
      )}

      {/* --- SUB-TAB 3: TRIBAL KNOWLEDGE CODIFICATION (Existing Preserved Features) --- */}
      {activeSubTab === "tribal" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Input: tribal knowledge capture */}
          <div className="space-y-6">
            <div className="bg-[#10141F] border border-slate-900 p-5 rounded-lg">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-slate-400 mb-4 font-bold">
                <Brain className="w-4 h-4 text-indigo-400" />
                <span>Tribal Wisdom Capture</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1 font-bold">
                    Observation Context Title
                  </label>
                  <input
                    type="text"
                    value={lessonContextTitle}
                    onChange={(e) => setLessonContextTitle(e.target.value)}
                    placeholder="e.g. Striking the sticky valve"
                    className="w-full bg-[#090C12] border border-slate-800 text-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1 font-bold">
                    Raw Operator Tip / Floor Observation
                  </label>
                  <textarea
                    value={rawObservation}
                    onChange={(e) => setRawObservation(e.target.value)}
                    placeholder="e.g. When the valve jams in winter, give the air trap filter a kick..."
                    rows={8}
                    className="w-full bg-[#090C12] border border-slate-800 text-slate-200 rounded px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono leading-relaxed"
                  ></textarea>
                </div>

                {tribalError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded">
                    {tribalError}. Showing sandbox formalized lesson reference.
                  </div>
                )}

                <button
                  onClick={handleFormalizeLesson}
                  disabled={isTribalLoading || !rawObservation.trim()}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:opacity-50 cursor-pointer glow-indigo"
                >
                  {isTribalLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Formalizing Tribal Wisdom...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Formalize Observation</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Digitized logs history list */}
            <div className="bg-[#10141F] border border-slate-900 p-5 rounded-lg">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-slate-400 mb-3.5 font-bold">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Digitized Lessons Logs</span>
              </div>

              <div className="space-y-3 divide-y divide-slate-800/80">
                {historicalLessons.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0">
                    <div className="flex justify-between items-start text-[10px] font-mono">
                      <span className="text-slate-500 font-bold">{item.id}</span>
                      <span className="text-slate-500 italic">By: {item.author}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200 leading-tight mt-1">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 italic leading-relaxed">
                      "{item.preview}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Output Display: Formalized standard report */}
          <div className="lg:col-span-2 bg-[#10141F] border border-slate-900 p-5 rounded-lg flex flex-col justify-between min-h-[500px]">
            {formalizedResult ? (
              <div className="space-y-5">
                
                {/* Header Standard Standardized Title */}
                <div className="pb-3.5 border-b border-slate-800 flex justify-between items-start gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-blue-600/10 text-blue-400 border border-blue-600/15 uppercase">
                        Formalized Standard Draft
                      </span>
                      <span className="text-slate-500 font-mono text-[9px] uppercase">Procedural Amendment</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-200 mt-1.5 leading-tight">
                      {formalizedResult.formalTitle}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">
                      Asset Domain: {formalizedResult.assetCategory}
                    </p>
                  </div>
                </div>

                {/* Scientific explanation */}
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1 font-bold">
                    Scientific Rationale (System Physics)
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-[#090C12] p-3 rounded border border-slate-800/80 italic">
                    "{formalizedResult.scientificExplanation}"
                  </p>
                </div>

                {/* Underlying engineering cause */}
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1 font-bold">
                    Fundamental Engineering Cause
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {formalizedResult.underlyingEngineeringCause}
                  </p>
                </div>

                {/* Grid Workarounds & permanent solutions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Interim workarounds list */}
                  <div>
                    <span className="text-[10px] uppercase font-mono text-blue-400 block mb-2 font-bold tracking-wider">
                      Interim Operator Floor Guidelines
                    </span>
                    <ul className="space-y-1.5 text-xs">
                      {formalizedResult.interimWorkaroundInstructions.map((inst: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-slate-400">
                          <ChevronRight className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span>{inst}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Permanent physical fixes */}
                  <div>
                    <span className="text-[10px] uppercase font-mono text-emerald-400 block mb-1.5 font-bold tracking-wider">
                      Permanent Reliability Engineering Solution
                    </span>
                    <p className="text-xs text-slate-400 bg-[#090C12] p-2.5 rounded border border-slate-800 leading-normal">
                      {formalizedResult.permanentEngineeringSolution}
                    </p>
                  </div>
                </div>

                {/* Safety warnings */}
                <div className="pt-3 border-t border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-rose-500 block mb-2 font-bold tracking-wider">
                    Critical Safety Precautions & Cautions
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {formalizedResult.safetyCautions.map((warn: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                        <span>{warn}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <Brain className="w-12 h-12 text-slate-700 mb-3" />
                <p className="text-xs text-center max-w-sm">No digitized lesson formalized. Enter raw tip details on the left and click "Formalize Observation".</p>
              </div>
            )}

            <div className="text-[9px] font-mono text-slate-500 mt-4 pt-2 border-t border-slate-800 flex justify-between uppercase">
              <span>Codification Standard: ISO-9001 / Knowledge Hub</span>
              <span>Digitizer Terminal: Online</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
