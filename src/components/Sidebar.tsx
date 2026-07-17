import React from "react";
import { 
  LayoutDashboard, 
  FileText, 
  Cpu, 
  Wrench, 
  ShieldCheck, 
  Lightbulb, 
  Settings, 
  Terminal, 
  Sun, 
  Moon, 
  Users, 
  Wifi, 
  Database,
  Network,
  BarChart2
} from "lucide-react";
import { RoleType, UserRole } from "../types";

// Supported Roles with distinct badges, colors and descriptors
export const AVAILABLE_ROLES: UserRole[] = [
  {
    id: "operator",
    name: "Control Room Operator",
    badge: "OPS-LVL-1",
    description: "Monitors real-time steam, pressure, and gas turbine flow lines.",
    color: "border-orange-500 text-orange-500 dark:text-orange-400 bg-orange-500/10",
    permissions: ["Read SOPs", "Report Incidents", "Create Shift Logs"]
  },
  {
    id: "engineer",
    name: "Reliability Engineer",
    badge: "ENG-STF-3",
    description: "Analyzes failure modes (FMEA), performance spreads, and vibration indices.",
    color: "border-blue-500 text-blue-500 dark:text-blue-400 bg-blue-500/10",
    permissions: ["Full Ingestion", "FMEA Generation", "Edit SOP Drafts", "Root Cause Analysis"]
  },
  {
    id: "safety_inspector",
    name: "EHS Safety Director",
    badge: "EHS-DIR-2",
    description: "Conducts LOTO audits, OSHA compliance checks, and regulatory analysis.",
    color: "border-yellow-500 text-yellow-600 dark:text-yellow-400 bg-yellow-500/10",
    permissions: ["OSHA Audits", "Verify Isolation", "Issue Safety Holds"]
  },
  {
    id: "plant_manager",
    name: "General Plant Manager",
    badge: "PLT-MGR-5",
    description: "Oversees daily downtime indicators, operating costs, and tribal knowledge capture.",
    color: "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    permissions: ["All Permissions", "Override BMS Trips", "Approve SOP Amendments"]
  }
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: RoleType;
  setActiveRole: (role: RoleType) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  isApiConfigured: boolean;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  activeRole,
  setActiveRole,
  theme,
  setTheme,
  isApiConfigured
}: SidebarProps) {
  
  const selectedRole = AVAILABLE_ROLES.find(r => r.id === activeRole) || AVAILABLE_ROLES[0];

  const menuItems = [
    { id: "dashboard", label: "Operations Cockpit", icon: LayoutDashboard, desc: "Operational KPIs & Alert center" },
    { id: "analytics", label: "Executive Analytics", icon: BarChart2, desc: "Document, AI & asset health reports" },
    { id: "documents", label: "Knowledge Assets", icon: FileText, desc: "Ingest and organize documents" },
    { id: "graph", label: "Knowledge Graph", icon: Network, desc: "Semantic asset relationship maps" },
    { id: "copilot", label: "AI Asset Copilot", icon: Cpu, desc: "Chat about blueprints, manuals & SOPs" },
    { id: "maintenance", label: "Reliability & FMEA", icon: Wrench, desc: "Failure modes & maintenance orders" },
    { id: "compliance", label: "EHS Compliance", icon: ShieldCheck, desc: "OSHA & LOTO safety auditing" },
    { id: "lessons", label: "Tribal Knowledge", icon: Lightbulb, desc: "Formalize floor observations" },
    { id: "settings", label: "System Parameters", icon: Settings, desc: "Manage parameters & API keys" }
  ];

  return (
    <aside className="w-80 border-r border-slate-800 bg-elegant-sidebar flex flex-col h-full font-sans text-slate-200">
      {/* Title / Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-elegant-sidebar">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-base shadow-sm glow-blue">
            IN
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white tracking-tight">
              INDUS AI
            </h1>
            <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
              Unified Asset Brain
            </p>
          </div>
        </div>

        {/* Network & Connection Indicators */}
        <div className="flex items-center gap-1.5 bg-[#161B22] border border-slate-800 px-2.5 py-1 rounded-full text-[10px] font-mono text-slate-400">
          <Wifi className="w-3 h-3 text-blue-400 animate-pulse" />
          <span>LIVE</span>
        </div>
      </div>

      {/* Role Switcher - Critical feature of Industrial UI */}
      <div className="p-4 border-b border-slate-800 bg-elegant-sidebar">
        <label className="text-[10px] font-mono uppercase text-slate-500 block mb-2 font-semibold">
          Active Station Operator Profile
        </label>
        <div className="relative">
          <select
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value as RoleType)}
            className="w-full bg-elegant-card border border-slate-800 text-slate-200 rounded px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 appearance-none cursor-pointer"
          >
            {AVAILABLE_ROLES.map((role) => (
              <option key={role.id} value={role.id} className="bg-elegant-card text-slate-200">
                {role.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
            ▼
          </div>
        </div>

        {/* Active Profile Info */}
        <div className="mt-3 p-2.5 rounded bg-elegant-card border border-slate-800 text-[11px]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-slate-500 text-[9px] uppercase">Badge Code</span>
            <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold border ${selectedRole.color}`}>
              {selectedRole.badge}
            </span>
          </div>
          <p className="text-slate-400 italic leading-tight text-xs">
            "{selectedRole.description}"
          </p>
        </div>
      </div>

      {/* Primary Sidebar Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-all relative group ${
                isActive
                  ? "bg-blue-600/10 text-blue-400 border-l-2 border-blue-600 rounded-r rounded-l-none font-semibold"
                  : "text-slate-400 hover:bg-elegant-card hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"}`} />
              <div className="truncate">
                <div className="text-xs leading-none">{item.label}</div>
                <div className="text-[9px] text-slate-500 mt-0.5 leading-none">
                  {item.desc}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer Controls */}
      <div className="p-4 border-t border-slate-800 bg-elegant-sidebar flex flex-col gap-3">
        {/* API Connection Banner */}
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-500 flex items-center gap-1">
            <Database className="w-3.5 h-3.5" />
            <span>GEMINI API:</span>
          </span>
          {isApiConfigured ? (
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>SECURED</span>
            </span>
          ) : (
            <span className="text-rose-500 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <span>NO KEY</span>
            </span>
          )}
        </div>

        {/* Theme & Profile Toggles */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800">
          <div className="text-[10px] text-slate-500 font-mono">
            V1.4.2-LATEST
          </div>
          
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="p-1.5 rounded border border-slate-800 bg-elegant-card hover:bg-slate-800 text-slate-300 transition-colors"
            title={theme === "light" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "light" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
