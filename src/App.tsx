import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import AnalyticsView from "./components/AnalyticsView";
import DocumentManagerView from "./components/DocumentManagerView";
import CopilotView from "./components/CopilotView";
import KnowledgeGraphView from "./components/KnowledgeGraphView";
import MaintenanceIntelligenceView from "./components/MaintenanceIntelligenceView";
import ComplianceIntelligenceView from "./components/ComplianceIntelligenceView";
import LessonsLearnedView from "./components/LessonsLearnedView";
import SettingsView from "./components/SettingsView";
import { Document, RoleType, WorkOrder } from "./types";
import { Cpu, Database, Network } from "lucide-react";

export default function App() {
  // Global States
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [activeRole, setActiveRole] = useState<RoleType>("operator");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  
  // Dynamic Documents state (fetched from backend)
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  
  // API security and server status states
  const [isApiConfigured, setIsApiConfigured] = useState<boolean>(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);
  const [docsError, setDocsError] = useState<string | null>(null);

  // Maintenance Work Orders local persistence
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
    {
      id: "WO-901",
      assetId: "SGT-900",
      title: "Inspect exhaust thermocouples TC-03 and TC-09 calibration drift",
      description: "Analyze thermocouple wiring junction for calibration drift. TC-03 reached 1045°F during peak load (offset exceeds standard ±15°C limit).",
      priority: "HIGH",
      status: "OPEN",
      assignedTo: "Sarah Jenkins (Reliability Crew A)",
      dateCreated: "2026-07-16",
      targetCompletion: "2026-07-19"
    },
    {
      id: "WO-702",
      assetId: "HPB-201",
      title: "Calibrate BMS low-fire combustion air damper",
      description: "Recalibrate forced draft fan FD-101 motor frequency and adjust damper actuator alignment at 15% startup firing purge threshold.",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      assignedTo: "Marcus Vance (Ops Crew B)",
      dateCreated: "2026-07-15",
      targetCompletion: "2026-07-21"
    }
  ]);

  // Fetch documents from Express server on mount
  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    setDocsError(null);
    try {
      const response = await fetch("/api/documents");
      if (!response.ok) {
        throw new Error("Failed to bridge with the operational database.");
      }
      const result = await response.json();
      if (result.success) {
        setDocuments(result.data);
        setIsApiConfigured(result.isApiConfigured);
      } else {
        throw new Error(result.error || "Failed loading indexed files.");
      }
    } catch (err: any) {
      console.error(err);
      setDocsError(err.message || "Operations Database Offline.");
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handler to ingest a new document on the backend (proxies Gemini metadata extraction)
  const handleUploadDocument = async (newDoc: { 
    title: string; 
    category: string; 
    content: string; 
    tags: string[];
    fileType?: string;
    ocrEngine?: string;
    preprocessingOptions?: string[];
    chunkSize?: number;
    chunkOverlap?: number;
    versionOption?: string;
  }) => {
    const response = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newDoc.title,
        category: newDoc.category,
        content: newDoc.content,
        tags: newDoc.tags,
        uploadedBy: activeRole === "operator" ? "Operator Station A" : "Lead Engineer",
        fileType: newDoc.fileType,
        ocrEngine: newDoc.ocrEngine,
        preprocessingOptions: newDoc.preprocessingOptions,
        chunkSize: newDoc.chunkSize,
        chunkOverlap: newDoc.chunkOverlap,
        versionOption: newDoc.versionOption
      })
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || "Ingestion protocol rejected.");
    }

    // Refresh database and select newly ingested document
    await fetchDocuments();
    setSelectedDocId(result.data.id);
  };

  // Handler to delete a document from the backend database
  const handleDeleteDocument = async (id: string) => {
    const response = await fetch(`/api/documents/${id}`, {
      method: "DELETE"
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || "Deletion command failed.");
    }

    if (selectedDocId === id) {
      setSelectedDocId(null);
    }
    await fetchDocuments();
  };

  // Dispatch / add a work order locally
  const handleAddWorkOrder = (wo: { assetId: string; title: string; description: string; priority: any; assignedTo: string }) => {
    const newWo: WorkOrder = {
      id: `WO-${Math.floor(100 + Math.random() * 900)}`,
      assetId: wo.assetId,
      title: wo.title,
      description: wo.description,
      priority: wo.priority,
      status: "OPEN",
      assignedTo: wo.assignedTo,
      dateCreated: new Date().toISOString().split("T")[0],
      targetCompletion: new Date(Date.now() + 5*24*60*60*1000).toISOString().split("T")[0]
    };
    setWorkOrders(prev => [newWo, ...prev]);
  };

  // Map tabs to correct content views
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView
            documents={documents}
            workOrders={workOrders}
            activeRole={activeRole}
            setActiveTab={setActiveTab}
            setSelectedDocId={setSelectedDocId}
          />
        );
      case "analytics":
        return (
          <AnalyticsView
            documents={documents}
            workOrders={workOrders}
            activeRole={activeRole}
          />
        );
      case "documents":
        return (
          <DocumentManagerView
            documents={documents}
            onUploadDocument={handleUploadDocument}
            onDeleteDocument={handleDeleteDocument}
            selectedDocId={selectedDocId}
            setSelectedDocId={setSelectedDocId}
            activeRole={activeRole}
          />
        );
      case "copilot":
        return (
          <CopilotView
            documents={documents}
            selectedDocId={selectedDocId}
            setSelectedDocId={setSelectedDocId}
            activeRole={activeRole}
            isApiConfigured={isApiConfigured}
          />
        );
      case "graph":
        return (
          <KnowledgeGraphView
            documents={documents}
            activeRole={activeRole}
            isApiConfigured={isApiConfigured}
          />
        );
      case "maintenance":
        return (
          <MaintenanceIntelligenceView
            workOrders={workOrders}
            onAddWorkOrder={handleAddWorkOrder}
            activeRole={activeRole}
            isApiConfigured={isApiConfigured}
          />
        );
      case "compliance":
        return (
          <ComplianceIntelligenceView
            documents={documents}
            activeRole={activeRole}
            isApiConfigured={isApiConfigured}
          />
        );
      case "lessons":
        return (
          <LessonsLearnedView
            activeRole={activeRole}
            isApiConfigured={isApiConfigured}
            documents={documents}
          />
        );
      case "settings":
        return (
          <SettingsView
            activeRole={activeRole}
            isApiConfigured={isApiConfigured}
          />
        );
      default:
        return (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-400">Section Under Engineering Construction</p>
          </div>
        );
    }
  };

  return (
    <div className="dark bg-elegant-dark text-slate-200 flex h-screen w-screen overflow-hidden">
      
      {/* Sidebar Control Station */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        theme={theme}
        setTheme={setTheme}
        isApiConfigured={isApiConfigured}
      />

      {/* Primary Workspace Viewport */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-elegant-dark">
        
        {/* Loading Overlay */}
        {isLoadingDocs ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-elegant-dark p-6">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <Cpu className="w-6 h-6 text-blue-400 animate-pulse absolute" />
            <h3 className="text-sm font-semibold text-slate-200">Initializing INDUS AI Unified Operations Brain</h3>
            <p className="text-xs text-slate-500 mt-1 font-mono">Synchronizing telemetry parameters and indexing local SOP nodes...</p>
          </div>
        ) : docsError ? (
          /* Error Screen */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
            <Network className="w-12 h-12 text-rose-500 mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Gateway Interruption</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              The application was unable to establish a handshake with the Express server. Verify that the dev server is active and port <span className="font-mono">3000</span> is operational.
            </p>
            <button
              onClick={fetchDocuments}
              className="mt-4 px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-semibold shadow-sm transition-all"
            >
              Re-Establish Connection
            </button>
          </div>
        ) : (
          /* Normal Tab Content Rendering */
          renderTabContent()
        )}
      </main>

    </div>
  );
}
