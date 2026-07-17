import React, { useState } from "react";
import { 
  FileText, 
  Tag, 
  Trash2, 
  Plus, 
  ArrowLeft, 
  Upload, 
  Cpu, 
  AlertCircle, 
  CheckCircle, 
  Calendar, 
  User, 
  Layers, 
  Sliders, 
  Check,
  Settings,
  Database,
  Grid,
  FileSpreadsheet,
  Workflow,
  Network,
  Binary,
  Bookmark,
  Eye,
  Info,
  ChevronRight,
  ShieldCheck,
  Activity,
  UserCheck
} from "lucide-react";
import { Document, RoleType } from "../types";

interface DocumentManagerViewProps {
  documents: Document[];
  onUploadDocument: (doc: { 
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
  }) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
  activeRole: RoleType;
}

// Client-side parser for fallback metadata if backend did not include pipelineResults (e.g., pre-loaded items)
function getPipelineResults(doc: Document) {
  if (doc.metadata && (doc.metadata as any).pipelineResults) {
    return (doc.metadata as any).pipelineResults;
  }
  
  const content = doc.content || "";
  const category = doc.category || "SOP";
  
  // Extract equipment IDs (e.g., HPB-201, TC-03, LCV-102, SGT-900)
  const equipMatches = content.match(/[A-Z]+-[A-Z0-9]+-[0-9A-Z]+/g) || content.match(/[A-Z]+-[0-9]+[A-Z]?/g) || [];
  const equipmentIDs = [...new Set(equipMatches)].slice(0, 4);

  // Extract temperatures and pressures
  const tempMatches = content.match(/\d+(\.\d+)?\s?°[FC]/g) || [];
  const temperatures = [...new Set(tempMatches)].slice(0, 3);

  const pressureMatches = content.match(/\d+(\.\d+)?\s?psi/gi) || [];
  const pressures = [...new Set(pressureMatches)].slice(0, 3);

  const serialMatches = content.match(/[A-Z0-9]{4,12}-[A-Z0-9]{2,5}/g) || content.match(/[A-Z]{3,5}-\d{3}/g) || [];
  const serialNumbers = [...new Set(serialMatches)].slice(0, 3);

  const complianceMatches = content.match(/(OSHA\s?\d+(\.\d+)?|ISO-\d+|NFPA\s?\d+[A-Z]?|CFR\s?\d+(\.\d+)?)/gi) || [];
  const complianceStandards = [...new Set(complianceMatches)].slice(0, 3);

  // Compute file SHA-256 simulation hash value
  let hashVal = 0;
  for (let j = 0; j < content.length; j++) {
    hashVal = (hashVal << 5) - hashVal + content.charCodeAt(j);
    hashVal |= 0;
  }
  const simulatedSha = "sha256_" + Math.abs(hashVal).toString(16);

  // Document layout counts
  const paragraphsCount = Math.max(3, content.split(/\n\n+/).length);
  const headersCount = Math.max(2, (content.match(/^[1-9]\..+$/gm) || []).length);
  const tablesCount = content.toLowerCase().includes("torque") || content.toLowerCase().includes("purge") || content.toLowerCase().includes("specifications") ? 1 : 0;
  const figuresCount = category.toLowerCase() === "drawing" ? 1 : 0;

  // Tables
  const tables: any[] = [];
  if (content.toLowerCase().includes("torque")) {
    tables.push({
      tableName: "Casing Joint Torque Thresholds",
      headers: ["Inspection Step", "Target Torque (Nm)", "Verify Margin"],
      rows: [
        ["Step 1 - Pre-Tighten", "300 Nm", "±10 Nm"],
        ["Step 2 - Intermediate", "700 Nm", "±25 Nm"],
        ["Step 3 - Final Clamp", "1200 Nm", "±50 Nm"]
      ]
    });
  } else if (content.toLowerCase().includes("purge") || content.toLowerCase().includes("boiler")) {
    tables.push({
      tableName: "Safety Purge Process Limits",
      headers: ["Parameter Description", "Operating Threshold", "Interlock Status"],
      rows: [
        ["Drum Water Level", "50% (Range 35% - 65%)", "Tripped on Starvation"],
        ["Forced Draft Flow", "12,000 CFM", "Pre-purge Mandatory"],
        ["Countdown Timer", "300 Seconds", "BMS Permissive Lock"],
        ["Flame Scanner current", "Min 4.5 microamps", "Immediate Fuel Lockout"]
      ]
    });
  } else {
    tables.push({
      tableName: "Extracted Reference Parameter Matrix",
      headers: ["Asset Property", "Operational Limit", "Source Verification"],
      rows: [
        ["Maximum Temperature Bounds", temperatures[0] || "1045°F", "Engineering Sheet"],
        ["Design Pressure Limit", pressures[0] || "450 psi", "Manufacturer Manual"],
        ["Safe Calibration Limit", "Standard Operator Deviation Check", "Floor Guidelines"]
      ]
    });
  }

  // Knowledge relationships
  const relationships: any[] = [];
  if (content.toLowerCase().includes("boiler")) {
    relationships.push({ source: "Feedwater Pump P-201", target: "Steam Boiler HPB-201", type: "SUPPLIES_WATER_TO" });
    relationships.push({ source: "Deaerator Vessel D-201", target: "Feedwater Pump P-201", type: "PREVENTS_SUCTION_STARVATION" });
    relationships.push({ source: "DCS controller LIC-102", target: "Pneumatic Valve LCV-102", type: "MODULATES_FLOW" });
  } else if (content.toLowerCase().includes("compressor")) {
    relationships.push({ source: "Air Compressor C-102", target: "Receiver Tank T-105", type: "CHARGES_AIR" });
    relationships.push({ source: "Pressure Relief Valve PRV-202", target: "Receiver Tank T-105", type: "PROTECTS_LIMIT" });
  } else {
    relationships.push({ source: "Operator Room", target: "Auxiliary Unit", type: "MONITORS_STEADY_STATE" });
    relationships.push({ source: "EHS Manager", target: "Operational Floor", type: "AUDITS_SAFETY" });
  }

  // Chunks
  const chunks: any[] = [];
  const words = content.split(/\s+/);
  let idx = 0;
  let chunkIdx = 1;
  while (idx < words.length && chunkIdx <= 4) {
    const chunkWords = words.slice(idx, idx + 150);
    if (chunkWords.length === 0) break;
    
    // Pick meaningful keywords from words list
    const wordsSorted = [...chunkWords]
      .map(w => w.replace(/[^a-zA-Z]/g, "").toLowerCase())
      .filter(w => w.length > 5);
    const uniqueKeywords = [...new Set(wordsSorted)].slice(0, 4);

    chunks.push({
      id: `chunk-${chunkIdx}`,
      text: chunkWords.join(" "),
      keywords: uniqueKeywords.length > 0 ? uniqueKeywords : ["parameter", "limits", "safety"]
    });
    idx += 120; // 30 overlap
    chunkIdx++;
  }

  const operators = ["Sarah Jenkins", "Marcus Vance", "Rohan Gupta"];
  const dates = ["2026-07-16", "2026-07-15"];

  return {
    classification: category,
    language: "English",
    layoutStructure: { headersCount, paragraphsCount, tablesCount, figuresCount },
    handwritingNotes: [
      "Operator Margin Scribble: 'Verified on shift 2 - JB'",
      `Verification Note: 'Draft updated to reflect 2026 EHS standards.'`
    ],
    tables,
    relationships,
    versionInfo: {
      version: "v1.0",
      isDuplicate: false,
      sha256: simulatedSha
    },
    chunks,
    parameters: {
      equipmentIDs: equipmentIDs.join(", ") || "N/A",
      machineNames: content.toLowerCase().includes("boiler") ? "High-Pressure Steam Boiler HPB-201" : content.toLowerCase().includes("compressor") ? "Flushing Compressor" : "Auxiliary Unit",
      temperatures: temperatures.join(", ") || "N/A",
      pressures: pressures.join(", ") || "N/A",
      maintenanceDates: dates.join(", "),
      operators: operators.join(", "),
      departments: category === "Safety" ? "EHS Department" : "Operations Department",
      safetyReferences: complianceStandards.join(", ") || "N/A",
      complianceStandards: complianceStandards.join(", ") || "N/A",
      regulatoryCodes: complianceStandards[0] || "N/A",
      serialNumbers: serialNumbers.join(", ") || "N/A",
      locations: content.toLowerCase().includes("boiler") ? "Steam Utility Boiler Bay 2" : "Main Operational Deck"
    }
  };
}

export default function DocumentManagerView({
  documents,
  onUploadDocument,
  onDeleteDocument,
  selectedDocId,
  setSelectedDocId,
  activeRole
}: DocumentManagerViewProps) {
  
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  // Ingest main form state
  const [newTitle, setNewTitle] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("SOP");
  const [newContent, setNewContent] = useState<string>("");
  const [newTagsStr, setNewTagsStr] = useState<string>("");
  
  // Advanced Pipeline Configuration state
  const [fileType, setFileType] = useState<string>("PDF");
  const [ocrEngine, setOcrEngine] = useState<string>("Tesseract OCR");
  const [preprocessingOptions, setPreprocessingOptions] = useState<string[]>(["Deskewing", "Contrast Enhancement"]);
  const [chunkSize, setChunkSize] = useState<number>(150);
  const [chunkOverlap, setChunkOverlap] = useState<number>(30);
  const [versionOption, setVersionOption] = useState<string>("minor");
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const [uploadStatus, setUploadStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [uploadError, setUploadError] = useState<string>("");

  // Tab control inside selected document view
  const [detailsTab, setDetailsTab] = useState<"overview" | "parameters" | "tables" | "graph">("overview");

  const selectedDoc = documents.find(d => d.id === selectedDocId);
  const selectedPipeline = selectedDoc ? getPipelineResults(selectedDoc) : null;

  // Filtered documents list
  const filteredDocs = filterCategory === "ALL" 
    ? documents 
    : documents.filter(d => d.category.toLowerCase() === filterCategory.toLowerCase());

  // Available industrial options
  const industrialFileTypes = [
    { value: "PDF", label: "Standard PDF (Searchable)" },
    { value: "ScannedPDF", label: "Scanned PDF / Printout" },
    { value: "DOCX", label: "Microsoft Word (DOCX)" },
    { value: "XLSX", label: "Excel Spreadsheet (XLSX)" },
    { value: "PPTX", label: "PowerPoint Presentation" },
    { value: "P&ID Drawing", label: "Engineering Drawing (P&ID)" },
    { value: "CAD", label: "CAD Schematic / Vector" },
    { value: "Image", label: "JPEG / PNG Blueprint Scan" },
    { value: "Email", label: "Email Archive (.eml)" },
    { value: "MaintenanceReport", label: "Maintenance Log Report" },
    { value: "InspectionDoc", label: "Field Inspection Checklist" },
    { value: "SafetyManual", label: "Safety Manual Guidebook" },
    { value: "OperatingProcedure", label: "Standard Operating Procedure" },
    { value: "RegulatoryGuideline", label: "Regulatory Compliance Code" }
  ];

  const ocrEngines = [
    { value: "Tesseract OCR", label: "Tesseract OCR Engine (Local)" },
    { value: "Google Cloud Document AI", label: "Google Cloud Document AI (EHS Suite)" },
    { value: "Adobe PDF Extract", label: "Adobe PDF Structure Extract" },
    { value: "DeepLayout Native", label: "DeepLayout Native Segmenter" },
    { value: "None (Direct Text)", label: "None - Bypass OCR (Direct Unicode)" }
  ];

  const preprocessingCheckboxes = [
    { id: "Deskewing", label: "Auto-Deskew (Straighten layout)" },
    { id: "Contrast Enhancement", label: "Adaptive Binarization / Contrast Boost" },
    { id: "Noise Removal", label: "Gaussian Denoising (Speckle cleanup)" },
    { id: "Binarization", label: "Otsu threshold binarization (Sparsity check)" }
  ];

  // Toggle checklist
  const handleTogglePreprocessing = (id: string) => {
    if (preprocessingOptions.includes(id)) {
      setPreprocessingOptions(prev => prev.filter(item => item !== id));
    } else {
      setPreprocessingOptions(prev => [...prev, id]);
    }
  };

  // Handle Form Submission
  const handleSubmitIngestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setUploadError("Title and content are required.");
      setUploadStatus("error");
      return;
    }

    setUploadStatus("loading");
    setUploadError("");

    try {
      const tags = newTagsStr
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      await onUploadDocument({
        title: newTitle,
        category: newCategory,
        content: newContent,
        tags,
        fileType,
        ocrEngine,
        preprocessingOptions,
        chunkSize,
        chunkOverlap,
        versionOption
      });

      setUploadStatus("success");
      
      // Reset form fields
      setNewTitle("");
      setNewContent("");
      setNewTagsStr("");
      
      // Reset advanced config
      setFileType("PDF");
      setOcrEngine("Tesseract OCR");
      setPreprocessingOptions(["Deskewing", "Contrast Enhancement"]);
      setChunkSize(150);
      setChunkOverlap(30);
      setVersionOption("minor");
      setShowAdvanced(false);

      // Hide modal after some delay
      setTimeout(() => {
        setIsUploading(false);
        setUploadStatus("idle");
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Failed to ingest document.");
      setUploadStatus("error");
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden font-sans">
      
      {/* LEFT COLUMN: Browse list */}
      <div className={`w-full md:w-1/2 flex flex-col h-full border-r border-slate-200 dark:border-slate-800 ${selectedDocId ? "hidden md:flex" : "flex"}`}>
        
        {/* Header toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100 leading-none">
                Industrial Document Intelligence
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Browse plant procedures, CAD drawing annotations, safety codes, and maintenance metrics.
              </p>
            </div>
            
            <button
              onClick={() => setIsUploading(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Ingest Pipeline</span>
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-1.5">
            {["ALL", "SOP", "Manual", "Drawing", "Safety", "Report"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded text-xs transition-all font-medium ${
                  filterCategory === cat
                    ? "bg-slate-800 text-slate-50 dark:bg-slate-100 dark:text-slate-900"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-900">
          {filteredDocs.map((doc) => {
            const isSelected = doc.id === selectedDocId;
            const metaResults = getPipelineResults(doc);
            const vInfo = metaResults?.versionInfo;

            return (
              <div
                key={doc.id}
                id={`doc-item-${doc.id}`}
                onClick={() => {
                  setSelectedDocId(doc.id);
                  setDetailsTab("overview");
                }}
                className={`p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors ${
                  isSelected ? "bg-orange-500/5 dark:bg-orange-500/10 border-l-2 border-orange-500" : ""
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded text-slate-500 dark:text-slate-400">
                      <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className={`text-xs font-semibold leading-tight ${isSelected ? "text-orange-600 dark:text-orange-400" : "text-slate-800 dark:text-slate-200"}`}>
                          {doc.title}
                        </h3>
                        {vInfo?.version && (
                          <span className="text-[9px] bg-slate-200/60 dark:bg-slate-800 text-slate-500 px-1 py-0.2 rounded font-mono font-semibold">
                            {vInfo.version}
                          </span>
                        )}
                        {vInfo?.isDuplicate && (
                          <span className="text-[9px] bg-rose-500/15 text-rose-500 px-1 py-0.2 rounded font-mono font-bold uppercase tracking-wide">
                            Dup Ref
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase">
                          {doc.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{doc.fileSize}</span>
                        <span className="text-slate-400 text-[10px]">•</span>
                        <span className="text-[10px] text-slate-400">{doc.uploadDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags preview */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {doc.tags.slice(0, 4).map((tag, idx) => (
                    <span key={idx} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded text-[9px] font-medium border border-slate-200/40 dark:border-slate-800/40">
                      <Tag className="w-2.5 h-2.5 text-slate-400" />
                      <span>{tag}</span>
                    </span>
                  ))}
                  {doc.tags.length > 4 && (
                    <span className="text-[9px] text-slate-400 self-center font-semibold ml-1">
                      +{doc.tags.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredDocs.length === 0 && (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500">
              <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-xs">No documents found matching this filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Document Detail Viewer OR AI Upload Form */}
      <div className={`w-full md:w-1/2 flex flex-col h-full bg-white dark:bg-slate-950 ${selectedDocId ? "flex" : "hidden md:flex items-center justify-center bg-slate-50/20 dark:bg-slate-950/20"}`}>
        
        {isUploading ? (
          /* =======================================
             ADVANCED AI INGESTION PORTAL FORM
             ======================================= */
          <div className="p-6 h-full flex flex-col overflow-y-auto bg-slate-50/30 dark:bg-slate-950">
            <div className="flex items-center gap-2 mb-4">
              <button 
                onClick={() => setIsUploading(false)}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Cpu className="w-4.5 h-4.5 text-orange-500 animate-pulse" />
                  <span>Document Intelligence Pipeline</span>
                </h2>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Ingest manuals, CAD schematics, or EHS regulations with full structural parsing.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitIngestion} className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Document raw title */}
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 block mb-1 font-bold">
                    Initial Document Name / Reference
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HPB-201-M1 High Pressure Boiler Operating Manual"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    disabled={uploadStatus === "loading"}
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Grid category & tags */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 block mb-1 font-bold">
                      Functional Classification
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      disabled={uploadStatus === "loading"}
                      className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                    >
                      <option value="SOP">SOP (Standard Procedure)</option>
                      <option value="Manual">Manual (Operating Spec)</option>
                      <option value="Drawing">Drawing (P&ID blueprint)</option>
                      <option value="Safety">Safety Standards (OSHA)</option>
                      <option value="Report">Incident Report (RCA)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 block mb-1 font-bold">
                      Custom Search Tags (Comma split)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. boiler, maintenance, osha-1910"
                      value={newTagsStr}
                      onChange={(e) => setNewTagsStr(e.target.value)}
                      disabled={uploadStatus === "loading"}
                      className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Collapsible Advanced Settings */}
                <div className="border border-slate-200 dark:border-slate-800 rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800/70 transition-colors flex justify-between items-center text-xs font-mono font-bold text-slate-700 dark:text-slate-300"
                  >
                    <span className="flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5 text-orange-500" />
                      Advanced Pipeline Configuration
                    </span>
                    <span className="text-[10px] text-slate-400">{showAdvanced ? "Hide ▴" : "Configure ▾"}</span>
                  </button>

                  {showAdvanced && (
                    <div className="p-4 bg-white dark:bg-slate-950 space-y-4 border-t border-slate-200 dark:border-slate-800 text-xs">
                      
                      {/* File Ingestion Type & OCR Engine */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-mono uppercase text-slate-400 block mb-1 font-bold">
                            Ingestion Document Format
                          </label>
                          <select
                            value={fileType}
                            onChange={(e) => setFileType(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                          >
                            {industrialFileTypes.map((item) => (
                              <option key={item.value} value={item.value}>{item.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] font-mono uppercase text-slate-400 block mb-1 font-bold">
                            OCR Parsing & Layout Engine
                          </label>
                          <select
                            value={ocrEngine}
                            onChange={(e) => setOcrEngine(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                          >
                            {ocrEngines.map((item) => (
                              <option key={item.value} value={item.value}>{item.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Image Preprocessing Checkboxes */}
                      <div>
                        <label className="text-[9px] font-mono uppercase text-slate-400 block mb-1.5 font-bold">
                          Image & Scan Preprocessing Pipeline
                        </label>
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded border border-slate-200/50 dark:border-slate-800/40">
                          {preprocessingCheckboxes.map((item) => {
                            const isChecked = preprocessingOptions.includes(item.id);
                            return (
                              <label key={item.id} className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-slate-600 dark:text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePreprocessing(item.id)}
                                  className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 w-3.5 h-3.5 accent-orange-500"
                                />
                                <span>{item.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Semantic Chunking & Overlap Controls */}
                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div>
                          <label className="text-[9px] font-mono uppercase text-slate-400 block mb-1 font-bold">
                            Semantic Chunk Size (Max {chunkSize} words)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min={50}
                              max={500}
                              step={10}
                              value={chunkSize}
                              onChange={(e) => setChunkSize(parseInt(e.target.value))}
                              className="w-full accent-orange-500 cursor-pointer"
                            />
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[10px] w-12 text-right">
                              {chunkSize}w
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] font-mono uppercase text-slate-400 block mb-1 font-bold">
                            Chunk Sliding Overlap ({chunkOverlap} words)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min={10}
                              max={150}
                              step={5}
                              value={chunkOverlap}
                              onChange={(e) => setChunkOverlap(parseInt(e.target.value))}
                              className="w-full accent-orange-500 cursor-pointer"
                            />
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[10px] w-12 text-right">
                              {chunkOverlap}w
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Duplicate & Version Control strategy */}
                      <div>
                        <label className="text-[9px] font-mono uppercase text-slate-400 block mb-1.5 font-bold">
                          Version Tracking Strategy
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600 dark:text-slate-300">
                            <input
                              type="radio"
                              name="versionOption"
                              checked={versionOption === "minor"}
                              onChange={() => setVersionOption("minor")}
                              className="accent-orange-500"
                            />
                            <span>Create Minor Revision (e.g., v1.1 if duplicate name found)</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600 dark:text-slate-300">
                            <input
                              type="radio"
                              name="versionOption"
                              checked={versionOption === "major"}
                              onChange={() => setVersionOption("major")}
                              className="accent-orange-500"
                            />
                            <span>Force Major Update (e.g., v2.0)</span>
                          </label>
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                {/* Raw content text */}
                <div className="flex-1 flex flex-col">
                  <label className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 block mb-1 font-bold">
                    Technical Content Input (Procedural Steps, telemetry thresholds, manual chapters)
                  </label>
                  <textarea
                    required
                    placeholder="Paste technical instruction manual text, inspection report data, or blueprint annotations here..."
                    rows={12}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    disabled={uploadStatus === "loading"}
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono leading-relaxed"
                  ></textarea>
                </div>
              </div>

              {/* Status alerts */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-900">
                {uploadStatus === "error" && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded mb-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {uploadStatus === "success" && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded mb-3 flex items-start gap-2 animate-pulse">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Industrial asset ingested successfully! Ingestion pipeline completed all extraction phases.</span>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUploading(false)}
                    disabled={uploadStatus === "loading"}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={uploadStatus === "loading"}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                  >
                    {uploadStatus === "loading" ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Executing OCR & Classification...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Run Ingestion Pipeline</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : selectedDoc ? (
          /* =======================================
             SELECTED DOCUMENT DETAILED VIEWER
             ======================================= */
          <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-slate-950">
            
            {/* Upper Detail Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDocId(null)}
                  className="md:hidden p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {selectedDoc.title}
                    </h3>
                    <span className="text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                      {selectedDoc.category}
                    </span>
                    {selectedPipeline?.versionInfo?.version && (
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono font-bold">
                        {selectedPipeline.versionInfo.version}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                    <span className="font-mono text-slate-500">{selectedDoc.id}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-500">SHA-256: {selectedPipeline?.versionInfo?.sha256?.substring(0, 16)}...</span>
                  </div>
                </div>
              </div>

              {/* Deletion control (Reliability Engineers and Managers) */}
              {(activeRole === "engineer" || activeRole === "plant_manager") && (
                <button
                  onClick={async () => {
                    if (confirm("Are you sure you want to permanently delete this document and purge its indexes from the AI retrieval cache?")) {
                      await onDeleteDocument(selectedDoc.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors"
                  title="Purge document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Document Workspace Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950">
              <button
                onClick={() => setDetailsTab("overview")}
                className={`flex-1 py-2 text-center text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  detailsTab === "overview"
                    ? "border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-500/[0.02]"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Overview
              </button>
              <button
                onClick={() => setDetailsTab("parameters")}
                className={`flex-1 py-2 text-center text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  detailsTab === "parameters"
                    ? "border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-500/[0.02]"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Parameters
              </button>
              <button
                onClick={() => setDetailsTab("tables")}
                className={`flex-1 py-2 text-center text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  detailsTab === "tables"
                    ? "border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-500/[0.02]"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Tables & Annotations
              </button>
              <button
                onClick={() => setDetailsTab("graph")}
                className={`flex-1 py-2 text-center text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  detailsTab === "graph"
                    ? "border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-500/[0.02]"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <Workflow className="w-3.5 h-3.5" />
                Relationships & RAG Chunks
              </button>
            </div>

            {/* Document Details Tab Panels */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              
              {/* Tab 1: OVERVIEW */}
              {detailsTab === "overview" && (
                <>
                  {/* Duplicate & Version Warning Banner */}
                  {selectedPipeline?.versionInfo?.isDuplicate && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4.5 h-4.5 mt-0.5 flex-shrink-0 text-amber-500" />
                      <div>
                        <span className="font-bold block uppercase tracking-wider text-[9px] mb-0.5">DUPLICATE DETECTED</span>
                        An identical technical hash exists in the system database for ID <span className="font-mono font-bold bg-amber-500/20 px-1 rounded">{selectedPipeline.versionInfo.duplicateOfId || "original"}</span>. This document was processed as revision <span className="font-mono font-bold bg-amber-500/20 px-1 rounded">{selectedPipeline.versionInfo.version}</span> under active version tracking constraints.
                      </div>
                    </div>
                  )}

                  {/* Gemini Operations Brain Summary */}
                  {selectedDoc.metadata?.aiSummary && (
                    <div className="p-4 bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/20 rounded relative glow-orange">
                      <div className="flex items-center justify-between text-[11px] font-mono text-orange-600 dark:text-orange-400 font-bold mb-1.5 uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 animate-spin-slow" />
                          Gemini Operations Summary
                        </span>
                        <span className="text-[9px] bg-orange-500/10 text-orange-500 px-1.5 py-0.2 rounded font-bold uppercase">
                          Auto-Generated
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                        "{selectedDoc.metadata.aiSummary}"
                      </p>
                    </div>
                  )}

                  {/* Technical Content Text Segment */}
                  <div>
                    <h4 className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 mb-2 font-bold tracking-wider">
                      Technical Document Body Text
                    </h4>
                    <div className="bg-slate-950 text-slate-200 p-4 rounded text-[11px] leading-relaxed font-mono whitespace-pre-wrap select-all max-h-96 overflow-y-auto border border-slate-800">
                      {selectedDoc.content}
                    </div>
                  </div>

                  {/* Metadata tags */}
                  <div>
                    <h4 className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 mb-2 font-bold tracking-wider">
                      Ingested Indexing Tags
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDoc.tags.map((tag, i) => (
                        <span key={i} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded text-xs font-medium">
                          <Tag className="w-3 h-3 text-slate-400" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Traditional Metadata Attributes */}
                  <div className="grid grid-cols-3 gap-2 text-[10px] bg-slate-50 dark:bg-slate-900/20 p-3 rounded">
                    <div>
                      <span className="text-slate-400 block uppercase font-mono mb-0.5">Ingested By</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" /> {selectedDoc.uploadedBy}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-mono mb-0.5">Pipeline Date</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> {selectedDoc.uploadDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-mono mb-0.5">File System Code</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1 font-mono">
                        {selectedPipeline?.parameters?.equipmentIDs?.split(",")[0] || selectedDoc.metadata?.equipmentID || selectedDoc.metadata?.systemRef || "N/A"}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Tab 2: EXTRACTED PHYSICAL PARAMETERS */}
              {detailsTab === "parameters" && (
                <>
                  {/* Document Layout Detection Statistics */}
                  <div className="bg-slate-100/40 dark:bg-slate-900/40 p-4 rounded border border-slate-200/50 dark:border-slate-800/50">
                    <h4 className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 mb-2.5 font-bold tracking-wider flex items-center gap-1.5">
                      <Grid className="w-3.5 h-3.5 text-orange-500" />
                      Document Layout Detection Stats
                    </h4>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-white dark:bg-slate-950 p-2.5 rounded border border-slate-200/50 dark:border-slate-800/50">
                        <span className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 block">
                          {selectedPipeline?.layoutStructure?.headersCount || 0}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono block uppercase">Headers</span>
                      </div>
                      <div className="bg-white dark:bg-slate-950 p-2.5 rounded border border-slate-200/50 dark:border-slate-800/50">
                        <span className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 block">
                          {selectedPipeline?.layoutStructure?.paragraphsCount || 0}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono block uppercase">Paragraphs</span>
                      </div>
                      <div className="bg-white dark:bg-slate-950 p-2.5 rounded border border-slate-200/50 dark:border-slate-800/50">
                        <span className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 block">
                          {selectedPipeline?.layoutStructure?.tablesCount || 0}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono block uppercase">Tables</span>
                      </div>
                      <div className="bg-white dark:bg-slate-950 p-2.5 rounded border border-slate-200/50 dark:border-slate-800/50">
                        <span className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 block">
                          {selectedPipeline?.layoutStructure?.figuresCount || 0}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono block uppercase">Figures</span>
                      </div>
                    </div>
                  </div>

                  {/* Comprehensive Extracted Parameters Matrix */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 font-bold tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-orange-500" />
                      Extracted Physical & Compliance Properties
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      
                      {/* Equipment IDs */}
                      <div className="bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded border border-slate-200/40 dark:border-slate-800/40 text-[11px]">
                        <span className="text-slate-400 block font-mono text-[9px] uppercase leading-none mb-1">Equipment IDs / Tags</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {selectedPipeline?.parameters?.equipmentIDs || "N/A"}
                        </span>
                      </div>

                      {/* Machine Names */}
                      <div className="bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded border border-slate-200/40 dark:border-slate-800/40 text-[11px]">
                        <span className="text-slate-400 block font-mono text-[9px] uppercase leading-none mb-1">Machine / Asset Name</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {selectedPipeline?.parameters?.machineNames || "N/A"}
                        </span>
                      </div>

                      {/* Temperatures */}
                      <div className="bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded border border-slate-200/40 dark:border-slate-800/40 text-[11px]">
                        <span className="text-slate-400 block font-mono text-[9px] uppercase leading-none mb-1">Process Temperatures</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {selectedPipeline?.parameters?.temperatures || "N/A"}
                        </span>
                      </div>

                      {/* Pressures */}
                      <div className="bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded border border-slate-200/40 dark:border-slate-800/40 text-[11px]">
                        <span className="text-slate-400 block font-mono text-[9px] uppercase leading-none mb-1">Process Pressures</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {selectedPipeline?.parameters?.pressures || "N/A"}
                        </span>
                      </div>

                      {/* Maintenance Dates */}
                      <div className="bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded border border-slate-200/40 dark:border-slate-800/40 text-[11px]">
                        <span className="text-slate-400 block font-mono text-[9px] uppercase leading-none mb-1">Maintenance Dates</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {selectedPipeline?.parameters?.maintenanceDates || "N/A"}
                        </span>
                      </div>

                      {/* Operators */}
                      <div className="bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded border border-slate-200/40 dark:border-slate-800/40 text-[11px]">
                        <span className="text-slate-400 block font-mono text-[9px] uppercase leading-none mb-1">Operators In Charge</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {selectedPipeline?.parameters?.operators || "N/A"}
                        </span>
                      </div>

                      {/* Departments */}
                      <div className="bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded border border-slate-200/40 dark:border-slate-800/40 text-[11px]">
                        <span className="text-slate-400 block font-mono text-[9px] uppercase leading-none mb-1">Department / Bay</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {selectedPipeline?.parameters?.departments || "N/A"}
                        </span>
                      </div>

                      {/* Locations */}
                      <div className="bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded border border-slate-200/40 dark:border-slate-800/40 text-[11px]">
                        <span className="text-slate-400 block font-mono text-[9px] uppercase leading-none mb-1">Specific Plant Location</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {selectedPipeline?.parameters?.locations || "N/A"}
                        </span>
                      </div>

                      {/* Compliance Standards */}
                      <div className="bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded border border-slate-200/40 dark:border-slate-800/40 text-[11px]">
                        <span className="text-slate-400 block font-mono text-[9px] uppercase leading-none mb-1">Compliance & Standards</span>
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                          {selectedPipeline?.parameters?.complianceStandards || "N/A"}
                        </span>
                      </div>

                      {/* Regulatory Codes */}
                      <div className="bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded border border-slate-200/40 dark:border-slate-800/40 text-[11px]">
                        <span className="text-slate-400 block font-mono text-[9px] uppercase leading-none mb-1">Regulatory Clause Reference</span>
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                          {selectedPipeline?.parameters?.regulatoryCodes || "N/A"}
                        </span>
                      </div>

                      {/* Serial Numbers */}
                      <div className="bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded border border-slate-200/40 dark:border-slate-800/40 text-[11px]">
                        <span className="text-slate-400 block font-mono text-[9px] uppercase leading-none mb-1">Component Serial Numbers</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {selectedPipeline?.parameters?.serialNumbers || "N/A"}
                        </span>
                      </div>

                      {/* Pipeline Configuration Metadata used */}
                      <div className="bg-orange-500/5 dark:bg-orange-500/10 p-2.5 rounded border border-orange-500/15 text-[11px]">
                        <span className="text-orange-500 block font-mono text-[9px] uppercase leading-none mb-1">Ingestion Engine Used</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {selectedPipeline?.parameters?.ocrEngine || selectedDoc.metadata?.pipelineConfig?.ocrEngine || "Tesseract OCR"} 
                          {" "} ({selectedDoc.metadata?.pipelineConfig?.fileType || "PDF"} parser)
                        </span>
                      </div>

                    </div>
                  </div>
                </>
              )}

              {/* Tab 3: TABLES EXTRACTION & HANDWRITING RECOGNITION */}
              {detailsTab === "tables" && (
                <>
                  {/* Handwriting Recognition Notes Box */}
                  <div className="bg-amber-500/[0.03] dark:bg-amber-500/5 p-4 rounded border border-amber-500/15">
                    <h4 className="text-[10px] font-mono uppercase text-amber-600 dark:text-amber-400 mb-2 font-bold tracking-wider flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                      Handwriting & Field Margin Notes Recognition
                    </h4>
                    {selectedPipeline?.handwritingNotes && selectedPipeline.handwritingNotes.length > 0 ? (
                      <ul className="space-y-1.5">
                        {selectedPipeline.handwritingNotes.map((note: string, i: number) => (
                          <li key={i} className="text-xs text-slate-700 dark:text-slate-300 italic flex items-start gap-1.5">
                            <span className="text-amber-500 font-mono select-none">✍</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No handwritten operator notes detected in high contrast scan.</p>
                    )}
                  </div>

                  {/* Extract Layout Tables Display */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 font-bold tracking-wider flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-orange-500" />
                      Structured Layout Tables Extracted
                    </h4>

                    {selectedPipeline?.tables && selectedPipeline.tables.length > 0 ? (
                      selectedPipeline.tables.map((table: any, tIdx: number) => (
                        <div key={tIdx} className="border border-slate-200 dark:border-slate-800 rounded overflow-hidden">
                          <div className="bg-slate-50 dark:bg-slate-900 px-3 py-2 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 uppercase flex items-center justify-between">
                            <span>{table.tableName || `Extracted Table ${tIdx + 1}`}</span>
                            <span className="bg-orange-500/10 text-orange-500 px-1.5 py-0.2 rounded text-[9px]">Matrix</span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-100/60 dark:bg-slate-950/80 font-mono text-[10px] text-slate-500 border-b border-slate-200 dark:border-slate-800 uppercase">
                                <tr>
                                  {table.headers.map((h: string, hIdx: number) => (
                                    <th key={hIdx} className="px-3 py-2 font-bold">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-900 font-mono">
                                {table.rows.map((row: string[], rIdx: number) => (
                                  <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-900/20">
                                    {row.map((cell: string, cIdx: number) => (
                                      <td key={cIdx} className="px-3 py-2 text-slate-700 dark:text-slate-300 font-medium">{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded text-slate-400 italic text-xs">
                        No structural data matrix tables found in document content.
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Tab 4: RELATIONSHIPS KNOWLEDGE GRAPH & SEMANTIC CHUNKS */}
              {detailsTab === "graph" && (
                <>
                  {/* Knowledge Graph / Relationships Visualization */}
                  <div className="bg-slate-950 text-slate-100 p-4 rounded border border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-[10px] font-mono uppercase text-orange-400 font-bold tracking-wider flex items-center gap-1.5">
                        <Network className="w-3.5 h-3.5 animate-pulse" />
                        Active Relationships Knowledge Graph
                      </h4>
                      <span className="text-[9px] text-slate-500 font-mono">RELIABILITY MAP</span>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded border border-slate-800/80 space-y-3.5 max-h-60 overflow-y-auto">
                      {selectedPipeline?.relationships && selectedPipeline.relationships.length > 0 ? (
                        selectedPipeline.relationships.map((rel: any, rIdx: number) => (
                          <div key={rIdx} className="flex items-center justify-between gap-2 text-xs">
                            {/* Source Node */}
                            <div className="flex-1 min-w-0 bg-slate-800/80 p-2 rounded border border-slate-700 text-center font-mono text-[10px] text-slate-200 truncate">
                              <span className="text-orange-400 mr-1">●</span> {rel.source}
                            </div>
                            
                            {/* Relationship Edge Line with Label */}
                            <div className="flex-1 flex flex-col items-center justify-center min-w-[80px]">
                              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tight text-center leading-none">
                                {rel.type}
                              </span>
                              <div className="w-full flex items-center justify-center mt-1">
                                <div className="h-0.5 bg-slate-700 flex-1 relative">
                                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t border-r border-slate-400 rotate-45 transform"></div>
                                </div>
                              </div>
                            </div>

                            {/* Target Node */}
                            <div className="flex-1 min-w-0 bg-slate-800/80 p-2 rounded border border-slate-700 text-center font-mono text-[10px] text-slate-200 truncate">
                              <span className="text-emerald-400 mr-1">■</span> {rel.target}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-slate-500 font-mono text-[10px]">
                          No network relationships parsed.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Semantic Chunking details */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 font-bold tracking-wider flex items-center gap-1.5">
                        <Binary className="w-3.5 h-3.5 text-orange-500" />
                        AI Ingestion Semantic Chunks ({selectedPipeline?.chunks?.length || 0})
                      </h4>
                      <span className="text-[9px] text-slate-400 font-mono uppercase">
                        Size: {selectedDoc.metadata?.pipelineConfig?.chunkSize || 150}w / Overlap: {selectedDoc.metadata?.pipelineConfig?.chunkOverlap || 30}w
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {selectedPipeline?.chunks && selectedPipeline.chunks.length > 0 ? (
                        selectedPipeline.chunks.map((chunk: any, cIdx: number) => (
                          <div key={chunk.id || cIdx} className="bg-slate-50 dark:bg-slate-900/30 p-3 rounded border border-slate-200/50 dark:border-slate-800/40 space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                              <span className="font-bold text-orange-500">Chunk #{cIdx + 1}</span>
                              <span className="bg-slate-200 dark:bg-slate-800 text-slate-500 px-1.5 rounded">
                                {chunk.text.split(/\s+/).length} words
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-mono leading-relaxed select-all">
                              "{chunk.text}"
                            </p>
                            <div className="flex flex-wrap gap-1 pt-1.5">
                              <span className="text-[9px] font-mono font-bold text-slate-400 self-center mr-1">CHUNKER KEYS:</span>
                              {chunk.keywords && chunk.keywords.map((kw: string, kwIdx: number) => (
                                <span key={kwIdx} className="bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/15 text-orange-600 dark:text-orange-400 font-mono text-[9px] px-1.5 py-0.2 rounded font-medium">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded text-slate-400 italic text-xs">
                          No semantic retrieval chunks ingested.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>
        ) : (
          /* =======================================
             EMPTY STATE VIEWER
             ======================================= */
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 max-w-sm">
            <FileText className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Select an Industrial Knowledge Asset
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 leading-normal">
              Select a procedural standard, blueprint, or manual on the left, or upload a new manual to activate the operations intelligence.
            </p>
            <button
              onClick={() => setIsUploading(true)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Simulate Manual Ingestion
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
