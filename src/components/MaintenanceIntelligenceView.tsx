import React, { useState, useEffect } from "react";
import { 
  Wrench, 
  Cpu, 
  AlertTriangle, 
  Plus, 
  ShieldCheck, 
  Activity, 
  Sliders, 
  SlidersHorizontal, 
  Settings2, 
  CheckCircle, 
  Play, 
  ClipboardList,
  Flame,
  Calendar as CalendarIcon,
  RefreshCw,
  Package,
  TrendingUp,
  X,
  Gauge,
  Clock,
  DollarSign,
  Info,
  Layers,
  Sparkles,
  Search,
  Bell
} from "lucide-react";
import { FmeaData, RoleType, WorkOrder } from "../types";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  ReferenceLine,
  AreaChart,
  Area
} from "recharts";

interface MaintenanceIntelligenceViewProps {
  workOrders: WorkOrder[];
  onAddWorkOrder: (wo: { assetId: string; title: string; description: string; priority: any; assignedTo: string }) => void;
  activeRole: RoleType;
  isApiConfigured: boolean;
}

// Custom mock databases for the integrated feeds
const assetMeta = {
  "HPB-201": {
    name: "High-Pressure Utility Boiler",
    class: "Steam Generation Static Asset",
    desc: "Provides superheated steam for major turbine rotor drive circuits.",
    oemSpecs: "Design Pressure: 650 psi. Thermal tolerance: 480°C. OEM Manual: MAN-HPB-201-REV4.",
    operatingSop: "SOP-HPB-702: Mandatory purge cycle of 300 seconds pre-ignition. Keep drum water level (LIC-102) strictly within 35% to 65% bounds."
  },
  "SGT-900": {
    name: "Exhaust Combustion Gas Turbine",
    class: "Heavy Industrial Rotating Equipment",
    desc: "18-burner circular exhaust gas thermal turbine generating primary grid electricity.",
    oemSpecs: "Rated Power output: 45MW. Nom. rotation: 3600 RPM. Max EGT: 1045°F.",
    operatingSop: "SOP-SGT-012: Track EGT thermocouples TC-01 through TC-18. If spread deviates >150°F, trip fuel shuts automatically."
  },
  "P-201B": {
    name: "Feedwater Centrifugal Pump B",
    class: "High-Pressure Fluid Propulsion Unit",
    desc: "Multistage high-speed centrifugal flow feedwater pump supplying primary boiler drum loops.",
    oemSpecs: "Design Flow Rate: 120 gpm. Max vibration tolerance: 2.5 mm/s RMS.",
    operatingSop: "SOP-P-201: Never run pump deadheaded. Verify minimum-flow recycle bypass valve is operational (minimum 40 gpm threshold)."
  },
  "D-201": {
    name: "Thermal Deaerator Vessel",
    class: "Pressure Scavenging Gas Stripper",
    desc: "Removes dissolved non-condensable oxygen and gases from boiler feedwater circuit.",
    oemSpecs: "Operating Pressure: 15-22 psi. Hydrazine dosing scavenger target: <7 ppb dissolved O2.",
    operatingSop: "SOP-D-201: Perform mechanical valve stroke safety check weekly on primary nitrogen blanket valve."
  }
};

// Simulated historical work order logs
const historicalWorkOrders = {
  "HPB-201": [
    { id: "WO-2026-081", title: "Economizer wall-thickness UT audit", date: "2026-03-12", type: "Preventative", result: "Localized wear detected in lower bend; wall-thickness at 8.2mm (limit 6.0mm)." },
    { id: "WO-225-104", title: "Soot blower sequence valve repair", date: "2025-11-04", type: "Corrective", result: "Replaced faulty pneumatic solenoid coil on automatic purge bank." }
  ],
  "SGT-900": [
    { id: "WO-2026-015", title: "Thermocouple TC-12 replacement", date: "2026-01-22", type: "Corrective", result: "TC-12 reported drifting calibration; replaced with certified Type K high-temp sensor." },
    { id: "WO-2025-998", title: "First-stage compressor borescope sweep", date: "2025-08-15", type: "Preventative", result: "No micro-cracking or erosion observed. Minor coking on nozzle ring cleaned." }
  ],
  "P-201B": [
    { id: "WO-2026-042", title: "Bearing P-201B seal replacement", date: "2026-04-12", type: "Emergency", result: "Post-cavitation overhaul: replaced drive-end journal bearing and duplex seals." },
    { id: "WO-2025-341", title: "Alignment check and laser coupling sync", date: "2025-09-02", type: "Preventative", result: "Radial misalignment corrected within 0.02 mils. Vibration dropped to 0.9 mm/s." }
  ],
  "D-201": [
    { id: "WO-2025-112", title: "Hydrazine dosing pump valve service", date: "2025-10-10", type: "Preventative", result: "Replaced seals on chemical injection pump to stabilize dissolved oxygen scavenger supply." }
  ]
};

// Historical failure logs
const historicalFailures = {
  "HPB-201": [
    { date: "2024-06-12", cause: "Acid dewpoint condensation due to fuel sulfur spike", impact: "Boiler full shutdown for 48 hrs", cost: "$55,000" }
  ],
  "SGT-900": [
    { date: "2025-02-19", cause: "Compressor blade tip shroud fracturing", impact: "Immediate grid trip, 72 hrs emergency downtime", cost: "$240,000" }
  ],
  "P-201B": [
    { date: "2026-04-12", cause: "Cavitation under zero-flow suction lockout", impact: "Shaft deflection, bearing seizure, 18 hrs repair shutdown", cost: "$18,500" }
  ],
  "D-201": [
    { date: "2023-11-02", cause: "Venting valve scaling choke", impact: "Overpressure trip, safety hazard alarm, 8 hrs bypass", cost: "$8,000" }
  ]
};

// Preset spare parts databases
const sparePartsInventory = {
  "HPB-201": [
    { name: "Economizer Replacement Coil Bend", partNo: "HPB-COIL-99X", stock: 1, cost: 9500, lead: 4 },
    { name: "High-Temp Flue Thermocouple Node", partNo: "TC-HPB-04", stock: 6, cost: 350, lead: 1 },
    { name: "Synthetic Gasket Sealing Kit", partNo: "HPB-GASK-20", stock: 12, cost: 450, lead: 1 }
  ],
  "SGT-900": [
    { name: "Exhaust Thermocouple circular array", partNo: "GT-TC-ARRAY", stock: 0, cost: 2800, lead: 12 },
    { name: "Stage 1 Fuel Injection Nozzle", partNo: "GT-NZL-S1", stock: 2, cost: 8500, lead: 5 },
    { name: "Synthetic Bearing Lube Lubricant", partNo: "GT-LUBE-MOBIL", stock: 20, cost: 120, lead: 1 }
  ],
  "P-201B": [
    { name: "Heavy-Duty Multistage Impeller Ring", partNo: "P-IMP-201", stock: 2, cost: 4800, lead: 3 },
    { name: "Duplex Mechanical Shaft Gasket Seal", partNo: "P-SEAL-201B", stock: 5, cost: 950, lead: 1 },
    { name: "Self-Aligning Journal Bearing Sleeve", partNo: "P-BRG-402", stock: 3, cost: 1200, lead: 1 }
  ],
  "D-201": [
    { name: "Deaerator Valve Replacement Diaphragm", partNo: "D-DIAPH-VAL", stock: 1, cost: 3400, lead: 6 },
    { name: "Calibrated Pressure Safety Valve (15 psi)", partNo: "D-PSV-104", stock: 2, cost: 1900, lead: 1 }
  ]
};

// Initial pre-calculated predictions for nominal states
const initialPredictions = {
  "HPB-201": {
    rulEstimationDays: 78,
    riskScore: 24,
    priority: "LOW" as const,
    downtimePredictionHours: 8,
    maintenanceCostEstimation: 1800,
    aiSuggestions: [
      "Verify daily automatic soot blower run cycle completes.",
      "Schedule ultrasonic wall-thickness audit for next seasonal outage.",
      "Check flue gas oxygen percentages to verify burner optimization."
    ],
    sparePartRecommendations: [
      { name: "Gauge Glass Replacement Tube", partNo: "HPB-GLASS-12", stockStatus: "In Stock", estCost: 120, leadTimeDays: 1 }
    ],
    anomalyAnalysis: "Thermal and pressure boundaries stable. Economizer sulfur acid condensation risk is currently negligible.",
    confidence: 94
  },
  "SGT-900": {
    rulEstimationDays: 125,
    riskScore: 15,
    priority: "LOW" as const,
    downtimePredictionHours: 24,
    maintenanceCostEstimation: 5000,
    aiSuggestions: [
      "Review lube oil filtration pressure differential to inspect for micro-particles.",
      "Ensure thermocouple array TC-01 to TC-18 readings stay within 45°F spread bounds.",
      "Schedule standard air barrier filter changeout in 30 days."
    ],
    sparePartRecommendations: [
      { name: "Inlet Air Barrier Pre-Filter", partNo: "GT-FILT-IN", stockStatus: "In Stock", estCost: 850, leadTimeDays: 2 }
    ],
    anomalyAnalysis: "EGT profiles match safe baselines. Vibrations reflect standard mechanical rotation.",
    confidence: 96
  },
  "P-201B": {
    rulEstimationDays: 45,
    riskScore: 32,
    priority: "MEDIUM" as const,
    downtimePredictionHours: 6,
    maintenanceCostEstimation: 1400,
    aiSuggestions: [
      "Log radial shaft vibration levels once per operational shift.",
      "Verify gland packing bolt tension matches target torque tolerances.",
      "Confirm mechanical seal cooling fluid flow rate is continuous."
    ],
    sparePartRecommendations: [
      { name: "Teflon Gland Packing Ring Set", partNo: "P-PACK-TEF", stockStatus: "In Stock", estCost: 180, leadTimeDays: 1 }
    ],
    anomalyAnalysis: "Flow margins nominal. Slight pressure deviation logged during fluid cycle, vibration remains within acceptable 1.1 mm/s threshold.",
    confidence: 90
  },
  "D-201": {
    rulEstimationDays: 180,
    riskScore: 12,
    priority: "LOW" as const,
    downtimePredictionHours: 12,
    maintenanceCostEstimation: 1200,
    aiSuggestions: [
      "Verify mechanical valve stroke check weekly on primary nitrogen blanket valve.",
      "Sample scavenger chemical feeds to ensure feed concentration holds dissolved O2 below 7 ppb limit."
    ],
    sparePartRecommendations: [
      { name: "Dissolved Oxygen Sensor Replacement Cartridge", partNo: "D-O2-SENS", stockStatus: "In Stock", estCost: 350, leadTimeDays: 1 }
    ],
    anomalyAnalysis: "Vacuum stripping boundaries completely nominal. No non-condensable gas lock issues detected.",
    confidence: 95
  }
};

export default function MaintenanceIntelligenceView({
  workOrders,
  onAddWorkOrder,
  activeRole,
  isApiConfigured
}: MaintenanceIntelligenceViewProps) {
  
  // Selected active equipment
  const [activeAsset, setActiveAsset] = useState<"HPB-201" | "SGT-900" | "P-201B" | "D-201">("P-201B");

  // Interactive Live Sensor States for simulation
  const [vibration, setVibration] = useState<number>(1.1);
  const [temperature, setTemperature] = useState<number>(142);
  const [pressure, setPressure] = useState<number>(115);
  const [flowRate, setFlowRate] = useState<number>(95);
  const [anomalyTriggered, setAnomalyTriggered] = useState<boolean>(false);

  // Active Prediction State
  const [prediction, setPrediction] = useState<any>(initialPredictions["P-201B"]);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictError, setPredictError] = useState<string | null>(null);

  // FMEA Generator State (Historical tool preservation)
  const [fmeaComponent, setFmeaComponent] = useState<string>("Boiler Economizer Coils");
  const [fmeaFailureMode, setFmeaFailureMode] = useState<string>("Sulfide-induced acid dewpoint corrosion");
  const [fmeaResult, setFmeaResult] = useState<FmeaData | null>({
    equipmentClass: "High-Pressure Static Boiler Equipment",
    failureEffects: "Tube corrosion, pinhole gas leaks, safety risk due to gas emissions, thermal efficiency drop on heat transfer, and potential full boiler shutdown.",
    severity: 8,
    potentialCauses: ["Exhaust flue gas temperature falling below acid condensation dewpoint (typically <130°C)", "High sulfur content in raw fuel gas supply"],
    occurrence: 5,
    currentControls: "Manual annual wall-thickness ultrasonic tests, soot-blower operations control.",
    detection: 6,
    rpn: 240,
    recommendedActions: [
      "Incorporate fuel gas desulfurization pre-scrubber",
      "Install real-time flue gas temperature telemetry transmitters on downstream stack",
      "Implement automatic bypass valve modulation to maintain flue gas temperature above 140°C"
    ]
  });
  const [fmeaLoading, setFmeaLoading] = useState<boolean>(false);
  const [fmeaError, setFmeaError] = useState<string | null>(null);

  // Dispatch work order form
  const [isCreatingWo, setIsCreatingWo] = useState<boolean>(false);
  const [woAssetId, setWoAssetId] = useState<string>("P-201B");
  const [woTitle, setWoTitle] = useState<string>("");
  const [woDescription, setWoDescription] = useState<string>("");
  const [woPriority, setWoPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");
  const [woAssignedTo, setWoAssignedTo] = useState<string>("");

  // Integrated Database tab selection
  const [dbTab, setDbTab] = useState<"history" | "failure" | "manuals" | "alerts">("alerts");

  // Interactive Live Alerts State
  const [alerts, setAlerts] = useState<any[]>([
    { id: "ALT-001", assetId: "HPB-201", msg: "Exhaust gas temperature dropped below acid condensation limit (118°C logged). Check bypass loop.", priority: "HIGH", timestamp: "09:12 AM", status: "UNRESOLVED" },
    { id: "ALT-002", assetId: "P-201B", msg: "Hydraulic pressure pulsation indicating micro-cavitation inside rotor core A.", priority: "MEDIUM", timestamp: "08:44 AM", status: "UNRESOLVED" },
    { id: "ALT-003", assetId: "SGT-900", msg: "Lube oil pressure differential near warning threshold. Check filters.", priority: "LOW", timestamp: "06:15 AM", status: "ACKNOWLEDGED" }
  ]);

  // Calendar State
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<number>(17);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([
    { day: 12, assetId: "P-201B", task: "Vibration sweep & bearing lube check", type: "PREVENTATIVE" },
    { day: 15, assetId: "HPB-201", task: "Burner double block check safety audit", type: "SAFETY" },
    { day: 19, assetId: "SGT-900", task: "EGT Sensor array loop calibration", type: "CALIBRATION" },
    { day: 24, assetId: "D-201", task: "Mechanical non-condensable sweep check", type: "PREVENTATIVE" }
  ]);
  const [newPmDate, setNewPmDate] = useState<number>(17);
  const [newPmAsset, setNewPmAsset] = useState<string>("P-201B");
  const [newPmText, setNewPmText] = useState<string>("");

  // Sensor reading trends (Mock interactive timeline)
  const [timelineData, setTimelineData] = useState<any[]>([]);

  // Initialize sensors and trends whenever asset changes
  useEffect(() => {
    let baseVib = 1.1;
    let baseTemp = 142;
    let basePress = 115;
    let baseFlow = 95;

    if (activeAsset === "HPB-201") {
      baseVib = 0.8;
      baseTemp = 145;
      basePress = 180;
      baseFlow = 450;
    } else if (activeAsset === "SGT-900") {
      baseVib = 1.8;
      baseTemp = 980;
      basePress = 45;
      baseFlow = 1500;
    } else if (activeAsset === "D-201") {
      baseVib = 0.4;
      baseTemp = 240;
      basePress = 15;
      baseFlow = 120;
    }

    setVibration(baseVib);
    setTemperature(baseTemp);
    setPressure(basePress);
    setFlowRate(baseFlow);
    setAnomalyTriggered(false);

    // Build timeline trend data
    const points = [];
    for (let i = 1; i <= 15; i++) {
      const noiseV = (Math.random() - 0.5) * 0.15;
      const noiseT = (Math.random() - 0.5) * (baseTemp * 0.02);
      points.push({
        time: `${8 + Math.floor(i / 2)}:${i % 2 === 0 ? "00" : "30"}`,
        vibration: Number((baseVib + noiseV).toFixed(2)),
        temperature: Number((baseTemp + noiseT).toFixed(1)),
        isAnomaly: false
      });
    }
    setTimelineData(points);

    // Load static preset prediction
    setPrediction(initialPredictions[activeAsset]);
  }, [activeAsset]);

  // Handle running the real API predictive call
  const handleTriggerPrediction = async (currentVib: number, currentTemp: number, currentPress: number, currentFlow: number, triggerAnomaly: boolean) => {
    setIsPredicting(true);
    setPredictError(null);

    try {
      const response = await fetch("/api/maintenance/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: activeAsset,
          vibration: currentVib,
          temperature: currentTemp,
          pressure: currentPress,
          flowRate: currentFlow,
          currentRulDays: initialPredictions[activeAsset].rulEstimationDays,
          anomalyTriggered: triggerAnomaly
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to query predictive intelligence.");
      }

      setPrediction(data.data);

      // If anomaly was triggered, spawn a real-time alert in the feed automatically!
      if (triggerAnomaly) {
        const isAlreadyAdded = alerts.some(alt => alt.assetId === activeAsset && alt.msg.includes("CRITICAL"));
        if (!isAlreadyAdded) {
          const newAlert = {
            id: `ALT-${Date.now().toString().slice(-3)}`,
            assetId: activeAsset,
            msg: `CRITICAL: Anomaly detected on ${activeAsset}. Vibration: ${currentVib} mm/s, Temp: ${currentTemp}°! RUL decreased to ${data.data.rulEstimationDays} days!`,
            priority: "CRITICAL",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: "UNRESOLVED"
          };
          setAlerts(prev => [newAlert, ...prev]);
        }
      }
    } catch (err: any) {
      console.error(err);
      setPredictError(err.message || "Cognitive server offline.");
    } finally {
      setIsPredicting(false);
    }
  };

  // Simulate sliding / adjusting sensors live
  const applySensorChanges = (vibVal: number, tempVal: number, pressVal: number, flowVal: number, anomalyState: boolean) => {
    // Regenerate trend charts to show a spike at the end!
    const updatedTrends = [...timelineData];
    // Remove first, push new spiked data points
    updatedTrends.shift();
    updatedTrends.push({
      time: "Now",
      vibration: Number(vibVal.toFixed(2)),
      temperature: Number(tempVal.toFixed(1)),
      isAnomaly: anomalyState
    });
    setTimelineData(updatedTrends);

    // Trigger AI prediction calculations
    handleTriggerPrediction(vibVal, tempVal, pressVal, flowVal, anomalyState);
  };

  // Quick Action to inject severe anomaly
  const handleInjectAnomaly = () => {
    setAnomalyTriggered(true);
    let spikeV = vibration;
    let spikeT = temperature;
    let spikeP = pressure;
    let spikeF = flowRate;

    if (activeAsset === "HPB-201") {
      spikeV = 2.4;
      spikeT = 215; // Exceeds acid threshold
      spikeP = 245;
    } else if (activeAsset === "SGT-900") {
      spikeV = 4.2; // Rotor vibration alarm > 3.0
      spikeT = 1065; // High EGT spread
    } else if (activeAsset === "P-201B") {
      spikeV = 3.8; // Acoustic cavitation > 2.5
      spikeF = 45;  // Flow plummeted
    } else if (activeAsset === "D-201") {
      spikeP = 26;  // Overpressure limit > 22
      spikeT = 285;
    }

    setVibration(spikeV);
    setTemperature(spikeT);
    setPressure(spikeP);
    setFlowRate(spikeF);

    applySensorChanges(spikeV, spikeT, spikeP, spikeF, true);
  };

  // Clear anomaly and restore healthy baseline
  const handleResetBaseline = () => {
    setAnomalyTriggered(false);
    let baseVib = 1.1;
    let baseTemp = 142;
    let basePress = 115;
    let baseFlow = 95;

    if (activeAsset === "HPB-201") {
      baseVib = 0.8;
      baseTemp = 145;
      basePress = 180;
      baseFlow = 450;
    } else if (activeAsset === "SGT-900") {
      baseVib = 1.8;
      baseTemp = 980;
      basePress = 45;
      baseFlow = 1500;
    } else if (activeAsset === "D-201") {
      baseVib = 0.4;
      baseTemp = 240;
      basePress = 15;
      baseFlow = 120;
    }

    setVibration(baseVib);
    setTemperature(baseTemp);
    setPressure(basePress);
    setFlowRate(baseFlow);

    applySensorChanges(baseVib, baseTemp, basePress, baseFlow, false);
  };

  // Handle generating FMEA (preserved legacy functionality)
  const handleGenerateFmea = async () => {
    if (!fmeaComponent.trim() || !fmeaFailureMode.trim()) return;

    setFmeaLoading(true);
    setFmeaError(null);

    try {
      const response = await fetch("/api/maintenance/fmea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          componentName: fmeaComponent,
          failureMode: fmeaFailureMode
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to analyze component reliability.");
      }

      setFmeaResult(data.data);
    } catch (err: any) {
      console.error(err);
      setFmeaError(err.message || "Unconfigured server API.");
    } finally {
      setFmeaLoading(false);
    }
  };

  // Dispatch work order triggered from client or recommended action
  const handleLaunchWorkOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!woTitle.trim() || !woDescription.trim() || !woAssignedTo.trim()) return;

    onAddWorkOrder({
      assetId: woAssetId,
      title: woTitle,
      description: woDescription,
      priority: woPriority,
      assignedTo: woAssignedTo
    });

    // Reset Form state
    setWoTitle("");
    setWoDescription("");
    setWoAssignedTo("");
    setIsCreatingWo(false);

    // Resolve any corresponding alerts for this asset automatically!
    setAlerts(prev => prev.map(alt => alt.assetId === woAssetId ? { ...alt, status: "RESOLVED" } : alt));
  };

  // Pre-fill Dispatch Order from AI recommendations or alerts
  const handleAutoFillOrder = (title: string, desc: string, priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL") => {
    setWoAssetId(activeAsset);
    setWoTitle(title);
    setWoDescription(desc);
    setWoPriority(priority);
    setWoAssignedTo(activeRole === "plant_manager" ? "Mechanical Lead" : "Duty Crew B");
    setIsCreatingWo(true);

    // Smooth scroll to dispatcher
    const el = document.getElementById("dispatcher-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Calendar event insertion
  const handleAddCalendarEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPmText.trim()) return;
    const newEv = {
      day: newPmDate,
      assetId: newPmAsset,
      task: newPmText,
      type: "PREVENTATIVE"
    };
    setCalendarEvents(prev => [...prev, newEv]);
    setNewPmText("");
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#090b11] font-sans text-slate-200" id="maintenance-view-root">
      
      {/* Title & Metadata Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded">
              <Wrench className="w-5 h-5 text-blue-500" />
            </span>
            <h2 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
              <span>Intelligent Predictive Maintenance Engine</span>
            </h2>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Combines historical orders, OEM manuals, incident RCA charts, and live thermodynamics sensor streams to forecast remaining useful life.
          </p>
        </div>

        {/* Cognitive Engine Status */}
        <div className="flex items-center gap-2 mt-4 md:mt-0 text-[11px] font-mono bg-[#0c101b] border border-slate-800 px-3 py-1.5 rounded">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isApiConfigured ? "bg-emerald-500 animate-pulse" : "bg-orange-500 animate-pulse"}`}></span>
            <span className="text-slate-400">Cognitive Status:</span>
            <span className="text-slate-200 font-bold">{isApiConfigured ? "GEMINI SECURE RUN" : "ROBUST SANDBOX LOCAL"}</span>
          </div>
        </div>
      </div>

      {/* ASSET SELECTOR BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(assetMeta).map(([id, meta]) => {
          const isSelected = activeAsset === id;
          const preVal = initialPredictions[id as keyof typeof initialPredictions];
          const isSpiked = anomalyTriggered && activeAsset === id;
          
          let cardRul = isSpiked ? prediction.rulEstimationDays : preVal.rulEstimationDays;
          let cardRisk = isSpiked ? prediction.riskScore : preVal.riskScore;
          let cardPriority = isSpiked ? prediction.priority : preVal.priority;

          return (
            <button
              key={id}
              onClick={() => setActiveAsset(id as any)}
              className={`text-left p-4 rounded border transition-all relative overflow-hidden cursor-pointer ${
                isSelected 
                  ? "bg-[#10162a] border-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.15)]" 
                  : "bg-[#0b0e17] border-slate-800 hover:border-slate-700 hover:bg-[#0c101c]"
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              )}
              
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">{id}</span>
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                  cardPriority === "CRITICAL" ? "bg-rose-950/50 text-rose-400 border border-rose-800/30" :
                  cardPriority === "HIGH" ? "bg-amber-950/50 text-amber-400 border border-amber-800/30" :
                  "bg-emerald-950/40 text-emerald-400 border border-emerald-800/20"
                }`}>
                  {cardPriority}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-200 mt-1.5 truncate">{meta.name}</h4>
              
              <div className="mt-3.5 grid grid-cols-2 gap-2 border-t border-slate-800/60 pt-2.5 text-xs">
                <div>
                  <span className="text-[9px] font-mono text-slate-500 block uppercase">Est. RUL</span>
                  <span className={`font-bold font-mono ${cardRul < 15 ? "text-rose-400" : "text-emerald-400"}`}>
                    {cardRul} Days
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase">Risk Index</span>
                  <span className="font-bold font-mono text-slate-300">
                    {cardRisk}%
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* TWO COLUMNS: LIVE SENSOR SIMULATOR & PREDICTIVE ANALYTICS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT PANEL: Live Sensor Streams & Anomaly Injector */}
        <div className="bg-[#0b0e17] border border-slate-800 rounded p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-mono uppercase text-slate-400 font-bold">Live Sensor Stream Tuning</h3>
            </div>
            
            <div className="flex items-center gap-1.5">
              {anomalyTriggered ? (
                <span className="text-[9px] font-mono px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-800/30 rounded animate-pulse">
                  ANOMALY ACTIVE
                </span>
              ) : (
                <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-950/30 text-emerald-400 border border-emerald-800/20 rounded">
                  STREAM HEALTHY
                </span>
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed font-mono bg-[#090b11] p-3 rounded border border-slate-850">
            Tune active telemetry or trigger mechanical stress simulations below. The AI predictive models recalculate RUL and risks dynamically based on live sensor deviations.
          </p>

          <div className="space-y-4 pt-2">
            {/* Sensor 1: Vibration */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-mono">
                <span className="text-slate-400">Shaft Rotor Vibration</span>
                <span className={`font-bold ${vibration > 2.5 ? "text-rose-400" : "text-blue-400"}`}>{vibration.toFixed(2)} mm/s</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={vibration}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVibration(val);
                  applySensorChanges(val, temperature, pressure, flowRate, val > 2.5);
                }}
                className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-600 mt-1">
                <span>0.5 (Ideal)</span>
                <span>Threshold: 2.5 mm/s</span>
                <span>5.0 (Critical)</span>
              </div>
            </div>

            {/* Sensor 2: Temperature */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-mono">
                <span className="text-slate-400">Thermodynamic Operating Temp</span>
                <span className={`font-bold ${temperature > (activeAsset === "SGT-900" ? 1020 : 200) ? "text-rose-400" : "text-blue-400"}`}>
                  {temperature.toFixed(0)}°{activeAsset === "SGT-900" ? "F" : "C"}
                </span>
              </div>
              <input
                type="range"
                min={activeAsset === "SGT-900" ? "800" : "50"}
                max={activeAsset === "SGT-900" ? "1150" : "350"}
                step="5"
                value={temperature}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setTemperature(val);
                  applySensorChanges(vibration, val, pressure, flowRate, activeAsset === "SGT-900" ? val > 1020 : val > 200);
                }}
                className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-600 mt-1">
                <span>Min: {activeAsset === "SGT-900" ? "800°F" : "50°C"}</span>
                <span>Max: {activeAsset === "SGT-900" ? "1150°F" : "350°C"}</span>
              </div>
            </div>

            {/* Sensor 3: Pressure */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-mono">
                <span className="text-slate-400">Circuit Static Pressure</span>
                <span className="text-blue-400 font-bold">{pressure.toFixed(0)} psi</span>
              </div>
              <input
                type="range"
                min="5"
                max="300"
                step="5"
                value={pressure}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setPressure(val);
                  applySensorChanges(vibration, temperature, val, flowRate, anomalyTriggered);
                }}
                className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-600 mt-1">
                <span>5 psi</span>
                <span>300 psi</span>
              </div>
            </div>

            {/* Sensor 4: Flow Rate */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-mono">
                <span className="text-slate-400">Process Flow Stream</span>
                <span className="text-blue-400 font-bold">{flowRate.toFixed(0)} {activeAsset === "HPB-201" ? "CFM" : "gpm"}</span>
              </div>
              <input
                type="range"
                min="10"
                max="1600"
                step="10"
                value={flowRate}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setFlowRate(val);
                  applySensorChanges(vibration, temperature, pressure, val, anomalyTriggered);
                }}
                className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-600 mt-1">
                <span>10 Units</span>
                <span>1600 Units</span>
              </div>
            </div>
          </div>

          {/* SIMULATOR QUICK TRIGGERS */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-3.5">
            <button
              onClick={handleInjectAnomaly}
              className="py-2.5 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-400 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
              <span>Inject Anomaly</span>
            </button>
            <button
              onClick={handleResetBaseline}
              className="py-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset baseline</span>
            </button>
          </div>
        </div>

        {/* MIDDLE & RIGHT PANELS: Predictive Maintenance Dashboard Outputs */}
        <div className="xl:col-span-2 bg-[#0b0e17] border border-slate-800 rounded p-5 flex flex-col justify-between">
          
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-mono uppercase text-slate-400 font-bold">AI Predictive Indicators</h3>
            </div>
            
            <span className="text-[10px] font-mono text-slate-500">
              Model Confidence: <span className="font-bold text-slate-300">{prediction.confidence}%</span>
            </span>
          </div>

          {predictError && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded">
              AI analysis error: {predictError}. Utilizing local industrial reliability algorithms safely.
            </div>
          )}

          {/* TOP GRID: RUL Gauge, Risk Score, Impact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* RUL Card */}
            <div className="bg-[#090b11] p-4 rounded border border-slate-850 text-center flex flex-col justify-between">
              <div className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Remaining Useful Life</div>
              
              <div className="my-3 flex flex-col items-center">
                <div className="relative flex items-center justify-center w-20 h-20">
                  {/* Gauge Ring */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="32" stroke="#161b2d" strokeWidth="4" fill="transparent" />
                    <circle 
                      cx="40" 
                      cy="40" 
                      r="32" 
                      stroke={prediction.rulEstimationDays < 15 ? "#f43f5e" : "#10b981"} 
                      strokeWidth="5" 
                      fill="transparent" 
                      strokeDasharray="200"
                      strokeDashoffset={200 - (200 * Math.min(prediction.rulEstimationDays, 150)) / 150}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-lg font-bold font-mono text-white leading-none">
                      {prediction.rulEstimationDays}
                    </span>
                    <span className="text-[8px] uppercase font-mono text-slate-500 mt-0.5">Days</span>
                  </div>
                </div>
              </div>

              <div className="text-[9px] font-mono text-slate-500 bg-[#0c101b] py-1 rounded">
                Predicted Failure Zone: <span className="text-slate-300 font-bold">{prediction.rulEstimationDays} Days out</span>
              </div>
            </div>

            {/* Risk Index Card */}
            <div className="bg-[#090b11] p-4 rounded border border-slate-850 flex flex-col justify-between">
              <div className="text-center text-[10px] uppercase font-mono text-slate-500 tracking-wider">Asset Risk Index</div>
              
              <div className="my-2.5 text-center">
                <div className={`text-4xl font-extrabold font-mono tracking-tight ${
                  prediction.riskScore > 75 ? "text-rose-500" :
                  prediction.riskScore > 40 ? "text-amber-500" :
                  "text-emerald-500"
                }`}>
                  {prediction.riskScore}%
                </div>
                <span className="text-[9px] uppercase font-mono text-slate-500 block mt-1">Severity / Occurrence Probability</span>
              </div>

              {/* Progress Bar Gauge */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      prediction.riskScore > 75 ? "bg-rose-500" :
                      prediction.riskScore > 40 ? "bg-amber-500" :
                      "bg-emerald-500"
                    }`}
                    style={{ width: `${prediction.riskScore}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[8px] font-mono text-slate-600">
                  <span>NORMAL (0)</span>
                  <span>TRIP RISK (100)</span>
                </div>
              </div>
            </div>

            {/* Operational Impact */}
            <div className="bg-[#090b11] p-4 rounded border border-slate-850 flex flex-col justify-between">
              <div className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Predicted Failure Impact</div>
              
              <div className="space-y-3.5 my-3">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span>Downtime Predicted:</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-white">{prediction.downtimePredictionHours} Hours</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-500" />
                    <span>Est. Maintenance Cost:</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-white">${prediction.maintenanceCostEstimation.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-blue-500" />
                    <span>Safety Lockouts Required:</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">LOTO ACTIVE</span>
                </div>
              </div>

              <div className="text-[9px] font-mono text-slate-500 text-center">
                Financial Class: <span className="text-slate-400">Class {prediction.maintenanceCostEstimation > 10000 ? "A (Major)" : "C (Routine)"}</span>
              </div>
            </div>

          </div>

          {/* BOT: Trend Analysis / Anomaly Explanation */}
          <div className="mt-4 bg-[#090b11] p-4 rounded border border-slate-850">
            <span className="text-[10px] uppercase font-mono text-blue-400 font-bold block mb-1.5 tracking-wider">
              AI Physical & Thermodynamic Anomaly Analysis
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              {prediction.anomalyAnalysis}
            </p>
          </div>

          {/* BOTTOM AI PRESCRIPTIONS: Actionable Suggestions */}
          <div className="mt-4 border-t border-slate-800/80 pt-4">
            <span className="text-[10px] uppercase font-mono text-slate-500 block mb-2.5 font-bold">
              AI-Generated Predictive Maintenance Action Suggestions
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {prediction.aiSuggestions.map((sug: string, i: number) => (
                <div 
                  key={i} 
                  className="p-3 border border-slate-850 bg-[#090b11] rounded text-[11px] hover:border-slate-800 transition-colors flex items-start gap-2.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1.5">
                    <p className="text-slate-300 font-medium leading-snug">{sug}</p>
                    <button
                      onClick={() => handleAutoFillOrder(
                        `Predictive Action: ${sug.substring(0, 50)}...`,
                        `Automatically generated predictive maintenance action order for asset ${activeAsset}. Scope: ${sug}\n\nLive sensor triggers:\nVibration: ${vibration} mm/s\nTemperature: ${temperature}°\nPressure: ${pressure} psi`,
                        prediction.priority
                      )}
                      className="text-[9px] font-mono text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Dispatch Action</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* SENSOR TREND GRAPH WITH ANOMALY SPOTS */}
      <div className="bg-[#0b0e17] border border-slate-800 rounded p-5">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Real-time Telemetry Trend Analysis & Anomaly Detection</span>
            </h3>
            <p className="text-[10px] text-slate-550">Historical log of past 15 operating ticks with real-time anomalies highlighted</p>
          </div>
          
          <div className="flex gap-4 text-[10px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span>
              <span className="text-slate-400">Vibration (mm/s)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm"></span>
              <span className="text-slate-400">Temperature</span>
            </div>
          </div>
        </div>

        {/* Responsive Recharts Container */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#161b2d" />
              <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
              <YAxis stroke="#475569" fontSize={10} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0b0e17", border: "1px solid #1e293b", borderRadius: "4px" }}
                labelStyle={{ color: "#94a3b8", fontFamily: "monospace", fontSize: "11px" }}
              />
              <Area type="monotone" dataKey="vibration" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorVib)" />
              <Area type="monotone" dataKey="temperature" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)" />
              
              {/* Threshold indicator line for vibration warnings */}
              <ReferenceLine y={2.5} stroke="#e11d48" strokeDasharray="3 3" label={{ value: "Vibration Alarm Limit", fill: "#f43f5e", fontSize: 9, position: "top" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MULTI-SOURCE DATA INTEGRATION PANEL (Tabs for combined inputs) */}
      <div className="bg-[#0b0e17] border border-slate-800 rounded overflow-hidden">
        
        {/* Tab Headers */}
        <div className="bg-[#090b11] border-b border-slate-800 flex flex-wrap">
          <button
            onClick={() => setDbTab("alerts")}
            className={`px-4 py-3 text-xs font-mono font-bold flex items-center gap-1.5 border-r border-slate-800 transition-colors cursor-pointer ${
              dbTab === "alerts" ? "bg-[#0b0e17] text-white border-t-2 border-t-blue-500" : "text-slate-500 hover:text-slate-300 hover:bg-[#0c101c]"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Automated Alerts ({alerts.filter(a => a.status === "UNRESOLVED").length})</span>
          </button>
          
          <button
            onClick={() => setDbTab("history")}
            className={`px-4 py-3 text-xs font-mono font-bold flex items-center gap-1.5 border-r border-slate-800 transition-colors cursor-pointer ${
              dbTab === "history" ? "bg-[#0b0e17] text-white border-t-2 border-t-blue-500" : "text-slate-500 hover:text-slate-300 hover:bg-[#0c101c]"
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Historical Work Orders</span>
          </button>

          <button
            onClick={() => setDbTab("failure")}
            className={`px-4 py-3 text-xs font-mono font-bold flex items-center gap-1.5 border-r border-slate-800 transition-colors cursor-pointer ${
              dbTab === "failure" ? "bg-[#0b0e17] text-white border-t-2 border-t-blue-500" : "text-slate-500 hover:text-slate-300 hover:bg-[#0c101c]"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Plant Failure Logs</span>
          </button>

          <button
            onClick={() => setDbTab("manuals")}
            className={`px-4 py-3 text-xs font-mono font-bold flex items-center gap-1.5 border-r border-slate-800 transition-colors cursor-pointer ${
              dbTab === "manuals" ? "bg-[#0b0e17] text-white border-t-2 border-t-blue-500" : "text-slate-500 hover:text-slate-300 hover:bg-[#0c101c]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>OEM Manuals & SOPs</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5">
          
          {/* Active alerts tab */}
          {dbTab === "alerts" && (
            <div className="space-y-3">
              {alerts.map((alt) => {
                const isResolved = alt.status === "RESOLVED";
                return (
                  <div 
                    key={alt.id}
                    className={`p-3.5 rounded border flex flex-col md:flex-row justify-between items-start md:items-center gap-3 transition-colors ${
                      isResolved 
                        ? "bg-[#090b11]/40 border-slate-850 opacity-60" 
                        : alt.priority === "CRITICAL" 
                        ? "bg-rose-950/20 border-rose-500/20 hover:bg-rose-950/30" 
                        : "bg-[#0d1222]/30 border-blue-500/15 hover:bg-[#0d1222]/50"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className={`p-1 rounded mt-0.5 ${
                        isResolved ? "bg-slate-800 text-slate-500" :
                        alt.priority === "CRITICAL" ? "bg-rose-500/10 text-rose-400" : "bg-blue-500/10 text-blue-400"
                      }`}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">{alt.assetId} • {alt.id}</span>
                          <span className="text-[9px] font-mono text-slate-600">{alt.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-snug font-mono">{alt.msg}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      {isResolved ? (
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 border border-emerald-800/20 bg-emerald-950/20 px-2 py-0.5 rounded">
                          <CheckCircle className="w-3 h-3" />
                          <span>RESOLVED</span>
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setAlerts(prev => prev.map(a => a.id === alt.id ? { ...a, status: "ACKNOWLEDGED" } : a));
                            }}
                            disabled={alt.status === "ACKNOWLEDGED"}
                            className="px-2.5 py-1 bg-[#090b11] hover:bg-slate-800 border border-slate-800 text-slate-400 text-[10px] font-mono rounded transition-colors disabled:opacity-40 cursor-pointer"
                          >
                            {alt.status === "ACKNOWLEDGED" ? "ACKNOWLEDGED" : "ACKNOWLEDGE"}
                          </button>
                          
                          <button
                            onClick={() => handleAutoFillOrder(
                              `Emergency Correction: ${alt.msg.substring(0, 40)}`,
                              `Emergency responsive PM corrective action for asset ${alt.assetId}. Trigger alert: "${alt.msg}"`,
                              alt.priority === "CRITICAL" ? "CRITICAL" : "HIGH"
                            )}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-mono font-bold rounded shadow-sm transition-colors cursor-pointer"
                          >
                            DISPATCH C-WO
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Historical work orders tab */}
          {dbTab === "history" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {historicalWorkOrders[activeAsset].map((wo, i) => (
                <div key={i} className="p-3.5 bg-[#090b11] border border-slate-850 rounded">
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-slate-500 font-bold">{wo.id} • {wo.type}</span>
                    <span className="text-slate-600">{wo.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200">{wo.title}</h4>
                  <div className="mt-2 text-[11px] text-slate-400 font-mono bg-[#0c101b] p-2 rounded leading-snug border border-slate-800">
                    <span className="text-[9px] uppercase block text-slate-500 font-bold mb-0.5">Execution Log Output:</span>
                    {wo.result}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Plant failure logs tab */}
          {dbTab === "failure" && (
            <div className="space-y-3">
              {historicalFailures[activeAsset].map((fail, i) => (
                <div key={i} className="p-3.5 bg-rose-950/10 border border-rose-950/30 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-rose-400 font-bold">FAILURE LOG INCIDENT</span>
                      <span className="text-[9px] font-mono text-slate-600">{fail.date}</span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono leading-snug">
                      <span className="text-slate-500 font-bold">Primary Cause:</span> {fail.cause}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      <span className="text-slate-500 font-bold">Operational Impact:</span> {fail.impact}
                    </p>
                  </div>

                  <div className="text-right bg-slate-900/50 border border-slate-850 p-2 rounded text-xs font-mono">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Financial cost</span>
                    <span className="text-rose-400 font-extrabold">{fail.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* OEM Manuals tab */}
          {dbTab === "manuals" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#090b11] border border-slate-850 rounded">
                <span className="text-[10px] font-mono text-blue-400 block mb-1 font-bold">Extracted OEM Engineering Specs</span>
                <p className="text-xs text-slate-300 leading-relaxed font-mono bg-[#0c101b] p-3 rounded border border-slate-800">
                  {assetMeta[activeAsset].oemSpecs}
                </p>
              </div>

              <div className="p-4 bg-[#090b11] border border-slate-850 rounded">
                <span className="text-[10px] font-mono text-emerald-400 block mb-1 font-bold">Operating Standard Procedures (SOPs)</span>
                <p className="text-xs text-slate-300 leading-relaxed font-mono bg-[#0c101b] p-3 rounded border border-slate-800">
                  {assetMeta[activeAsset].operatingSop}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* SPARE PARTS & RECOMMENDATION ALIGNMENT */}
      <div className="bg-[#0b0e17] border border-slate-800 rounded p-5">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
            <Package className="w-4 h-4 text-blue-400" />
            <span>Spare Parts Inventory & Predictive Allocations</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-500">Asset: <span className="text-slate-300 font-bold">{activeAsset}</span></span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-500 uppercase">
                <th className="pb-3 pl-2">Component Name</th>
                <th className="pb-3">Part ID</th>
                <th className="pb-3">Stock Count</th>
                <th className="pb-3">Estimated Cost</th>
                <th className="pb-3">Lead Time (Aviation/Freight)</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono">
              {sparePartsInventory[activeAsset].map((part, idx) => (
                <tr key={idx} className="hover:bg-[#0c101b]/50 transition-colors">
                  <td className="py-3.5 pl-2 font-sans font-bold text-slate-200">{part.name}</td>
                  <td className="py-3.5 text-slate-400">{part.partNo}</td>
                  <td className="py-3.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      part.stock === 0 ? "bg-rose-950/40 text-rose-400" :
                      part.stock < 2 ? "bg-amber-950/40 text-amber-400" :
                      "bg-emerald-950/30 text-emerald-400"
                    }`}>
                      {part.stock === 0 ? "OUT OF STOCK" : `${part.stock} UNITS`}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-300">${part.cost.toLocaleString()}</td>
                  <td className="py-3.5 text-slate-400">{part.lead} {part.lead === 1 ? "Day" : "Days"}</td>
                  <td className="py-3.5 text-right pr-2">
                    <button
                      onClick={() => handleAutoFillOrder(
                        `Preventative PM: Replace ${part.name}`,
                        `Scheduled preventive replacement of ${part.name} (Part No: ${part.partNo}) as flagged by AI predictive models to avoid wear fatigue.\nEstimated Replacement Cost: $${part.cost}\nExpected execution time: 2 hours.`,
                        "MEDIUM"
                      )}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-blue-600/10 hover:border-blue-500 text-[10px] font-mono text-slate-300 border border-slate-800 rounded transition-all cursor-pointer"
                    >
                      Allocate & Schedule PM
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PREVENTATIVE MAINTENANCE CALENDAR WIDGET */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. Interactive Calendar Visualizer */}
        <div className="lg:col-span-2 bg-[#0b0e17] border border-slate-800 rounded p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-blue-400" />
              <span>DCS Maintenance & PM Calendar</span>
            </h3>
            
            <span className="text-[10px] font-mono text-slate-500 uppercase">JULY 2026</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono text-slate-500 font-bold uppercase pb-1.5 border-b border-slate-800/40">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>

          {/* Monthly grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Pad the month start */}
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={`pad-${i}`} className="h-12 bg-transparent"></div>
            ))}

            {Array.from({ length: 30 }).map((_, i) => {
              const day = i + 1;
              const hasEvents = calendarEvents.filter(ev => ev.day === day);
              const isSelected = selectedCalendarDate === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedCalendarDate(day)}
                  className={`h-12 rounded border flex flex-col justify-between p-1 transition-all cursor-pointer relative ${
                    isSelected 
                      ? "border-blue-500 bg-blue-950/20 shadow-inner" 
                      : "border-slate-850 bg-[#090b11] hover:border-slate-700 hover:bg-[#0c101c]"
                  }`}
                >
                  <span className={`text-[10px] font-mono font-bold leading-none ${
                    isSelected ? "text-blue-400" : "text-slate-400"
                  }`}>{day}</span>

                  <div className="flex gap-0.5 w-full overflow-hidden h-4 justify-end items-end">
                    {hasEvents.map((ev, idx) => (
                      <span 
                        key={idx} 
                        className={`w-1.5 h-1.5 rounded-full ${
                          ev.type === "SAFETY" ? "bg-rose-500" :
                          ev.type === "CALIBRATION" ? "bg-amber-500" :
                          "bg-blue-400"
                        }`}
                        title={ev.task}
                      ></span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Date Information */}
          <div className="bg-[#090b11] p-3 rounded border border-slate-850">
            <span className="text-[9px] font-mono text-slate-500 uppercase font-bold block mb-1">
              Events on July {selectedCalendarDate}, 2026:
            </span>
            {calendarEvents.filter(ev => ev.day === selectedCalendarDate).length > 0 ? (
              <div className="space-y-1.5">
                {calendarEvents.filter(ev => ev.day === selectedCalendarDate).map((ev, i) => (
                  <div key={i} className="flex justify-between items-center text-xs bg-[#0c101b] border border-slate-800 p-2 rounded">
                    <div>
                      <span className="text-[9px] font-mono text-blue-400 font-bold mr-2 uppercase">[{ev.assetId}]</span>
                      <span className="text-slate-300 font-sans">{ev.task}</span>
                    </div>
                    <span className={`px-1.5 py-0.5 text-[8px] font-mono font-bold rounded ${
                      ev.type === "SAFETY" ? "bg-rose-950/50 text-rose-400 border border-rose-800/30" :
                      ev.type === "CALIBRATION" ? "bg-amber-950/50 text-amber-400 border border-amber-800/30" :
                      "bg-slate-900 text-slate-400 border border-slate-800"
                    }`}>
                      {ev.type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-500 font-mono italic">No events or scheduled outages on this date.</span>
            )}
          </div>
        </div>

        {/* 2. Schedule PM Task Form */}
        <div className="bg-[#0b0e17] border border-slate-800 rounded p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-emerald-400" />
              <span>Schedule New PM</span>
            </h3>
          </div>

          <form onSubmit={handleAddCalendarEvent} className="space-y-3.5">
            <div>
              <label className="text-[9px] font-mono uppercase text-slate-500 block mb-1 font-bold">PM Target Date</label>
              <select
                value={newPmDate}
                onChange={(e) => setNewPmDate(parseInt(e.target.value))}
                className="w-full bg-[#090b11] border border-slate-800 text-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
              >
                {Array.from({ length: 30 }).map((_, i) => (
                  <option key={i} value={i + 1}>July {i + 1}, 2026</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] font-mono uppercase text-slate-500 block mb-1 font-bold">Equipment Asset Unit</label>
              <select
                value={newPmAsset}
                onChange={(e) => setNewPmAsset(e.target.value)}
                className="w-full bg-[#090b11] border border-slate-800 text-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
              >
                <option value="HPB-201">HPB-201 (Boiler)</option>
                <option value="SGT-900">SGT-900 (Gas Turbine)</option>
                <option value="P-201B">P-201B (Feedwater Pump B)</option>
                <option value="D-201">D-201 (Deaerator)</option>
              </select>
            </div>

            <div>
              <label className="text-[9px] font-mono uppercase text-slate-500 block mb-1 font-bold">Task Scope / Description</label>
              <input
                type="text"
                required
                placeholder="e.g. Clean suction strainer screen"
                value={newPmText}
                onChange={(e) => setNewPmText(e.target.value)}
                className="w-full bg-[#090b11] border border-slate-800 text-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-xs transition-colors cursor-pointer"
            >
              Add PM Event to Calendar
            </button>
          </form>
        </div>

      </div>

      {/* ACTIVE STATION DISPATCH & WORK ORDER CREATOR */}
      <div className="bg-[#0b0e17] border border-slate-800 rounded p-5" id="dispatcher-section">
        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-mono uppercase text-slate-400 font-bold">
              Predictive Work Order Dispatch Control Center
            </h3>
          </div>

          <button
            onClick={() => setIsCreatingWo(!isCreatingWo)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#090b11] hover:border-blue-500 hover:bg-blue-600/10 text-slate-300 border border-slate-800 rounded text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Launch Dispatch Order Form</span>
          </button>
        </div>

        {/* Dispatch Order Form */}
        {isCreatingWo && (
          <form onSubmit={handleLaunchWorkOrder} className="mb-6 p-4 border border-blue-600/20 bg-blue-600/5 rounded space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[9px] font-mono uppercase text-slate-500 block mb-1 font-bold">Equipment Asset ID</label>
                <select
                  value={woAssetId}
                  onChange={(e) => setWoAssetId(e.target.value)}
                  className="w-full bg-[#090b11] border border-slate-800 text-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="HPB-201">High Pressure Boiler (HPB-201)</option>
                  <option value="SGT-900">Gas Turbine Unit (SGT-900)</option>
                  <option value="P-201B">Feedwater Centrifugal Pump B (P-201B)</option>
                  <option value="D-201">Deaerator Vessel (D-201)</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-mono uppercase text-slate-500 block mb-1 font-bold">Task Urgency Priority</label>
                <select
                  value={woPriority}
                  onChange={(e) => setWoPriority(e.target.value as any)}
                  className="w-full bg-[#090b11] border border-slate-800 text-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="LOW">Low (Routine maintenance)</option>
                  <option value="MEDIUM">Medium (Minor deviation detected)</option>
                  <option value="HIGH">High (Potential downtime hazard)</option>
                  <option value="CRITICAL">Critical (Station lockout/trip danger)</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-mono uppercase text-slate-500 block mb-1 font-bold">Assigned Crew/Engineer</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanical Crew B (Vance)"
                  value={woAssignedTo}
                  onChange={(e) => setWoAssignedTo(e.target.value)}
                  className="w-full bg-[#090b11] border border-slate-800 text-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-mono uppercase text-slate-500 block mb-1 font-bold">Work Order Header/Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Inspect LCV-102 pneumatic air line filter regulator"
                value={woTitle}
                onChange={(e) => setWoTitle(e.target.value)}
                className="w-full bg-[#090b11] border border-slate-800 text-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="text-[9px] font-mono uppercase text-slate-500 block mb-1 font-bold">Job Plan / Action Checklist Description</label>
              <textarea
                required
                placeholder="Detail the scope of work, isolations needed (LOTO reference), tools and tolerances..."
                value={woDescription}
                onChange={(e) => setWoDescription(e.target.value)}
                rows={3}
                className="w-full bg-[#090b11] border border-slate-800 text-slate-200 rounded px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsCreatingWo(false)}
                className="px-3.5 py-1.5 bg-[#090b11] border border-slate-800 hover:text-white rounded text-xs text-slate-300 font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Dispatch Work Order
              </button>
            </div>
          </form>
        )}

        {/* Work Orders List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workOrders.map((wo) => {
            return (
              <div 
                key={wo.id}
                className="p-4 rounded border border-slate-850 bg-[#090b11]/70 flex flex-col justify-between hover:border-slate-800 transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-2.5">
                    <span className="font-mono text-[9px] font-bold text-slate-500">
                      {wo.id}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold uppercase ${
                      wo.priority === "CRITICAL" ? "bg-rose-950/40 text-rose-400 border border-rose-500/15" :
                      wo.priority === "HIGH" ? "bg-orange-950/40 text-orange-400 border border-orange-500/15" :
                      "bg-slate-900 text-slate-400 border border-slate-800"
                    }`}>
                      {wo.priority}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-200 leading-tight">
                    {wo.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-snug line-clamp-3 font-mono">
                    {wo.description}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-800/60 flex justify-between items-center text-[10px]">
                  <div>
                    <span className="text-slate-500 block uppercase leading-none font-mono">Asset Unit</span>
                    <span className="font-bold text-slate-300 mt-0.5 block">{wo.assetId}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block uppercase leading-none font-mono">Assigned</span>
                    <span className="font-medium text-slate-400 mt-0.5 block">{wo.assignedTo}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EXPANDED INDUSTRIAL FMEA GENERATION (MIL-STD-1629A preservation) */}
      <div className="bg-[#0b0e17] border border-slate-800 rounded p-5">
        <div className="border-b border-[#1f293d] pb-3 mb-4">
          <h3 className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
            <Settings2 className="w-4 h-4 text-blue-400" />
            <span>Industrial FMEA Audit Generator (MIL-STD-1629A Standard)</span>
          </h3>
          <p className="text-[10px] text-slate-500">Audit potential failure modes, severity levels, controls, and detection indices dynamically</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1.5 font-bold">Equipment Component Name</label>
              <input
                type="text"
                value={fmeaComponent}
                onChange={(e) => setFmeaComponent(e.target.value)}
                disabled={fmeaLoading}
                className="w-full bg-[#090b11] border border-slate-800 text-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1.5 font-bold">Failure Mode Definition</label>
              <textarea
                value={fmeaFailureMode}
                onChange={(e) => setFmeaFailureMode(e.target.value)}
                disabled={fmeaLoading}
                rows={3}
                className="w-full bg-[#090b11] border border-slate-800 text-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
              ></textarea>
            </div>

            {fmeaError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded">
                {fmeaError}. Loaded safety cache values successfully.
              </div>
            )}

            <button
              onClick={handleGenerateFmea}
              disabled={fmeaLoading || !fmeaComponent.trim() || !fmeaFailureMode.trim()}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {fmeaLoading ? "Running Reliability Audit..." : "Execute FMEA Analysis"}
            </button>
          </div>

          {/* Results Sheet */}
          <div className="lg:col-span-2 bg-[#090b11] border border-slate-850 p-4 rounded flex flex-col justify-between">
            {fmeaResult ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 font-mono uppercase">{fmeaResult.equipmentClass}</h4>
                    <span className="text-[9px] text-slate-550 block font-mono">Component: {fmeaComponent}</span>
                  </div>
                  
                  <div className="bg-[#0b0e17] border border-slate-850 px-3 py-1.5 rounded text-center">
                    <span className="text-[8px] uppercase font-mono text-slate-500">Risk Number (RPN)</span>
                    <span className={`text-sm font-bold font-mono block ${
                      fmeaResult.rpn > 200 ? "text-rose-500" : "text-emerald-500"
                    }`}>{fmeaResult.rpn}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center text-xs font-mono">
                  <div className="p-2 border border-slate-850 bg-[#0b0e17] rounded">
                    <span className="text-[8px] uppercase text-slate-500">Severity (S)</span>
                    <span className="block font-bold mt-1 text-slate-300">{fmeaResult.severity}/10</span>
                  </div>
                  <div className="p-2 border border-slate-850 bg-[#0b0e17] rounded">
                    <span className="text-[8px] uppercase text-slate-500">Occurrence (O)</span>
                    <span className="block font-bold mt-1 text-slate-300">{fmeaResult.occurrence}/10</span>
                  </div>
                  <div className="p-2 border border-slate-850 bg-[#0b0e17] rounded">
                    <span className="text-[8px] uppercase text-slate-500">Detection (D)</span>
                    <span className="block font-bold mt-1 text-slate-300">{fmeaResult.detection}/10</span>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-mono text-slate-500 font-bold block mb-1">Local & System Effects</span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-[#0b0e17] p-2.5 rounded border border-slate-850">
                    {fmeaResult.failureEffects}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] uppercase font-mono text-slate-500 font-bold block mb-1.5">Root Causes</span>
                    <ul className="space-y-1 text-xs">
                      {fmeaResult.potentialCauses.map((cause, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-slate-400 font-mono">
                          <span className="text-blue-500 font-bold">•</span>
                          <span>{cause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-mono text-slate-500 font-bold block mb-1.5">Existing Controls</span>
                    <p className="text-xs text-slate-400 leading-relaxed font-mono bg-[#0b0e17] p-2.5 rounded border border-slate-850">
                      {fmeaResult.currentControls}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-850 pt-3">
                  <span className="text-[9px] uppercase font-mono text-blue-400 font-bold block mb-2">Recommended Mitigation Actions</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    {fmeaResult.recommendedActions.map((act, idx) => (
                      <div key={idx} className="p-2 border border-slate-850 bg-[#0b0e17] rounded leading-normal text-slate-300 font-mono">
                        {act}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center text-slate-500 py-12">Run FMEA Audit to view standard analysis details.</div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
