import React from "react";
import { 
  Settings, 
  Database, 
  Users, 
  ShieldCheck, 
  SlidersHorizontal, 
  Sliders, 
  Terminal, 
  Info, 
  CheckCircle, 
  Network 
} from "lucide-react";
import { AVAILABLE_ROLES } from "./Sidebar";
import { RoleType } from "../types";

interface SettingsViewProps {
  activeRole: RoleType;
  isApiConfigured: boolean;
}

export default function SettingsView({
  activeRole,
  isApiConfigured
}: SettingsViewProps) {
  
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-elegant-dark font-sans text-slate-200">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-500 glow-blue-svg" />
          <span>System Parameters & Station Configurations</span>
        </h2>
        <p className="text-slate-500 text-sm">
          Overview of active station profiles, secure environmental variables, and localized database metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Connection Status & API Security Guidelines */}
        <div className="space-y-6">
          
          {/* Connection Status Box */}
          <div className="bg-elegant-card border border-slate-800 p-5 rounded">
            <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Network className="w-4.5 h-4.5 text-blue-400" />
              <span>Unified Asset Brain Handshake Status</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-slate-500 font-mono">DCS REST Telemetry API Gateway</span>
                <span className="text-emerald-500 font-bold font-mono">CONNECTED (200 OK)</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-slate-500 font-mono">Knowledge Base Memory Cache</span>
                <span className="text-slate-300 font-bold font-mono">10.4 MB (Allocated)</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-slate-500 font-mono">Operations Model Engine</span>
                <span className="text-blue-400 font-bold font-mono">GEMINI 2.5 FLASH</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 font-mono">Database Partition Latency</span>
                <span className="text-emerald-500 font-bold font-mono">4.2 ms (Optimal)</span>
              </div>
            </div>
          </div>

          {/* Secure API Key Instruction Card (Strict compliance - NO input forms) */}
          <div className="bg-elegant-card border border-slate-800 p-5 rounded relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full hazard-stripes opacity-15"></div>
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <Database className="w-4.5 h-4.5 text-blue-400" />
              <span>API Credentials & Secure Injection</span>
            </h3>

            <div className="text-xs text-slate-400 leading-relaxed space-y-3">
              <p>
                In alignment with enterprise-grade full-stack security principles, the Google Gemini API key is managed exclusively on the server-side, preventing any leakage to client-side browsers.
              </p>

              <div className="p-3 bg-[#0F1219] border border-slate-800 rounded flex items-start gap-2 text-[11px]">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold block mb-0.5 text-slate-200 animate-pulse">Automatic Injection Enabled</span>
                  <span>Google AI Studio automatically injects your active <span className="font-mono font-semibold">GEMINI_API_KEY</span> into this app's environment at runtime. No manual key inputs are ever requested.</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Model Endpoint Security:</span>
                {isApiConfigured ? (
                  <span className="text-emerald-500 font-mono font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> SECURE HANDSHAKE
                  </span>
                ) : (
                  <span className="text-rose-500 font-mono font-bold">MISSING SECRET KEY</span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Station Roles and Operator Permissions Details */}
        <div className="bg-elegant-card border border-slate-800 p-5 rounded">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-blue-400" />
            <span>Station Authorization Matrices</span>
          </h3>

          <div className="space-y-4">
            {AVAILABLE_ROLES.map((role) => {
              const isActive = role.id === activeRole;
              return (
                <div 
                  key={role.id}
                  className={`p-3.5 rounded border transition-all ${
                    isActive 
                      ? "border-blue-600 bg-blue-600/5" 
                      : "border-slate-800 bg-[#0F1219] text-slate-400"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${isActive ? "text-blue-400 font-bold" : "text-slate-400"}`}>
                        {role.name}
                      </span>
                      {isActive && (
                        <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-mono font-bold uppercase tracking-wider glow-blue">
                          ACTIVE RUNTIME
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-slate-500">{role.badge}</span>
                  </div>

                  <p className="text-[11px] text-slate-400 italic mb-2.5 leading-snug">
                    "{role.description}"
                  </p>

                  {/* Permissions checklist */}
                  <div>
                    <span className="text-[9px] font-mono uppercase text-slate-500 block mb-1">Assigned Station Permissions:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions.map((perm, pIdx) => (
                        <span key={pIdx} className="bg-[#0F1219] border border-slate-850 text-[9px] font-medium text-slate-400 px-1.5 py-0.5 rounded shadow-sm">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
