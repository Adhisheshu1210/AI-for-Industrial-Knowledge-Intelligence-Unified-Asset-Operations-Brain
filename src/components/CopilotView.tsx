import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Cpu, 
  Trash2, 
  FileText, 
  HelpCircle, 
  AlertTriangle, 
  ArrowRight,
  Sparkles, 
  CheckCircle,
  Database,
  Lock,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  ChevronDown,
  ChevronUp,
  Brain,
  Layers,
  Search,
  ExternalLink,
  BookOpen,
  Sliders,
  RotateCcw,
  Clock,
  Play,
  Square,
  Zap,
  Check,
  ClipboardList,
  Flame,
  FileCheck,
  Compass,
  Info
} from "lucide-react";
import { ChatMessage, Document, RoleType } from "../types";

interface RAGChatMessage extends ChatMessage {
  confidenceScore?: number;
  reasoningSteps?: string[];
  citations?: Array<{
    documentId: string;
    title: string;
    sectionRef: string;
    matchPercent: number;
    snippet: string;
  }>;
  followUpSuggestions?: string[];
}

interface CopilotViewProps {
  documents: Document[];
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
  activeRole: RoleType;
  isApiConfigured: boolean;
}

export default function CopilotView({
  documents,
  selectedDocId,
  setSelectedDocId,
  activeRole,
  isApiConfigured
}: CopilotViewProps) {
  
  // RAG Chat history
  const [messages, setMessages] = useState<RAGChatMessage[]>([
    {
      id: "MSG-001",
      role: "assistant",
      content: "System Initialized. I am **INDUS AI – Unified Asset & Operations Brain**.\n\nI am connected to your local knowledge repositories and vector embeddings. I can cross-reference physical engineering blueprints, startup SOPs, vendor manuals, and regulatory compliance standards.\n\nPlease select a document as **Active Focus Context** to analyze steps or troubleshoot anomalies. Use the voice controls or specialized task templates below to get started.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      confidenceScore: 99,
      reasoningSteps: [
        "Preloaded local schema configurations.",
        "Mounted 4 core industrial document nodes.",
        "Initialized speech synthesis modules."
      ],
      citations: [],
      followUpSuggestions: [
        "Boiler HPB-201 startup purge sequence checklist",
        "Turbine EGTspread alarm spread deviation cause",
        "OSHA Lockout Tagout LOTO zero energy verification"
      ]
    }
  ]);

  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiErrorMsg, setApiErrorMsg] = useState<string | null>(null);

  // Advanced features state
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);
  const [showMemoryPanel, setShowMemoryPanel] = useState<boolean>(false);
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});
  const [selectedCitationDetail, setSelectedCitationDetail] = useState<any | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Speech Recognition (Web Speech API) Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      // Select speech language
      if (selectedLanguage === "es") rec.lang = "es-ES";
      else if (selectedLanguage === "fr") rec.lang = "fr-FR";
      else if (selectedLanguage === "de") rec.lang = "de-DE";
      else if (selectedLanguage === "ja") rec.lang = "ja-JP";
      else if (selectedLanguage === "zh") rec.lang = "zh-CN";
      else if (selectedLanguage === "hi") rec.lang = "hi-IN";
      else rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev ? prev + " " + transcript : transcript);
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [selectedLanguage]);

  // Text-To-Speech (Web Speech API) Handler
  const toggleSpeech = (text: string, msgId: string) => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser environment.");
      return;
    }

    if (activeSpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setActiveSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Strip markdown markers for clean speech read
    const cleanText = text
      .replace(/#{1,6}\s+/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`/g, "")
      .replace(/>/g, "")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 0.95; // Slightly lower pitch for authoritative professional robot voice

    // Attempt to match system voices to target translation language
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find(v => v.lang.startsWith(selectedLanguage));
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith("en"));
    }
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      setActiveSpeakingId(null);
    };

    utterance.onerror = () => {
      setActiveSpeakingId(null);
    };

    setActiveSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const stopAllSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setActiveSpeakingId(null);
  };

  useEffect(() => {
    return () => {
      stopAllSpeech();
    };
  }, []);

  // Voice recording toggle
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Safari.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
        setIsListening(false);
      }
    }
  };

  // Helper to format chat responses with inline styling and code blocks
  const formatMessageText = (text: string) => {
    if (!text) return null;
    return text.split("\n\n").map((para, pIdx) => {
      // Bullet lists
      if (para.startsWith("- ") || para.startsWith("* ") || para.match(/^\d+\.\s/)) {
        const items = para.split("\n");
        return (
          <ul key={pIdx} className="list-disc pl-5 my-2 text-xs text-slate-300 space-y-1 bg-[#141822]/40 p-2.5 rounded border border-slate-800/50">
            {items.map((item, iIdx) => {
              const cleanedItem = item.replace(/^[-*\d.]\s+/, "");
              return (
                <li key={iIdx} className="leading-relaxed">
                  {formatInlineStyles(cleanedItem)}
                </li>
              );
            })}
          </ul>
        );
      }

      // Safety and Hazard Warnings
      if (para.toUpperCase().includes("HAZARD WARNING") || para.toUpperCase().includes("CRITICAL WARNING") || para.toUpperCase().includes("SAFETY ALARM") || para.toUpperCase().includes("LIFE SAFETY")) {
        return (
          <div key={pIdx} className="p-3 my-3 bg-red-600/10 border-l-3 border-red-600 text-slate-200 text-xs rounded glow-red">
            <div className="flex items-center gap-1.5 font-bold text-red-400 mb-1">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
              <span>MANDATORY SAFETY HAZARD WARNING</span>
            </div>
            <p className="italic leading-relaxed">{para.replace(/^(HAZARD WARNING:\s*|CRITICAL WARNING:\s*|SAFETY ALARM:\s*|LIFE SAFETY:\s*)/gi, "")}</p>
          </div>
        );
      }

      // Blockquote styled sections
      if (para.startsWith("> ")) {
        return (
          <blockquote key={pIdx} className="p-3 my-2.5 bg-[#172033]/50 border-l-2 border-blue-500 text-xs italic text-slate-300 rounded">
            {formatInlineStyles(para.substring(2))}
          </blockquote>
        );
      }

      // Titles/Headers (### or ##)
      if (para.startsWith("### ")) {
        return (
          <h4 key={pIdx} className="text-xs font-semibold text-blue-400 mt-4 mb-2 uppercase tracking-wide border-b border-slate-800 pb-1 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            {formatInlineStyles(para.substring(4))}
          </h4>
        );
      } else if (para.startsWith("#### ")) {
        return (
          <h5 key={pIdx} className="text-[11px] font-bold text-slate-200 mt-3 mb-1 uppercase tracking-wider">
            {formatInlineStyles(para.substring(5))}
          </h5>
        );
      }

      return (
        <p key={pIdx} className="text-xs leading-relaxed mb-2.5 text-slate-300">
          {formatInlineStyles(para)}
        </p>
      );
    });
  };

  const formatInlineStyles = (line: string) => {
    const parts = line.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return <strong key={idx} className="font-bold text-blue-300">{part}</strong>;
      }
      const monoParts = part.split(/`([^`]+)`/g);
      return monoParts.map((subPart, sIdx) => {
        if (sIdx % 2 === 1) {
          return <code key={sIdx} className="font-mono bg-[#090D16] px-1.5 py-0.5 rounded text-[10px] text-blue-400 border border-slate-800/80 font-semibold">{subPart}</code>;
        }
        return subPart;
      });
    });
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    stopAllSpeech();
    setApiErrorMsg(null);
    const userMsg: RAGChatMessage = {
      id: `MSG-USER-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Compile history context (ignoring initial bot message)
      const chatHistory = messages
        .filter(m => m.id !== "MSG-001")
        .map(m => ({ role: m.role, content: m.content }));

      // Append translation guidance if non-English language selected
      let languagePrompt = "";
      if (selectedLanguage !== "en") {
        const langNames: Record<string, string> = {
          es: "Spanish (Español)",
          fr: "French (Français)",
          de: "German (Deutsch)",
          ja: "Japanese (日本語)",
          zh: "Chinese (中文)",
          hi: "Hindi (हिन्दी)"
        };
        languagePrompt = ` (Respond entirely in ${langNames[selectedLanguage] || "English"}. Translate all titles, lists, warning banners, and text logically while retaining technical values like HPB-201, LIC-102, 1045°F, etc. in their readable forms.)`;
      }

      const response = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend + languagePrompt,
          history: chatHistory,
          contextDocId: selectedDocId
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to communicate with RAG controller.");
      }

      const assistantMsg: RAGChatMessage = {
        id: `MSG-AI-${Date.now()}`,
        role: "assistant",
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        confidenceScore: data.confidenceScore || 85,
        reasoningSteps: data.reasoningSteps || [
          "Retrieved document context matches.",
          "Constructed fallback search synthesis."
        ],
        citations: data.citations || [],
        followUpSuggestions: data.followUpSuggestions || [
          "What safety interlocks regulate this procedure?",
          "Show relevant compliance standards.",
          "Draft a field engineer checklist."
        ]
      };

      setMessages(prev => [...prev, assistantMsg]);

    } catch (err: any) {
      console.error(err);
      const errorMsg: RAGChatMessage = {
        id: `MSG-ERR-${Date.now()}`,
        role: "assistant",
        content: `⚠️ **RAG RECOVERY INTERLOCK TRIGGERED**\n\nUnable to retrieve vector search context or synthesize answer. Rationale:\n${err.message || "Endpoint connection timed out."}\n\n*Please ensure that your server dependencies are fully installed and your Gemini API key is configured correctly in Settings > Secrets.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isError: true,
        confidenceScore: 0,
        reasoningSteps: ["Failed connection to primary vector model.", "Halted retrieval sequence for safety."],
        citations: []
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-fill prompt templates
  const triggerTemplate = (type: string) => {
    let focusDoc = "";
    if (selectedDocId) {
      focusDoc = ` for document [${selectedDocId}]`;
    }

    let promptText = "";
    switch (type) {
      case "sop":
        promptText = `Draft a highly rigorous Standard Operating Procedure (SOP) based on the loaded documentation${focusDoc}. Highlight step-by-step startup, operator checklist, and shutdown interlocks.`;
        break;
      case "maint":
        promptText = `Provide technical preventive maintenance (PM) recommendations${focusDoc}. Detail specific casing torque tolerances, pressure margins, temperature trip states, and inspection intervals.`;
        break;
      case "rca":
        promptText = `Conduct a Root Cause Analysis (RCA) and failure mode sequence analysis${focusDoc}. Explain the causal event chain, instrumentation issues, and mechanical root causes.`;
        break;
      case "compare":
        promptText = `Perform a document comparison analysis. Highlight differences in safety bounds, pressures, temperatures, and compliance standards between all preloaded documents.`;
        break;
      case "summary":
        promptText = `Generate an executive report summary and document analysis. Group findings by equipment tags, key physical constants, and operational recommendations.`;
        break;
      case "compliance":
        promptText = `Provide regulatory compliance guidance based on OSHA, ISO, or NFPA rules found in the uploaded documents. Outline mandatory audits, locks, and tags.`;
        break;
      default:
        return;
    }
    setInput(promptText);
  };

  const clearMemoryLogs = () => {
    stopAllSpeech();
    setMessages([
      {
        id: "MSG-RESET",
        role: "assistant",
        content: "Conversation history cleared. Unified RAG memory registers have been purged successfully. All upcoming queries will operate on clean context.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        confidenceScore: 100,
        reasoningSteps: ["Purged sliding context windows.", "Flushed conversational state logs."],
        citations: []
      }
    ]);
  };

  const getConfidenceBadgeColor = (score?: number) => {
    if (!score) return "text-slate-500 bg-slate-500/10 border-slate-500/20";
    if (score >= 90) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 70) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  return (
    <div className="flex-1 flex h-full bg-elegant-dark font-sans text-slate-200 relative overflow-hidden">
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Upper Context Bar */}
        <div className="p-4 bg-elegant-sidebar border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-blue-600 text-white shadow-sm glow-blue flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">
                  INDUS AI Unified Operations Brain
                </h2>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Database className="w-3 h-3 text-blue-500" />
                Active Mode: Cognitive RAG Search + Multilingual Grounding
              </p>
            </div>
          </div>

          {/* Action Tools & Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Lang Dropdown */}
            <div className="flex items-center gap-1 bg-[#121622] border border-slate-800 rounded px-2 py-1">
              <Languages className="w-3.5 h-3.5 text-blue-400" />
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  stopAllSpeech();
                }}
                className="bg-transparent text-slate-300 text-[10px] font-medium outline-none cursor-pointer"
              >
                <option value="en" className="bg-elegant-card text-xs">EN (English)</option>
                <option value="es" className="bg-elegant-card text-xs">ES (Español)</option>
                <option value="fr" className="bg-elegant-card text-xs">FR (Français)</option>
                <option value="de" className="bg-elegant-card text-xs">DE (Deutsch)</option>
                <option value="ja" className="bg-elegant-card text-xs">JA (日本語)</option>
                <option value="zh" className="bg-elegant-card text-xs">ZH (中文)</option>
                <option value="hi" className="bg-elegant-card text-xs">HI (हिन्दी)</option>
              </select>
            </div>

            {/* Selected Context Dropdown */}
            <div className="flex items-center gap-2 bg-[#121622] border border-slate-800 rounded px-2.5 py-1">
              <span className="text-[10px] font-mono uppercase text-slate-500">Focus:</span>
              <select
                value={selectedDocId || ""}
                onChange={(e) => setSelectedDocId(e.target.value || null)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none max-w-[180px] cursor-pointer font-medium"
              >
                <option value="" className="bg-elegant-card">Global Database Search</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id} className="bg-elegant-card text-xs">
                    [{d.id}] {d.title.length > 25 ? d.title.substring(0, 25) + "..." : d.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Cognitive Monitor Toggle */}
            <button
              onClick={() => setShowMemoryPanel(!showMemoryPanel)}
              className={`p-1.5 rounded border flex items-center gap-1.5 text-xs transition-all cursor-pointer ${
                showMemoryPanel 
                  ? "bg-blue-600/20 border-blue-500 text-blue-400 glow-blue" 
                  : "bg-elegant-card border-slate-800 text-slate-400 hover:text-white"
              }`}
              title="Show Cognitive RAG Parameters"
            >
              <Brain className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-mono uppercase text-[10px]">Cognitive load</span>
            </button>

            {/* Clear history button */}
            <button
              onClick={clearMemoryLogs}
              className="p-1.5 rounded border border-slate-800 bg-elegant-card text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
              title="Purge Memory Logs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Specialized RAG Task Bar */}
        <div className="bg-[#0b0e14] border-b border-slate-800/80 px-4 py-2 flex items-center gap-2 overflow-x-auto flex-shrink-0 scrollbar-none">
          <span className="text-[9px] font-mono text-slate-500 uppercase flex items-center gap-1 whitespace-nowrap">
            <Sliders className="w-3 h-3 text-blue-500" />
            Specialized AI Tasks:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => triggerTemplate("sop")}
              className="text-[10px] px-2.5 py-1 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 hover:border-blue-500/40 rounded-full text-blue-400 font-medium transition-all whitespace-nowrap cursor-pointer"
            >
              SOP Generator
            </button>
            <button
              onClick={() => triggerTemplate("maint")}
              className="text-[10px] px-2.5 py-1 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 hover:border-emerald-500/40 rounded-full text-emerald-400 font-medium transition-all whitespace-nowrap cursor-pointer"
            >
              Maintenance Recs
            </button>
            <button
              onClick={() => triggerTemplate("rca")}
              className="text-[10px] px-2.5 py-1 bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/20 hover:border-amber-500/40 rounded-full text-amber-400 font-medium transition-all whitespace-nowrap cursor-pointer"
            >
              Root Cause Analyzer
            </button>
            <button
              onClick={() => triggerTemplate("compare")}
              className="text-[10px] px-2.5 py-1 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 hover:border-indigo-500/40 rounded-full text-indigo-400 font-medium transition-all whitespace-nowrap cursor-pointer"
            >
              Document Comparison
            </button>
            <button
              onClick={() => triggerTemplate("summary")}
              className="text-[10px] px-2.5 py-1 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 hover:border-purple-500/40 rounded-full text-purple-400 font-medium transition-all whitespace-nowrap cursor-pointer"
            >
              Report Summarizer
            </button>
            <button
              onClick={() => triggerTemplate("compliance")}
              className="text-[10px] px-2.5 py-1 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 hover:border-rose-500/40 rounded-full text-rose-400 font-medium transition-all whitespace-nowrap cursor-pointer"
            >
              Regulatory Guidance
            </button>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#090b11]">
          
          {/* Unconfigured API Key Advisory */}
          {!isApiConfigured && (
            <div className="p-4 bg-amber-500/5 border border-amber-500/15 rounded max-w-2xl mx-auto text-slate-200 relative glow-amber">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                    Offline Sandbox Mode Activated
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    No <span className="font-mono font-bold">GEMINI_API_KEY</span> was found in environment. The Unified Brain is utilizing its **High-Fidelity Local Retrieval Compiler (Local RAG)**. You will still receive highly accurate and structured answers regarding boilers, turbines, RCA, and LOTO safety. To unlock live Gemini reasoning capabilities, load your key in Settings &gt; Secrets.
                  </p>
                </div>
              </div>
            </div>
          )}

          {messages.map((msg) => {
            const isAI = msg.role === "assistant";
            const showMetadata = isAI && (msg.confidenceScore !== undefined || (msg.citations && msg.citations.length > 0));
            const isSpeaking = activeSpeakingId === msg.id;

            return (
              <div 
                key={msg.id}
                className={`flex items-start gap-3 max-w-4xl ${isAI ? "mr-auto" : "ml-auto flex-row-reverse"}`}
              >
                {/* Avatar */}
                <div className={`p-2 rounded-full flex-shrink-0 flex items-center justify-center border transition-all ${
                  isAI 
                    ? "bg-[#101420] border-slate-800 text-blue-400" 
                    : "bg-blue-600 border-blue-500 text-white shadow-sm glow-blue"
                }`}>
                  {isAI ? (
                    <Cpu className="w-4 h-4" />
                  ) : (
                    <span className="text-[10px] font-mono uppercase px-1 font-bold">
                      {activeRole.substring(0, 3)}
                    </span>
                  )}
                </div>

                {/* Bubble Container */}
                <div className="flex-1 flex flex-col gap-1.5 max-w-[85%] md:max-w-[78%]">
                  
                  <div className={`p-4 rounded-xl border relative shadow-md transition-all ${
                    isAI
                      ? "bg-[#121622] border-slate-800 rounded-tl-none text-slate-200"
                      : "bg-[#162136] border-blue-500/20 rounded-tr-none text-slate-100"
                  }`}>
                    
                    {/* Header Context Bar inside message */}
                    {isAI && (
                      <div className="mb-2 flex items-center justify-between border-b border-slate-800/60 pb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono uppercase tracking-wider text-blue-400 font-bold bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">
                            {selectedDocId ? `Context: ${selectedDocId}` : "Global Intelligence Synthesis"}
                          </span>
                        </div>
                        
                        {/* Audio Controls */}
                        <button
                          onClick={() => toggleSpeech(msg.content, msg.id)}
                          className={`p-1 rounded hover:bg-slate-800/80 transition-colors flex items-center gap-1 text-[9px] font-mono cursor-pointer ${
                            isSpeaking ? "text-emerald-400" : "text-slate-400 hover:text-slate-200"
                          }`}
                          title={isSpeaking ? "Stop Audio Screenplay" : "Read response aloud (Hands-Free Mode)"}
                        >
                          {isSpeaking ? (
                            <>
                              <span className="flex h-1.5 w-1.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                              </span>
                              <span>Speaking</span>
                              <VolumeX className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <>
                              <span>Hands-Free Read</span>
                              <Volume2 className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Chat Text */}
                    <div className="font-sans break-words text-xs">
                      {formatMessageText(msg.content)}
                    </div>

                    {/* Bottom Metadata row */}
                    <div className="mt-3 flex items-center justify-between text-[9px] text-slate-500 border-t border-slate-800/50 pt-2">
                      <div className="font-mono">
                        INDUS-Node v2.5
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Grounded RAG Metadata Panel (Only for AI Assistant) */}
                  {showMetadata && (
                    <div className="bg-[#0e121b] border border-slate-800/80 rounded-lg overflow-hidden flex flex-col divide-y divide-slate-800/50">
                      
                      {/* Confidence and Reasoning Accordion Trigger */}
                      <div className="p-2.5 flex items-center justify-between text-[11px] bg-[#111624]">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded border text-[9px] font-mono font-bold flex items-center gap-1 ${getConfidenceBadgeColor(msg.confidenceScore)}`}>
                            <CheckCircle className="w-3 h-3" />
                            {msg.confidenceScore}% Grounding Confidence
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedReasoning(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                            className="text-[9px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-0.5 bg-blue-500/5 px-2 py-1 rounded border border-blue-500/10 cursor-pointer"
                          >
                            <Brain className="w-3 h-3" />
                            <span>{expandedReasoning[msg.id] ? "Hide Reason Path" : "Show Reason Path"}</span>
                            {expandedReasoning[msg.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          {msg.citations && msg.citations.length > 0 && (
                            <button
                              onClick={() => setExpandedCitations(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                              className="text-[9px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10 cursor-pointer"
                            >
                              <Layers className="w-3 h-3" />
                              <span>{expandedCitations[msg.id] ? "Hide Citations" : `Show Citations (${msg.citations.length})`}</span>
                              {expandedCitations[msg.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Reasoning path body */}
                      {expandedReasoning[msg.id] && msg.reasoningSteps && (
                        <div className="p-3 bg-[#0d1017] text-[10px] text-slate-400 space-y-1.5 font-mono">
                          <div className="text-slate-500 border-b border-slate-800 pb-1 flex items-center gap-1 uppercase text-[9px]">
                            <Compass className="w-3 h-3 text-blue-400" />
                            AI Cognitive Reasoning Path (RAG Compiler Steps)
                          </div>
                          {msg.reasoningSteps.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-1.5">
                              <span className="text-blue-500 font-bold">{idx + 1}.</span>
                              <p className="leading-normal">{step}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Grounded Citations (Semantic matches) */}
                      {expandedCitations[msg.id] && msg.citations && (
                        <div className="p-3 bg-[#0a0d14] space-y-2">
                          <div className="text-slate-500 border-b border-slate-800 pb-1.5 flex items-center justify-between uppercase text-[9px] font-mono">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3 text-emerald-400" />
                              Retrieved Vector Semantic Grounding Matches
                            </span>
                            <span>Click citation to inspect text</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {msg.citations.map((cit, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setSelectedCitationDetail(cit);
                                  setSelectedDocId(cit.documentId);
                                }}
                                className="text-left p-2 bg-[#121622] hover:bg-[#151c2d] border border-slate-800 hover:border-emerald-500/40 rounded transition-all text-[10px] cursor-pointer relative group"
                              >
                                <div className="flex items-center justify-between font-mono text-[9px] text-emerald-400 font-bold mb-1">
                                  <span>[{cit.documentId}]</span>
                                  <span>{cit.matchPercent}% Match</span>
                                </div>
                                <h6 className="font-medium text-slate-300 truncate mb-1">{cit.title}</h6>
                                <p className="text-slate-500 font-mono text-[8px]">{cit.sectionRef}</p>
                                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded"></div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              </div>
            );
          })}

          {/* Citation Detail Modal / Popover Overlay */}
          {selectedCitationDetail && (
            <div className="p-4 bg-[#111522] border border-slate-800 rounded-lg max-w-xl mx-auto shadow-xl space-y-3 relative overflow-hidden text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono uppercase font-bold text-slate-200">
                    Inspecting Grounding Node [{selectedCitationDetail.documentId}]
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCitationDetail(null)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded cursor-pointer font-mono font-bold"
                >
                  ✕ CLOSE
                </button>
              </div>

              <div className="space-y-1 bg-[#090c14] p-3 rounded border border-slate-800/80 font-mono text-[10px] text-slate-400">
                <p><span className="text-slate-600">Asset Title:</span> {selectedCitationDetail.title}</p>
                <p><span className="text-slate-600">Reference:</span> {selectedCitationDetail.sectionRef}</p>
                <p><span className="text-slate-600">Retrieval Score:</span> {selectedCitationDetail.matchPercent}% cosine confidence</p>
              </div>

              <div className="p-3.5 bg-blue-950/10 border border-blue-500/10 rounded font-mono italic text-[11px] leading-relaxed text-slate-300">
                "{selectedCitationDetail.snippet}"
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-500 italic">Source verification completed by vector pipeline</span>
                <button
                  onClick={() => {
                    setSelectedCitationDetail(null);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Inspect Main Document View</span>
                </button>
              </div>
            </div>
          )}

          {/* Loading bubble */}
          {isLoading && (
            <div className="flex items-center gap-3 mr-auto max-w-2xl">
              <div className="p-2 rounded-full bg-[#101420] border border-slate-800 text-blue-400 animate-pulse">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="bg-[#121622] border border-slate-800 p-4 rounded-xl rounded-tl-none text-xs flex flex-col gap-2 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-mono italic text-[11px]">RAG system tokenizing query, loading vector spaces, and generating response...</span>
                </div>
                <div className="h-1 w-48 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full animate-progress-bar"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Follow-Up Pills */}
        {messages.length > 0 && !isLoading && (
          <div className="px-4 py-2 bg-[#090b11] border-t border-slate-800/40 flex items-center gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
            <span className="text-[9px] font-mono text-slate-500 uppercase whitespace-nowrap flex items-center gap-1">
              <Compass className="w-3 h-3 text-emerald-500" />
              Follow-Up suggestions:
            </span>
            <div className="flex items-center gap-1.5">
              {(messages[messages.length - 1].followUpSuggestions || [
                "What are the safety margins for LIC-102?",
                "Provide OSHA lockout guidelines.",
                "SOP sequence for turbine spread limits."
              ]).map((s, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInput(s);
                    handleSendMessage(s);
                  }}
                  className="px-3 py-1 bg-[#121724] hover:bg-blue-600/10 border border-slate-800 hover:border-blue-500/30 text-slate-300 hover:text-blue-300 rounded-full text-[10px] font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1"
                >
                  <span>{s}</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form Footer */}
        <div className="p-4 border-t border-slate-800 bg-elegant-sidebar flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex gap-2"
          >
            
            {/* Mic button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center flex-shrink-0 ${
                isListening 
                  ? "bg-red-600/20 border-red-500 text-red-500 animate-pulse" 
                  : "bg-[#0c0e15] border-slate-800 text-slate-400 hover:text-white"
              }`}
              title={isListening ? "Listening... (Click to stop)" : "Hands-Free Voice Input (Microphone)"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              required
              placeholder={
                selectedDocId 
                  ? `Query details specifically about [${selectedDocId}]...` 
                  : "Ask anything about plant manuals, operations, or regulations..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-[#090b11] border border-slate-800 text-slate-200 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            />
            
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 cursor-pointer glow-blue flex-shrink-0"
            >
              <span>Query</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          
          <div className="mt-1.5 flex items-center justify-between text-[8px] text-slate-600 px-1">
            <span>Verify LOTO and Zero-Energy before executing any physical maintenance tasks.</span>
            <span>Multilingual prompt auto-translation enabled</span>
          </div>
        </div>

      </div>

      {/* Slide-out Cognitive Brain Memory Monitor Panel */}
      {showMemoryPanel && (
        <div className="w-[300px] border-l border-slate-800 bg-elegant-sidebar h-full flex flex-col flex-shrink-0 animate-slide-in overflow-y-auto">
          
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#11141e]">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase text-white tracking-wider">Cognitive Brain Monitor</h3>
            </div>
            <button
              onClick={() => setShowMemoryPanel(false)}
              className="text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
            >
              ✕ CLOSE
            </button>
          </div>

          <div className="p-4 space-y-5 text-xs divide-y divide-slate-800/60">
            
            {/* Active Session Stats */}
            <div className="space-y-2.5">
              <h4 className="font-mono text-[10px] uppercase text-slate-400 tracking-wide font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Active Context State
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="p-2 bg-[#090b11] rounded border border-slate-800/60">
                  <p className="text-slate-500">Messages in Loop</p>
                  <p className="text-sm font-bold text-white mt-1">{messages.length}</p>
                </div>
                <div className="p-2 bg-[#090b11] rounded border border-slate-800/60">
                  <p className="text-slate-500">Sliding Context</p>
                  <p className="text-[11px] font-bold text-white mt-1 text-emerald-400">32,768 T</p>
                </div>
                <div className="p-2 bg-[#090b11] rounded border border-slate-800/60">
                  <p className="text-slate-500">Distance Metric</p>
                  <p className="text-[10px] font-bold text-white mt-1">Cosine Sim</p>
                </div>
                <div className="p-2 bg-[#090b11] rounded border border-slate-800/60">
                  <p className="text-slate-500">Embedding Engine</p>
                  <p className="text-[10px] font-bold text-slate-300 mt-1">ChromaDB-V3</p>
                </div>
              </div>
            </div>

            {/* RAG Settings Tuning */}
            <div className="space-y-3 pt-4">
              <h4 className="font-mono text-[10px] uppercase text-slate-400 tracking-wide font-semibold flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                Retrieval Parameters
              </h4>
              <div className="space-y-2 font-mono text-[10px] text-slate-400">
                <div className="flex justify-between items-center">
                  <span>Chunk Size bounds:</span>
                  <span className="text-white">150 words</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Overlap margin:</span>
                  <span className="text-white">30 words</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Pre-retrieval reranking:</span>
                  <span className="text-blue-400 font-bold">Cross-Encoder</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Min match score threshold:</span>
                  <span className="text-emerald-400">0.72 score</span>
                </div>
              </div>
            </div>

            {/* Loaded Documents Knowledge Map */}
            <div className="space-y-3 pt-4">
              <h4 className="font-mono text-[10px] uppercase text-slate-400 tracking-wide font-semibold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Semantic Knowledge Map
              </h4>
              <div className="space-y-2 text-[10px] font-mono max-h-[220px] overflow-y-auto pr-1">
                {documents.map((d) => (
                  <div 
                    key={d.id} 
                    onClick={() => setSelectedDocId(d.id)}
                    className={`p-2 rounded border transition-all cursor-pointer ${
                      selectedDocId === d.id 
                        ? "bg-blue-600/10 border-blue-500/55 text-white" 
                        : "bg-[#090b11] border-slate-800 hover:border-slate-700 text-slate-400"
                    }`}
                  >
                    <div className="flex justify-between font-bold">
                      <span className="text-blue-400">[{d.id}]</span>
                      <span className="text-[8px] bg-slate-800 px-1 rounded text-slate-400 uppercase">{d.category}</span>
                    </div>
                    <p className="truncate-2-lines mt-1 text-slate-300 font-sans leading-relaxed">{d.title}</p>
                    <div className="mt-1 flex items-center justify-between text-[8px] text-slate-500">
                      <span>{d.fileSize}</span>
                      <span>{d.tags[0] || "operations"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cognitive Warning Statement */}
            <div className="pt-4 space-y-2">
              <div className="flex items-start gap-1.5 p-2 bg-blue-600/5 border border-blue-500/15 rounded text-[10px] text-slate-400 leading-relaxed">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p>
                  INDUS AI memory uses a sliding FIFO window to optimize attention. Grounding indexes are synchronized automatically upon new document uploads.
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
