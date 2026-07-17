import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Cpu, 
  AlertTriangle, 
  FileText, 
  Lock, 
  Unlock, 
  Sparkles, 
  Plus, 
  Activity, 
  Layers, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Clock,
  Download,
  Calendar,
  User,
  ShieldAlert,
  Printer,
  ChevronRight,
  RefreshCw,
  Bell,
  CheckSquare,
  Square,
  BarChart2,
  ListTodo,
  FileCheck
} from "lucide-react";
import { Document, RoleType, ComplianceResult } from "../types";

interface ComplianceIntelligenceViewProps {
  documents: Document[];
  activeRole: RoleType;
  isApiConfigured: boolean;
}

interface ComplianceGap {
  clause: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  description: string;
  regulationReference: string;
  likelihoodRating?: number; // 1-5 for risk matrix
  severityRating?: number;   // 1-5 for risk matrix
}

interface ExpiredCertification {
  item: string;
  status: string;
  expiryDate: string;
  risk: string;
}

interface RemedialAction {
  id: string;
  action: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  assignedTo: string;
  timeframe: string;
  status: "PENDING" | "ASSIGNED" | "RESOLVED";
}

interface EvidenceItem {
  clause: string;
  textQuote: string;
  evidenceRating: string;
}

interface DetailedAuditReport {
  complianceScore: number;
  summary: string;
  gaps: ComplianceGap[];
  expiredCertifications: ExpiredCertification[];
  auditRisks: string[];
  qualityDeviations: string[];
  unsafeOperatingProcedures: string[];
  remedialActionPlan: RemedialAction[];
  evidencePackage: EvidenceItem[];
  recommendations: string[];
  source: string;
}

interface HistoricalAudit {
  id: string;
  title: string;
  framework: string;
  score: number;
  date: string;
  auditedBy: string;
  gapsCount: number;
}

interface ComplianceReminder {
  id: string;
  title: string;
  regulation: string;
  dueDate: string;
  assignedRole: string;
  completed: boolean;
}

export default function ComplianceIntelligenceView({
  documents,
  activeRole,
  isApiConfigured
}: ComplianceIntelligenceViewProps) {
  
  // Suite Switcher: Document Auditor vs Interactive LOTO Panel
  const [activeSuite, setActiveSuite] = useState<"auditor" | "loto">("auditor");

  // Auditor States
  const [selectedDocId, setSelectedDocId] = useState<string>("SOP-HPB-702");
  const [selectedFramework, setSelectedFramework] = useState<string>("Factory Act 1948 (Safety Standards)");
  const [customDocTitle, setCustomDocTitle] = useState<string>("");
  const [customDocContent, setCustomDocContent] = useState<string>("");
  
  const [auditLoading, setAuditLoading] = useState<boolean>(false);
  const [auditProgressStep, setAuditProgressStep] = useState<string>("");
  const [auditError, setAuditError] = useState<string | null>(null);
  
  // Tab within the Auditor Results Viewer
  const [activeResultTab, setActiveResultTab] = useState<"gaps" | "actions" | "evidence" | "certs">("gaps");

  // Clicked Gap state for interactive Risk Matrix focus
  const [selectedMatrixGap, setSelectedMatrixGap] = useState<ComplianceGap | null>(null);

  // Active Document Audit Report State
  const [auditReport, setAuditReport] = useState<DetailedAuditReport | null>({
    complianceScore: 82,
    summary: "Comprehensive evaluation of SOP-HPB-702 (High-Pressure Steam Boiler HPB-201 Startup Sequence) against Factory Act 1948 (Safety Standards). The procedure covers primary pre-purge safety controls and pilot UV flame scanner checks to a high standard. However, several mandatory hydrostatic inspection logs, independent third-party fitment certificates, and formal supervisor sign-offs are missing or undocumented.",
    gaps: [
      {
        clause: "Factory Act Section 31: Safety of Pressure Plants",
        severity: "HIGH",
        description: "Missing independent certified third-party hydrostatic testing log or certificate. Last structural wall-thickness ultrasonic test is undocumented.",
        regulationReference: "Factory Act 1948 - Section 31",
        likelihoodRating: 3,
        severityRating: 4
      },
      {
        clause: "Factory Act Section 21: Safety Gate Interlocks & Lineups",
        severity: "MEDIUM",
        description: "Manual walkdown of SSV-501 gas shutoff valve lacks dual-signature verification prior to pilot ignition. Allows single-operator oversight.",
        regulationReference: "Factory Act 1948 - Section 21",
        likelihoodRating: 2,
        severityRating: 3
      },
      {
        clause: "Factory Act Section 111A: Annual Operator Competency Certification",
        severity: "MEDIUM",
        description: "The SOP contains no reference to validating mandatory operator annual safety certification before executing high-hazard steam boiler startups.",
        regulationReference: "Operator Training Compliance Standards",
        likelihoodRating: 4,
        severityRating: 2
      },
      {
        clause: "Factory Act Section 38: Precautions in Case of Fire",
        severity: "CRITICAL",
        description: "The SOP allows the ignition spark to operate up to 10 seconds before lockout without enforcing a mandatory gas evacuation purge if pilot flame fail triggers.",
        regulationReference: "Factory Act 1948 - Section 38",
        likelihoodRating: 3,
        severityRating: 5
      }
    ],
    expiredCertifications: [
      {
        item: "Form No. 8: Certified Boiler Inspector Fitment Clearance",
        status: "EXPIRED (by 14 Days)",
        expiryDate: "2026-07-03",
        risk: "High audit risk. Plant subject to immediate Stop-Work notice or regulatory audit penalty under state safety rules."
      },
      {
        item: "Pneumatic Pressure Gauge calibration Tag #PG-102",
        status: "EXPIRED (by 45 Days)",
        expiryDate: "2026-06-02",
        risk: "Medium quality risk. Measurement drift could compromise drum temperature expansion rate metrics."
      }
    ],
    auditRisks: [
      "Incomplete physical lockout/tagout board validation logs prior to burner purge ignition.",
      "No secondary backflow prevention check documented for feed water pumps parallel lines.",
      "Allowing manual bypass overrides during low-fire startup sequence without mechanical supervisor supervision."
    ],
    qualityDeviations: [
      "Lack of real-time thermal ramp tracking (maximum 50°F/hour) increases boiler tube joints mechanical fatigue risk.",
      "Unregistered pneumatic regulator filters can trigger sudden combustion air starving."
    ],
    unsafeOperatingProcedures: [
      "Step 1(c) allows mechanical bypass without verifying complete electrical lockout state of adjacent active valves.",
      "Step 3 allows ignition spark to repeat without mandatory 15-minute standard gas evacuation purge on flame scanner failure."
    ],
    remedialActionPlan: [
      {
        id: "ACT-001",
        action: "Schedule emergency third-party certified boiler fitment inspection and file Form No. 8",
        priority: "HIGH",
        assignedTo: "Plant Manager",
        timeframe: "72 Hours",
        status: "PENDING"
      },
      {
        id: "ACT-002",
        action: "Replace physical calibration tag and recalibrate Gauge PG-102 at boiler control loop",
        priority: "MEDIUM",
        assignedTo: "Safety Inspector",
        timeframe: "7 Days",
        status: "PENDING"
      },
      {
        id: "ACT-003",
        action: "Amend SOP-HPB-702 to enforce a mandatory 15-minute purge on burner ignition failure",
        priority: "HIGH",
        assignedTo: "Engineer",
        timeframe: "5 Days",
        status: "PENDING"
      }
    ],
    evidencePackage: [
      {
        clause: "Factory Act Section 32 - Furnace Pre-Purge Execution",
        textQuote: "Open combustion air damper fully to 100%. Maintain a purge air flow rate of at least 12,000 CFM for a continuous period of 300 seconds (5 minutes).",
        evidenceRating: "SECURE - FULLY COMPLIANT"
      },
      {
        clause: "OSHA & Factory Act Energy Isolation Mandates",
        textQuote: "Flame scanner (UV optical sensor) must detect a stable pilot flame within 8 seconds of spark initiation... Else execute immediate Lockout Trip.",
        evidenceRating: "SECURE - COMPLIANT"
      }
    ],
    recommendations: [
      "Enforce digital 'Four-Eyes' approval signature step on the DCS console before pilot ignition.",
      "Connect pressure transmitter telemetry to the central regulatory dashboard to automate validation.",
      "Establish a digital lockbox inventory system synchronized with the plant floor LOTO station."
    ],
    source: "INITIAL_Grounding_RECORDS"
  });

  // Reminders State
  const [reminders, setReminders] = useState<ComplianceReminder[]>([
    { id: "REM-001", title: "Form No. 8 Hydrostatic Vessel Re-certification", regulation: "Factory Act Sec 31", dueDate: "2026-07-25", assignedRole: "plant_manager", completed: false },
    { id: "REM-002", title: "Recalibrate Boiler drum pressure gauge PG-102", regulation: "ISO 9001 Clause 7.1.5", dueDate: "2026-07-28", assignedRole: "engineer", completed: false },
    { id: "REM-003", title: "Annual PESO valve seal validation check", regulation: "PESO Gas Rules", dueDate: "2026-08-05", assignedRole: "safety_inspector", completed: false },
    { id: "REM-004", title: "Submit Clean Air Act emission telemetry logs", regulation: "EPA Clean Air Act", dueDate: "2026-08-10", assignedRole: "engineer", completed: true }
  ]);

  // Historical Timeline Audits
  const [historicalAudits, setHistoricalAudits] = useState<HistoricalAudit[]>([
    { id: "HA-001", title: "SOP-HPB-702: Steam Boiler Startup Sequence", framework: "Factory Act 1948", score: 82, date: "2026-07-17", auditedBy: "E. Rostova", gapsCount: 4 },
    { id: "HA-002", title: "MAN-SGT-901: SGT-900 Gas Turbine Hot Path", framework: "OISD-STD-189", score: 74, date: "2026-06-18", auditedBy: "M. Vance", gapsCount: 3 },
    { id: "HA-003", title: "DWG-FW-ID-004: Feedwater Preheater P&ID", framework: "PESO Rules", score: 69, date: "2026-05-12", auditedBy: "A. Pendelton", gapsCount: 5 },
    { id: "HA-004", title: "SOP-HPB-702: Steam Boiler Startup Sequence", framework: "ISO 9001:2015", score: 89, date: "2026-04-10", auditedBy: "S. Jenkins", gapsCount: 2 }
  ]);

  // Form states for creating custom reminder
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [newReminderReg, setNewReminderReg] = useState("");
  const [newReminderDate, setNewReminderDate] = useState("");
  const [newReminderRole, setNewReminderRole] = useState<RoleType>("engineer");

  // State for printable Report Modal
  const [showPrintModal, setShowPrintModal] = useState(false);

  // OSHA safety scenario auditor from original component
  const [safetyScenario, setSafetyScenario] = useState<string>("Performing mechanical seal swap on deaerator feedwater pump P-201B while pump A is active. Isolation valves were turned off, but no lock was applied to CB-201, and line pressure is still holding 40 psi.");
  const [scenarioResult, setScenarioResult] = useState<any>({
    complianceStatus: "VIOLATION",
    riskLevel: "CRITICAL",
    findings: [
      "Failure to establish zero energy state (40 psi pressure remains in lines).",
      "Failure to apply a physical Lockout padlock to electrical breaker CB-201.",
      "Servicing pump B while adjacent pump A runs without secondary backflow block checking."
    ],
    applicableRegulations: [
      "OSHA 29 CFR 1910.147(c)(1) - Energy Control Program",
      "OSHA 29 CFR 1910.147(d)(3) - Machine Isolation",
      "OSHA 29 CFR 1910.147(d)(4) - LOTO Device Application"
    ],
    preventativeActions: [
      "Halt mechanical seal swap immediately.",
      "Close feedwater bleed valve and drain the pump cavity completely until gauge PT-202 reads 0 psi.",
      "Apply multi-lock hasps to breaker CB-201 with individual padlocks for all operators involved.",
      "Perform a physical verification cycle before dismantling seal housing."
    ],
    incidentRiskRating: 88
  });
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [scenarioError, setScenarioError] = useState<string | null>(null);

  // State for LOTO checklist from original component
  const [lotoSteps, setLotoSteps] = useState([
    { id: 1, text: "Step 1: Identify all energy sources (Steam pressure, 480V motor, fuel gas valve).", checked: true, verifiedBy: "M. Vance" },
    { id: 2, text: "Step 2: Shut down Boiler burner systems and associated feed line controls.", checked: true, verifiedBy: "M. Vance" },
    { id: 3, text: "Step 3: Close isolating ball valve VLV-101 & FCV-502, switch off breaker CB-201.", checked: true, verifiedBy: "E. Rostova" },
    { id: 4, text: "Step 4: Secure padlock and personal 'DO NOT OPERATE' hazard warning tag.", checked: false, verifiedBy: "" },
    { id: 5, text: "Step 5: Bleed steam line exhaust to atmosphere to establish zero energy.", checked: false, verifiedBy: "" },
    { id: 6, text: "Step 6: Attempt local restart to verify zero isolation state.", checked: false, verifiedBy: "" }
  ]);

  // Handle LOTO checklist click
  const handleToggleLoto = (id: number) => {
    setLotoSteps(prev => prev.map(s => {
      if (s.id === id) {
        const nextState = !s.checked;
        return {
          ...s,
          checked: nextState,
          verifiedBy: nextState ? (activeRole === "safety_inspector" ? "E. Rostova" : "M. Vance") : ""
        };
      }
      return s;
    }));
  };

  // Run Safety Scenario Audit
  const handleRunSafetyAudit = async () => {
    if (!safetyScenario.trim()) return;
    setScenarioLoading(true);
    setScenarioError(null);

    try {
      const response = await fetch("/api/compliance/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioDescription: safetyScenario,
          regulationsChecked: ["OSHA 1910.147 (LOTO)", "OSHA 1910.146 (Confined Space)", "OSHA 1910.303 (Electrical)"]
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to audit safety scenario.");
      }
      setScenarioResult(data.data);
    } catch (err: any) {
      console.error(err);
      setScenarioError(err.message || "Failed safety gateway connection.");
    } finally {
      setScenarioLoading(false);
    }
  };

  // Run AI Regulatory Document Compliance Audit
  const handleRunDocumentAudit = async () => {
    setAuditLoading(true);
    setAuditError(null);
    setSelectedMatrixGap(null);

    // Simulated multi-stage progress loading for incredible field-engineer realism!
    const steps = [
      "Injesting Selected Industrial Documents...",
      "OCR parsing and section breakdown...",
      "Matching against regulatory clauses...",
      "Detecting safety gaps, missing certifications & expired seals...",
      "Drafting localized risk scores and mitigation priorities...",
      "Assembling evidentiary compliance logs & printing reports..."
    ];

    let stepIdx = 0;
    setAuditProgressStep(steps[0]);
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setAuditProgressStep(steps[stepIdx]);
      }
    }, 900);

    try {
      let docContent = "";
      let docTitle = "";

      if (selectedDocId === "custom") {
        docContent = customDocContent || "No custom content entered.";
        docTitle = customDocTitle || "Custom Operator Handoff File";
      } else {
        const matchedDoc = documents.find(d => d.id === selectedDocId);
        if (matchedDoc) {
          docContent = matchedDoc.content;
          docTitle = matchedDoc.title;
        } else {
          // Fallback to initial local mockup list
          if (selectedDocId === "SOP-HPB-702") {
            docTitle = "SOP-HPB-702: Boiler Startup Sequence";
            docContent = "STANDARD OPERATING PROCEDURE: HPB-201 HIGH-PRESSURE STEAM BOILER STARTUP...";
          } else if (selectedDocId === "MAN-SGT-901") {
            docTitle = "MAN-SGT-901: Gas Turbine Hot Gas Path";
            docContent = "SGT-900 INDUSTRIAL GAS TURBINE TECHNICAL MANUAL...";
          } else if (selectedDocId === "DWG-FW-ID-004") {
            docTitle = "DWG-FW-ID-004: Feedwater Deaerator drawing";
            docContent = "PIPING AND INSTRUMENTATION DIAGRAM EXPLANATION: DWG-FW-ID-004...";
          } else if (selectedDocId === "INC-2026-042") {
            docTitle = "INC-2026-042: Feedwater Pump Cavitation Incident Report";
            docContent = "INCIDENT INVESTIGATION AND FAILURE REPORT: P-201B...";
          }
        }
      }

      const response = await fetch("/api/compliance/document-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: selectedDocId,
          documentTitle: docTitle,
          documentContent: docContent,
          framework: selectedFramework
        })
      });

      const resData = await response.json();
      clearInterval(interval);

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || "Failed to complete AI regulatory document audit.");
      }

      // Format response gap list with grid coordinate assignments for Risk Matrix plotting
      const rawData = resData.data;
      const formattedGaps = rawData.gaps.map((gap: any, idx: number) => {
        let l = 2; // Default Likelihood (1-5)
        let s = 2; // Default Severity (1-5)

        if (gap.severity === "CRITICAL") { s = 5; l = 3; }
        else if (gap.severity === "HIGH") { s = 4; l = 3 + (idx % 2); }
        else if (gap.severity === "MEDIUM") { s = 3; l = 2 + (idx % 2); }
        else { s = 2; l = 1 + (idx % 3); }

        return {
          ...gap,
          likelihoodRating: l,
          severityRating: s
        };
      });

      // Format remedial actions to include internal tracker attributes
      const formattedActions = rawData.remedialActionPlan.map((action: any, idx: number) => ({
        id: `ACT-${idx + 101}`,
        ...action,
        status: "PENDING"
      }));

      setAuditReport({
        ...rawData,
        gaps: formattedGaps,
        remedialActionPlan: formattedActions,
        source: resData.source || "GEMINI_COGNITIVE_AUDITOR"
      });

      // Automatically add to historical log state
      const newAuditLog: HistoricalAudit = {
        id: `HA-${historicalAudits.length + 101}`,
        title: docTitle.split(":")[0] || docTitle,
        framework: selectedFramework.split(" ")[0],
        score: rawData.complianceScore,
        date: new Date().toISOString().split("T")[0],
        auditedBy: activeRole === "safety_inspector" ? "E. Rostova" : "M. Vance",
        gapsCount: formattedGaps.length
      };
      setHistoricalAudits(prev => [newAuditLog, ...prev]);

    } catch (err: any) {
      console.error(err);
      clearInterval(interval);
      setAuditError(err.message || "Could not connect to regulatory intelligence core.");
    } finally {
      setAuditLoading(false);
    }
  };

  // Add Reminder custom logic
  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle.trim()) return;

    const newRem: ComplianceReminder = {
      id: `REM-${Date.now()}`,
      title: newReminderTitle,
      regulation: newReminderReg || "General Policy Check",
      dueDate: newReminderDate || new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split("T")[0],
      assignedRole: newReminderRole,
      completed: false
    };

    setReminders(prev => [newRem, ...prev]);
    setNewReminderTitle("");
    setNewReminderReg("");
    setNewReminderDate("");
  };

  // Schedule Reminder from Remedial Action Plan
  const handleScheduleActionReminder = (action: RemedialAction) => {
    const roleMapping: Record<string, string> = {
      "plant manager": "plant_manager",
      "safety inspector": "safety_inspector",
      "engineer": "engineer",
      "operator": "operator"
    };
    
    const mappedRole = roleMapping[action.assignedTo.toLowerCase()] || "engineer";

    const newRem: ComplianceReminder = {
      id: `REM-${Date.now()}`,
      title: `Remedial Fix: ${action.action}`,
      regulation: selectedFramework.split(" ")[0],
      dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split("T")[0], // default 7 days
      assignedRole: mappedRole,
      completed: false
    };

    setReminders(prev => [newRem, ...prev]);
    
    // Set Action to ASSIGNED state
    if (auditReport) {
      setAuditReport({
        ...auditReport,
        remedialActionPlan: auditReport.remedialActionPlan.map(act => 
          act.id === action.id ? { ...act, status: "ASSIGNED" } : act
        )
      });
    }

    alert(`Compliance reminder created & assigned to ${action.assignedTo}! Notification successfully dispatched.`);
  };

  // Mark Reminder Completed
  const handleToggleReminder = (id: string) => {
    setReminders(prev => prev.map(rem => 
      rem.id === id ? { ...rem, completed: !rem.completed } : rem
    ));
  };

  // Delete a reminder
  const handleDeleteReminder = (id: string) => {
    setReminders(prev => prev.filter(rem => rem.id !== id));
  };

  // Average Overall Plant Score calculation
  const overallPlantScore = Math.round(
    historicalAudits.reduce((acc, curr) => acc + curr.score, 0) / historicalAudits.length
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-elegant-dark font-sans text-slate-200">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider">
              Module 04: Industrial Compliance
            </span>
          </div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2 mt-1">
            <ShieldCheck className="w-6 h-6 text-emerald-500 glow-emerald-svg" />
            <span>Industrial Compliance & HSE Regulatory Expert</span>
          </h2>
          <p className="text-slate-500 text-xs">
            Audit standard operating procedures against Indian Factory Act, OISD standards, PESO licensing, ISO 9001 quality guidelines, and Clean Air EPA rules.
          </p>
        </div>

        {/* SUITE PICKER */}
        <div className="flex bg-[#0F1219] border border-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveSuite("auditor")}
            className={`px-4 py-2 text-xs font-semibold rounded flex items-center gap-2 transition-all cursor-pointer ${
              activeSuite === "auditor" 
                ? "bg-blue-600 text-white shadow-sm" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>AI Regulatory Auditor Suite</span>
          </button>
          <button
            onClick={() => setActiveSuite("loto")}
            className={`px-4 py-2 text-xs font-semibold rounded flex items-center gap-2 transition-all cursor-pointer ${
              activeSuite === "loto" 
                ? "bg-blue-600 text-white shadow-sm" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>OSHA Floor & LOTO Isolation</span>
          </button>
        </div>
      </div>

      {activeSuite === "auditor" ? (
        <>
          {/* HIGH-LEVEL PLANT SCORE DASHBOARD */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Circular score gauge */}
            <div className="bg-elegant-card border border-slate-800 rounded p-4 flex items-center gap-4">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500 drop-shadow-[0_0_4px_rgba(16,185,129,0.3)]"
                    strokeWidth="3.5"
                    strokeDasharray={`${overallPlantScore}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center font-mono text-center">
                  <span className="text-base font-bold text-white leading-none">{overallPlantScore}%</span>
                  <span className="text-[7px] text-slate-500 uppercase leading-none font-bold">Aggregate</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block">Plant Compliance Level</span>
                <h4 className="text-sm font-semibold text-slate-200 mt-0.5">High Compliance State</h4>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono mt-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>+2.4% vs Previous Month</span>
                </p>
              </div>
            </div>

            {/* Total Audits Run */}
            <div className="bg-elegant-card border border-slate-800 rounded p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Historical Audit Logs</span>
                <Layers className="w-4 h-4 text-blue-400" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-mono font-bold text-white">{historicalAudits.length}</div>
                <p className="text-[10px] text-slate-400 mt-0.5">Continuous regulatory cross-checks validated</p>
              </div>
            </div>

            {/* Active gaps */}
            <div className="bg-elegant-card border border-slate-800 rounded p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Unresolved Gaps Detected</span>
                <AlertTriangle className="w-4 h-4 text-orange-400" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-mono font-bold text-orange-400">
                  {auditReport ? auditReport.gaps.length : 0}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Across standard pressure safety & LOTO guidelines
                </p>
              </div>
            </div>

            {/* Critical Expired items */}
            <div className="bg-elegant-card border border-slate-800 rounded p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Expired Certifications</span>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-mono font-bold text-rose-500">
                  {reminders.filter(r => !r.completed && r.dueDate < "2026-07-20").length + (auditReport ? auditReport.expiredCertifications.length : 0)}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">High-priority regulatory stop-work risks</p>
              </div>
            </div>

          </div>

          {/* MAIN TWO COLUMN AUDITOR SETUP PANEL */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* CONFIGURATION COLUMN */}
            <div className="lg:col-span-1 bg-elegant-card border border-slate-800 p-5 rounded h-fit space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-slate-500 font-bold border-b border-slate-800 pb-3">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span>Configure AI Document Audit</span>
              </div>

              {/* Document selection */}
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5 font-bold">
                  1. Select Plant Document for Audit
                </label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  disabled={auditLoading}
                  className="w-full bg-[#0F1219] border border-slate-800 text-slate-200 text-xs rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                >
                  <option value="SOP-HPB-702">SOP-HPB-702: High-Pressure Boiler Sequence (SOP)</option>
                  <option value="MAN-SGT-901">MAN-SGT-901: Gas Turbine Maintenance Manual (Manual)</option>
                  <option value="DWG-FW-ID-004">DWG-FW-ID-004: Feedwater Preheater P&ID (Drawing)</option>
                  <option value="INC-2026-042">INC-2026-042: Feedwater Pump Cavitation Incident (Report)</option>
                  
                  {documents.filter(d => !["SOP-HPB-702", "MAN-SGT-901", "DWG-FW-ID-004", "INC-2026-042"].includes(d.id)).map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.title} ({doc.category})</option>
                  ))}
                  
                  <option value="custom">-- Paste Custom Raw Text / Handoff Record --</option>
                </select>
              </div>

              {/* Custom Document inputs if 'custom' is selected */}
              {selectedDocId === "custom" && (
                <div className="space-y-3 p-3 bg-[#0F1219] border border-slate-800 rounded animate-fadeIn">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1 font-bold">
                      Custom Document Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Valve lineup shift draft 4"
                      value={customDocTitle}
                      onChange={(e) => setCustomDocTitle(e.target.value)}
                      className="w-full bg-[#030712] border border-slate-800 text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1 font-bold">
                      Custom Document / SOP Content
                    </label>
                    <textarea
                      placeholder="Type or paste procedural lines..."
                      value={customDocContent}
                      onChange={(e) => setCustomDocContent(e.target.value)}
                      rows={6}
                      className="w-full bg-[#030712] border border-slate-800 text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Regulatory Framework */}
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5 font-bold">
                  2. Select Regulatory Framework Target
                </label>
                <select
                  value={selectedFramework}
                  onChange={(e) => setSelectedFramework(e.target.value)}
                  disabled={auditLoading}
                  className="w-full bg-[#0F1219] border border-slate-800 text-slate-200 text-xs rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                >
                  <option value="Factory Act 1948 (Safety Standards)">Factory Act 1948 (Safety Standards)</option>
                  <option value="OISD-STD-189 (Oil and Gas Fire Safety)">OISD-STD-189 (Oil & Gas Protection)</option>
                  <option value="PESO Gas Cylinder & Pressure Vessel rules">PESO Cylinder & Static Vessel rules</option>
                  <option value="ISO 9001:2015 (Operational Quality Standard)">ISO 9001:2015 (Operational Quality)</option>
                  <option value="EPA (Environmental Clean Air & Water Act)">EPA (Environmental Clean Air & Water Act)</option>
                  <option value="Internal Company Safety Policy (EHS)">Internal Company Safety Policy (EHS)</option>
                </select>
              </div>

              {auditError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded font-mono leading-relaxed">
                  {auditError}. Serving local offline compliance database instead.
                </div>
              )}

              {/* AUDIT TRIGGER BUTTON */}
              <button
                onClick={handleRunDocumentAudit}
                disabled={auditLoading || (selectedDocId === "custom" && !customDocContent.trim())}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer glow-blue"
              >
                {auditLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Processing Regulatory Audit...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run AI Regulatory Audit</span>
                  </>
                )}
              </button>

              {auditLoading && (
                <div className="bg-[#0F1219] border border-slate-800 p-2.5 rounded text-center">
                  <div className="text-[9px] font-mono text-slate-500 uppercase leading-none mb-1 animate-pulse">Cognitive Progress State</div>
                  <div className="text-[10px] text-slate-300 font-medium font-mono truncate">{auditProgressStep}</div>
                </div>
              )}
            </div>

            {/* VISUAL REPORT MAIN HUB */}
            <div className="lg:col-span-2 bg-elegant-card border border-slate-800 p-5 rounded flex flex-col justify-between">
              {auditReport ? (
                <div className="space-y-5">
                  
                  {/* Executive Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          auditReport.complianceScore >= 85 ? "bg-emerald-950/55 text-emerald-400 border border-emerald-500/20" :
                          auditReport.complianceScore >= 70 ? "bg-yellow-950/55 text-yellow-400 border border-yellow-500/20" :
                          "bg-rose-950/55 text-rose-400 border border-rose-500/20"
                        }`}>
                          SCORE: {auditReport.complianceScore}%
                        </span>
                        <span className="text-slate-500 font-mono text-[10px]">
                          Audited via {auditReport.source === "GEMINI_COGNITIVE_AUDITOR" ? "Gemini HSE model" : "Local Reference Database"}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-white mt-1">
                        Audit Report: {selectedDocId === "custom" ? (customDocTitle || "Custom Data") : (documents.find(d => d.id === selectedDocId)?.title || `SOP ${selectedDocId}`)}
                      </h3>
                    </div>

                    <div className="flex gap-2">
                      {/* Print & PDF Button */}
                      <button
                        onClick={() => setShowPrintModal(true)}
                        className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-blue-400" />
                        <span>Export PDF / Report</span>
                      </button>
                    </div>
                  </div>

                  {/* EXPLAINABLE BRIEF */}
                  <div className="p-3 bg-[#0F1219] border border-slate-800 rounded">
                    <span className="text-[9px] uppercase font-mono text-blue-400 block mb-1 font-bold">Executive Summary & Compliance Verdict</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono">
                      {auditReport.summary}
                    </p>
                  </div>

                  {/* SUB-TABS SELECTOR FOR FINDINGS */}
                  <div className="flex border-b border-slate-800">
                    <button
                      onClick={() => { setActiveResultTab("gaps"); setSelectedMatrixGap(null); }}
                      className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                        activeResultTab === "gaps" 
                          ? "border-blue-500 text-blue-400" 
                          : "border-transparent text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Detected Gaps ({auditReport.gaps.length})
                    </button>
                    <button
                      onClick={() => setActiveResultTab("actions")}
                      className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                        activeResultTab === "actions" 
                          ? "border-blue-500 text-blue-400" 
                          : "border-transparent text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Action Plan ({auditReport.remedialActionPlan.length})
                    </button>
                    <button
                      onClick={() => setActiveResultTab("evidence")}
                      className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                        activeResultTab === "evidence" 
                          ? "border-blue-500 text-blue-400" 
                          : "border-transparent text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Evidence Pack ({auditReport.evidencePackage.length})
                    </button>
                    <button
                      onClick={() => setActiveResultTab("certs")}
                      className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                        activeResultTab === "certs" 
                          ? "border-blue-500 text-blue-400" 
                          : "border-transparent text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Certifications ({auditReport.expiredCertifications.length})
                    </button>
                  </div>

                  {/* TAB CONTENT: GAPS & LEGAL EXPOSURE */}
                  {activeResultTab === "gaps" && (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {auditReport.gaps.map((gap, i) => (
                        <div 
                          key={i} 
                          onClick={() => setSelectedMatrixGap(gap)}
                          className={`p-3 border rounded transition-all cursor-pointer ${
                            selectedMatrixGap?.clause === gap.clause 
                              ? "bg-blue-600/5 border-blue-500" 
                              : "bg-[#0F1219] border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${
                                gap.severity === "CRITICAL" ? "bg-rose-950/60 text-rose-400 border border-rose-500/30" :
                                gap.severity === "HIGH" ? "bg-orange-950/60 text-orange-400 border border-orange-500/30" :
                                "bg-yellow-950/60 text-yellow-400 border border-yellow-500/30"
                              }`}>
                                {gap.severity}
                              </span>
                              <h4 className="text-xs font-semibold text-slate-200 font-display">{gap.clause}</h4>
                            </div>
                            <span className="text-[9px] font-mono text-slate-500">{gap.regulationReference}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                            {gap.description}
                          </p>
                          {gap.likelihoodRating && gap.severityRating && (
                            <div className="mt-2 flex items-center justify-between text-[9px] font-mono text-slate-500 border-t border-slate-900 pt-1.5">
                              <span>Matrix Position: L{gap.likelihoodRating} x S{gap.severityRating}</span>
                              <span className="text-blue-400 underline">Locate on Risk Grid &rarr;</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB CONTENT: REMEDIAL CORRECTIVE ACTIONS */}
                  {activeResultTab === "actions" && (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {auditReport.remedialActionPlan.map((action, i) => (
                        <div key={i} className="p-3 bg-[#0F1219] border border-slate-800 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="space-y-1 max-w-md">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${
                                action.priority === "HIGH" ? "bg-rose-950/50 text-rose-400" : "bg-yellow-950/50 text-yellow-400"
                              }`}>
                                {action.priority} Priority
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">Timeline: {action.timeframe}</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-normal">{action.action}</p>
                            <div className="text-[9px] font-mono text-slate-500">
                              Owner: <span className="text-slate-300">{action.assignedTo}</span>
                            </div>
                          </div>

                          <div className="w-full sm:w-auto flex-shrink-0">
                            {action.status === "PENDING" ? (
                              <button
                                onClick={() => handleScheduleActionReminder(action)}
                                className="w-full sm:w-auto px-2.5 py-1 bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 hover:border-transparent text-blue-400 hover:text-white rounded text-[10px] font-mono font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Bell className="w-3 h-3" />
                                <span>Assign & Alert</span>
                              </button>
                            ) : (
                              <div className="px-2.5 py-1 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 rounded text-[10px] font-mono font-semibold flex items-center justify-center gap-1">
                                <CheckCheckIcon className="w-3 h-3" />
                                <span>Dispatched</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB CONTENT: COMPLIANT EVIDENCE PACKAGE */}
                  {activeResultTab === "evidence" && (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {auditReport.evidencePackage.map((ev, i) => (
                        <div key={i} className="p-3 bg-[#0F1219] border border-slate-800 rounded space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono font-bold text-slate-400">{ev.clause}</span>
                            <span className="px-1.5 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 rounded text-[8px] font-mono font-bold">
                              {ev.evidenceRating}
                            </span>
                          </div>
                          <blockquote className="text-xs text-slate-400 border-l-2 border-emerald-500/30 pl-2.5 py-1 leading-relaxed italic font-mono bg-slate-950/30">
                            "{ev.textQuote}"
                          </blockquote>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB CONTENT: CERTIFICATIONS AND TESTING STATUS */}
                  {activeResultTab === "certs" && (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {auditReport.expiredCertifications.map((cert, i) => (
                        <div key={i} className="p-3 bg-rose-950/10 border border-rose-500/15 rounded">
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-semibold text-rose-400">{cert.item}</h4>
                            <span className="text-[9px] font-mono bg-rose-900/30 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded">
                              {cert.status}
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-400 mt-2">
                            Expiry Date: <span className="text-slate-300">{cert.expiryDate}</span>
                          </p>
                          <div className="mt-1.5 text-[10px] text-slate-300 leading-normal flex items-start gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                            <span>{cert.risk}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
                  <ShieldCheck className="w-12 h-12 text-slate-700 mb-3" />
                  <p className="text-xs text-center max-w-sm">No document audit loaded. Please select a document on the left and run the AI Regulatory Audit.</p>
                </div>
              )}

              <div className="text-[9px] font-mono text-slate-500 mt-4 pt-2 border-t border-slate-800 flex justify-between uppercase">
                <span>Auditor Standard: Factories Act & HSE Rules</span>
                <span>Audit Console: Stable</span>
              </div>
            </div>

          </div>

          {/* DUAL SECTION: INTERACTIVE RISK MATRIX & DYNAMIC REMINDER WORKSPACE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 5X5 INTERACTIVE RISK MATRIX */}
            <div className="lg:col-span-1 bg-elegant-card border border-slate-800 p-5 rounded flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block mb-1">Interactive Risk Assessment Matrix</span>
                <h4 className="text-sm font-semibold text-slate-200 mb-3">Gap Severities vs Likelihood Mapping</h4>
                
                {/* 5x5 Grid implementation */}
                <div className="relative border-l border-b border-slate-800 pb-2 pl-2">
                  <div className="grid grid-cols-5 gap-1 aspect-square w-full">
                    {[5, 4, 3, 2, 1].map((likelihood) => {
                      return [1, 2, 3, 4, 5].map((severity) => {
                        // Calculate Risk Level for cell color
                        const score = likelihood * severity;
                        let cellBg = "bg-slate-900/10 hover:bg-slate-900/30";
                        if (score >= 15) cellBg = "bg-rose-950/20 hover:bg-rose-950/40 border border-rose-950/20";
                        else if (score >= 8) cellBg = "bg-orange-950/20 hover:bg-orange-950/40 border border-orange-950/20";
                        else if (score >= 4) cellBg = "bg-yellow-950/10 hover:bg-yellow-950/25 border border-yellow-950/10";
                        else cellBg = "bg-emerald-950/10 hover:bg-emerald-950/25 border border-emerald-950/10";

                        // Check if any gap maps to this coordinate
                        const mappedGaps = auditReport?.gaps.filter(
                          gap => gap.likelihoodRating === likelihood && gap.severityRating === severity
                        ) || [];

                        return (
                          <div 
                            key={`${likelihood}-${severity}`} 
                            className={`relative rounded flex items-center justify-center transition-all ${cellBg}`}
                          >
                            {mappedGaps.length > 0 && (
                              <button 
                                onClick={() => {
                                  setSelectedMatrixGap(mappedGaps[0]);
                                  setActiveResultTab("gaps");
                                }}
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-md cursor-pointer animate-pulse ${
                                  mappedGaps[0].severity === "CRITICAL" ? "bg-rose-500 glow-red" :
                                  mappedGaps[0].severity === "HIGH" ? "bg-orange-500 glow-orange" :
                                  "bg-yellow-500 glow-yellow"
                                }`}
                                title={`${mappedGaps[0].clause} (${mappedGaps[0].severity})`}
                              >
                                !
                              </button>
                            )}
                          </div>
                        );
                      });
                    })}
                  </div>

                  {/* Y Axis labels */}
                  <div className="absolute top-0 -left-6 bottom-0 flex flex-col justify-between text-[8px] font-mono text-slate-500 py-2.5">
                    <span>L5</span>
                    <span>L4</span>
                    <span>L3</span>
                    <span>L2</span>
                    <span>L1</span>
                  </div>
                </div>

                {/* X Axis labels */}
                <div className="flex justify-between text-[8px] font-mono text-slate-500 pl-4 mt-1.5">
                  <span>S1 (Negligible)</span>
                  <span>S2</span>
                  <span>S3</span>
                  <span>S4</span>
                  <span>S5 (Critical)</span>
                </div>
              </div>

              {/* Mapped gap focus display */}
              <div className="mt-4 p-3 bg-[#0F1219] border border-slate-800 rounded min-h-[75px] flex flex-col justify-center">
                {selectedMatrixGap ? (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">Selected Matrix Item</span>
                    </div>
                    <h5 className="text-[11px] font-bold text-slate-200 line-clamp-1">{selectedMatrixGap.clause}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{selectedMatrixGap.description}</p>
                  </div>
                ) : (
                  <div className="text-center py-2 text-[10px] text-slate-500 italic">
                    Click an alert pin (!) on the risk matrix to isolate safety gap details.
                  </div>
                )}
              </div>
            </div>

            {/* DYNAMIC REGULATORY REMINDER MANAGER */}
            <div className="lg:col-span-2 bg-elegant-card border border-slate-800 p-5 rounded space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block">Compliance Reminders & Deadlines</span>
                  <h4 className="text-sm font-semibold text-slate-200">Regulatory Task Registry</h4>
                </div>
                <span className="text-[9px] font-mono bg-slate-900 px-2 py-0.5 rounded text-blue-400">
                  Pending Tasks: {reminders.filter(r => !r.completed).length}
                </span>
              </div>

              {/* Reminder Form */}
              <form onSubmit={handleAddReminder} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 bg-[#0F1219] p-3 border border-slate-800 rounded">
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    required
                    placeholder="Task title (e.g. Vessel re-test)"
                    value={newReminderTitle}
                    onChange={(e) => setNewReminderTitle(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    placeholder="Regulation/Std"
                    value={newReminderReg}
                    onChange={(e) => setNewReminderReg(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="date"
                    value={newReminderDate}
                    onChange={(e) => setNewReminderDate(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 text-slate-400 text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </form>

              {/* Reminders List */}
              <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                {reminders.map((rem) => {
                  const isOverdue = !rem.completed && rem.dueDate < "2026-07-20";
                  return (
                    <div 
                      key={rem.id} 
                      className={`p-2.5 border rounded flex items-center justify-between gap-3 text-xs ${
                        rem.completed 
                          ? "bg-slate-900/40 border-slate-900/60 opacity-60" 
                          : isOverdue 
                          ? "bg-rose-950/10 border-rose-500/20" 
                          : "bg-[#0F1219] border-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <button 
                          type="button"
                          onClick={() => handleToggleReminder(rem.id)}
                          className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                        >
                          {rem.completed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>

                        <div className="space-y-0.5">
                          <p className={`font-medium ${rem.completed ? "line-through text-slate-500" : "text-slate-200"}`}>
                            {rem.title}
                          </p>
                          <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500">
                            <span>Std: {rem.regulation}</span>
                            <span>&bull;</span>
                            <span className="uppercase">Assigned: {rem.assignedRole.replace("_", " ")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          rem.completed ? "bg-slate-800 text-slate-500" :
                          isOverdue ? "bg-rose-950 text-rose-400 border border-rose-500/30 font-bold" :
                          "bg-slate-900 text-slate-400"
                        }`}>
                          {rem.completed ? "COMPLETED" : isOverdue ? "OVERDUE" : rem.dueDate}
                        </span>
                        
                        <button 
                          type="button"
                          onClick={() => handleDeleteReminder(rem.id)}
                          className="text-slate-600 hover:text-rose-400 text-[10px] cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* HISTORICAL TIMELINE */}
          <div className="bg-elegant-card border border-slate-800 p-5 rounded">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-400 glow-blue-svg" />
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Historical Compliance Audit Timeline</h3>
                <p className="text-[10px] text-slate-500">Track and filter past safety audit sequences and compliance scores over time</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {historicalAudits.map((item, idx) => (
                <div key={item.id} className="p-3 bg-[#0F1219] border border-slate-800 rounded relative">
                  <div className="absolute top-3 right-3 text-[14px] font-bold font-mono text-slate-500">
                    #{historicalAudits.length - idx}
                  </div>
                  <div className="text-[9px] font-mono uppercase text-blue-400">{item.framework}</div>
                  <h4 className="text-xs font-semibold text-white mt-1 line-clamp-1">{item.title}</h4>
                  
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-900">
                    <div>
                      <div className="text-[10px] font-mono text-slate-500">Compliance score</div>
                      <div className="text-base font-mono font-bold text-slate-200 mt-0.5">{item.score}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-mono text-slate-500">{item.date}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5 flex items-center justify-end gap-1 font-mono">
                        <User className="w-3 h-3 text-slate-500" />
                        <span>{item.auditedBy}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* OSHA SCENARIO AUDITOR & LOTO Isolation checklist */
        <div className="space-y-6 animate-fadeIn">
          
          {/* Title */}
          <div>
            <h3 className="text-lg font-bold text-white font-display">LOTO Energy Isolation Board & Floor Activity Auditor</h3>
            <p className="text-slate-500 text-xs">Analyze instant floor maintenance scenarios for hazards, safety steps, and physical lockouts.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Safety Scenario Auditor Input panel */}
            <div className="lg:col-span-1 bg-elegant-card border border-slate-800 p-5 rounded h-fit">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-slate-500 mb-4 font-bold">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span>AI Floor Safety Auditor</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1.5 font-bold">
                    Describe Floor Activity or Incident
                  </label>
                  <textarea
                    value={safetyScenario}
                    onChange={(e) => setSafetyScenario(e.target.value)}
                    disabled={scenarioLoading}
                    placeholder="Detail who is doing what, what components are pressurized, and what lockout steps were completed..."
                    rows={8}
                    className="w-full bg-[#0F1219] border border-slate-800 text-slate-200 rounded px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono leading-relaxed"
                  ></textarea>
                </div>

                {scenarioError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded">
                    {scenarioError}. Showing cached safety standard guidelines.
                  </div>
                )}

                <button
                  onClick={handleRunSafetyAudit}
                  disabled={scenarioLoading || !safetyScenario.trim()}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:opacity-50 cursor-pointer glow-blue"
                >
                  {scenarioLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Running OSHA Audit Checklist...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Execute OSHA Safety Audit</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* EHS Safety Audit Findings Display */}
            <div className="lg:col-span-2 bg-elegant-card border border-slate-800 p-5 rounded flex flex-col justify-between">
              {scenarioResult ? (
                <div className="space-y-4">
                  
                  {/* Compliance Status and Risk Badge Header */}
                  <div className="flex justify-between items-start pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          scenarioResult.complianceStatus === "VIOLATION" ? "bg-rose-950/55 text-rose-400 border border-rose-500/20" :
                          scenarioResult.complianceStatus === "WARNING" ? "bg-yellow-950/55 text-yellow-400 border border-yellow-500/20" :
                          "bg-emerald-950/55 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {scenarioResult.complianceStatus}
                        </span>
                        <span className="text-slate-500 font-mono text-[10px]">OSHA Audit Outcome</span>
                      </div>
                      <h3 className="text-xs font-semibold text-slate-400 mt-1 leading-none">
                        Risk Level: <span className="font-bold text-slate-200">{scenarioResult.riskLevel}</span>
                      </h3>
                    </div>

                    {/* Risk Gauge metric */}
                    <div className="text-center bg-[#0F1219] border border-slate-800 px-3 py-1.5 rounded">
                      <div className="text-[8px] uppercase font-mono text-slate-500 leading-none">AI Risk Weight</div>
                      <div className="text-sm font-bold font-mono text-slate-300 mt-1 leading-none">
                        {scenarioResult.incidentRiskRating}/100
                      </div>
                    </div>
                  </div>

                  {/* Specific Gaps / Findings */}
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1.5 font-bold tracking-wider">
                      Audit Findings & Procedural Gaps
                    </span>
                    <ul className="space-y-1.5">
                      {scenarioResult.findings.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span className="leading-tight">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Applicable regulations breached */}
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1.5 font-bold tracking-wider">
                      Applicable OSHA / Regulatory Clauses Breached
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {scenarioResult.applicableRegulations.map((reg: string, idx: number) => (
                        <span key={idx} className="bg-[#0F1219] border border-slate-800 text-[10px] font-mono font-medium text-slate-400 px-2 py-1 rounded">
                          {reg}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Preventative / Remedial Actions */}
                  <div className="pt-3 border-t border-slate-800">
                    <span className="text-[10px] uppercase font-mono text-blue-400 block mb-2 font-bold tracking-wider">
                      Mandatory Immediate Remediation Steps
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {scenarioResult.preventativeActions.map((act: string, i: number) => (
                        <div key={i} className="p-2.5 border border-slate-800 bg-[#0F1219] text-xs text-slate-300 leading-normal rounded flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <ShieldCheck className="w-12 h-12 text-slate-700 mb-3" />
                  <p className="text-xs text-center max-w-sm">No safety audit active. Write down floor activity details and click "Execute OSHA Safety Audit" on the left.</p>
                </div>
              )}

              <div className="text-[9px] font-mono text-slate-500 mt-4 pt-2 border-t border-slate-800 flex justify-between uppercase">
                <span>Audit Standard: US Federal OSHA Title 29</span>
                <span>Safety Station: Online</span>
              </div>
            </div>

          </div>

          {/* LOTO CHECKLIST WORKSPACE SECTION */}
          <div className="bg-elegant-card border border-slate-800 p-5 rounded">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-400 glow-blue-svg" />
                <h3 className="text-sm font-semibold text-slate-200">
                  LOTO-201: Station Isolation & Lockout Lockbox Panel
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-[#0F1219] border border-slate-800 px-2 py-1 rounded text-slate-500">
                COMPLIANT ISOLATION REQUIREMENT: 100%
              </span>
            </div>

            {/* LOTO Grid list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lotoSteps.map((step) => {
                const isFinished = step.checked;
                return (
                  <div 
                    key={step.id}
                    onClick={() => handleToggleLoto(step.id)}
                    className={`p-3.5 rounded border cursor-pointer transition-all duration-300 flex items-start gap-3 select-none ${
                      isFinished 
                        ? "bg-emerald-500/5 border-emerald-500/20 text-slate-200" 
                        : "bg-[#0F1219] border-slate-800 hover:border-blue-500/40 text-slate-400"
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isFinished ? (
                        <div className="p-1 rounded bg-emerald-500 text-white shadow-sm glow-green">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-600">
                          <Unlock className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold leading-normal">
                        {step.text}
                      </p>
                      
                      {isFinished ? (
                        <div className="mt-2 text-[9px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>SECURED BY: {step.verifiedBy}</span>
                        </div>
                      ) : (
                        <span className="mt-2 text-[9px] font-mono text-slate-500 block italic">Requires Operator Signature</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* PRINT PREVIEW / EXPORT MODAL */}
      {showPrintModal && auditReport && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-lg max-w-4xl w-full p-8 space-y-6 relative border shadow-2xl my-8">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowPrintModal(false)}
              className="absolute top-4 right-4 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs rounded transition-colors border cursor-pointer"
            >
              Close Preview
            </button>

            {/* Print trigger button */}
            <button 
              onClick={() => window.print()}
              className="absolute top-4 right-32 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs rounded transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            {/* Printable Area content */}
            <div id="compliance-printable-report" className="space-y-6 text-slate-950 font-sans print:p-0">
              
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">INDUS AI - COMPLIANCE VERIFICATION REPORT</h1>
                  <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mt-0.5">
                    HSE AUDIT PROTOCOL: {selectedFramework}
                  </p>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs text-slate-500">REPORT GENERATED</div>
                  <div className="text-sm font-bold">{new Date().toISOString().split("T")[0]}</div>
                </div>
              </div>

              {/* Score summary banner */}
              <div className="bg-slate-50 p-4 border rounded flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Overall Document Evaluation</h3>
                  <p className="text-sm text-slate-800 font-semibold mt-1">
                    {selectedDocId === "custom" ? "Custom Procedural File" : (documents.find(d => d.id === selectedDocId)?.title || `SOP ${selectedDocId}`)}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase leading-none">Compliance Score</div>
                  <div className="text-3xl font-mono font-bold text-blue-600 mt-1">{auditReport.complianceScore}%</div>
                </div>
              </div>

              {/* Summary explanation */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1">Executive Compliance Summary</h4>
                <p className="text-xs text-slate-700 leading-relaxed italic font-serif">
                  "{auditReport.summary}"
                </p>
              </div>

              {/* Detected Gaps Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1">
                  Identified Safety Gaps & Regulatory Deviations
                </h4>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-50">
                      <th className="py-2 px-1 font-bold">Clause / Standard</th>
                      <th className="py-2 px-1 font-bold">Severity</th>
                      <th className="py-2 px-1 font-bold">Description</th>
                      <th className="py-2 px-1 font-bold">Reference Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditReport.gaps.map((gap, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="py-2 px-1 font-semibold">{gap.clause}</td>
                        <td className="py-2 px-1">
                          <span className={`px-1 rounded text-[10px] font-bold font-mono ${
                            gap.severity === "CRITICAL" ? "text-rose-600 font-bold" :
                            gap.severity === "HIGH" ? "text-orange-600 font-bold" :
                            "text-yellow-600"
                          }`}>
                            {gap.severity}
                          </span>
                        </td>
                        <td className="py-2 px-1 text-slate-600">{gap.description}</td>
                        <td className="py-2 px-1 font-mono text-[10px]">{gap.regulationReference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Remedial Action Plan */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1">
                  Mandatory Immediate Corrective Action Plan
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {auditReport.remedialActionPlan.map((act, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded border text-xs">
                      <div className="font-bold flex justify-between items-center">
                        <span>Task #{idx+1}</span>
                        <span className="text-[10px] uppercase font-mono text-slate-500">Priority: {act.priority}</span>
                      </div>
                      <p className="mt-1 text-slate-700 font-medium">{act.action}</p>
                      <div className="mt-2 pt-1 border-t border-slate-200 flex justify-between text-[10px] font-mono text-slate-500">
                        <span>Owner: {act.assignedTo}</span>
                        <span>Timeframe: {act.timeframe}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence package */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1">
                  Compliant Evidence Package (Audit Ready)
                </h4>
                <div className="space-y-2">
                  {auditReport.evidencePackage.map((ev, idx) => (
                    <div key={idx} className="p-2 border-l-4 border-emerald-500 bg-slate-50 text-xs">
                      <div className="font-bold flex justify-between">
                        <span>{ev.clause}</span>
                        <span className="text-emerald-700 font-mono text-[10px]">{ev.evidenceRating}</span>
                      </div>
                      <blockquote className="mt-1 text-slate-600 italic">
                        "{ev.textQuote}"
                      </blockquote>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expired Certs */}
              {auditReport.expiredCertifications.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider border-b border-rose-300 pb-1">
                    Expired Certificates / Immediate Legal Liability Gaps
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {auditReport.expiredCertifications.map((cert, idx) => (
                      <li key={idx} className="p-2.5 bg-rose-50 border border-rose-100 rounded">
                        <span className="font-bold text-rose-800">{cert.item}</span> - <span className="font-mono text-rose-700">{cert.status}</span> (Expires: {cert.expiryDate})
                        <p className="text-[11px] text-slate-600 mt-0.5">{cert.risk}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bottom legal notice */}
              <div className="pt-6 border-t border-slate-300 flex justify-between text-[9px] text-slate-400 uppercase font-mono">
                <span>INDUS AI Compliance Engine v2.4</span>
                <span>Signature: Elena Rostova (HSE Plant Officer) &bull; Approved digitally</span>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Subcomponents
function CheckCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 7 17l-5-5" />
      <path d="m22 10-7.5 7.5L13 16" />
    </svg>
  );
}
