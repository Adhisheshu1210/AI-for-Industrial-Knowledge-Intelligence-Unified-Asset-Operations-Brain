export type RoleType = "operator" | "engineer" | "safety_inspector" | "plant_manager";

export interface UserRole {
  id: RoleType;
  name: string;
  badge: string;
  description: string;
  color: string;
  permissions: string[];
}

export interface DocumentMetadata {
  equipmentID?: string;
  system?: string;
  safetyRating?: string;
  systemRef?: string;
  valvesListed?: string[];
  instrumentsListed?: string[];
  designPressure?: string;
  designTemperature?: string;
  regulationCode?: string;
  jurisdiction?: string;
  severityCode?: string;
  totalRepairCost?: string;
  downtimeIncurred?: string;
  rcaMethod?: string;
  aiSummary?: string;
  extractedParameters?: Record<string, string>;
  wordCount?: number;
  ingestedByAI?: boolean;
  pipelineConfig?: any;
  pipelineResults?: any;
}

export interface Document {
  id: string;
  title: string;
  category: string; // SOP, Manual, Drawing, Safety, Report
  fileName: string;
  fileSize: string;
  uploadDate: string;
  uploadedBy: string;
  content: string;
  tags: string[];
  contentSnippet?: string;
  metadata?: DocumentMetadata;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isError?: boolean;
}

export interface WorkOrder {
  id: string;
  assetId: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD";
  assignedTo: string;
  dateCreated: string;
  targetCompletion: string;
}

export interface IncidentInput {
  title: string;
  description: string;
  category: string;
  reportedBy: string;
}

export interface FmeaData {
  equipmentClass: string;
  failureEffects: string;
  severity: number;
  potentialCauses: string[];
  occurrence: number;
  currentControls: string;
  detection: number;
  rpn: number;
  recommendedActions: string[];
}

export interface ComplianceResult {
  complianceStatus: "COMPLIANT" | "WARNING" | "VIOLATION";
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  findings: string[];
  applicableRegulations: string[];
  preventativeActions: string[];
  incidentRiskRating: number;
}

export interface FormalizedLesson {
  formalTitle: string;
  assetCategory: string;
  scientificExplanation: string;
  underlyingEngineeringCause: string;
  interimWorkaroundInstructions: string[];
  permanentEngineeringSolution: string;
  safetyCautions: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "alert" | "success";
  timestamp: string;
  read: boolean;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string; // "equipment" | "sensor" | "valve" | "department" | "employee" | "maintenance" | "safety" | "regulation" | "project" | "incident" | "vendor" | "location" | "event"
  properties: {
    description?: string;
    criticality?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    status?: string;
    owner?: string;
    manufacturer?: string;
    serialNumber?: string;
    codeRef?: string;
    date?: string;
    [key: string]: any;
  };
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphRelationship {
  id: string;
  source: any; // Can be string initially or GraphNode after D3 processing
  target: any; // Can be string initially or GraphNode after D3 processing
  type: string; // "MAINTAINED_BY" | "LOCATED_IN" | "CONNECTED_TO" | "INSPECTED_BY" | "REQUIRES" | "DEPENDS_ON" | "FAILED_DUE_TO" | "DOCUMENTED_IN" | "REGULATED_BY" | "RELATED_TO"
  properties: {
    context?: string;
    severity?: string;
    duration?: string;
    date?: string;
    [key: string]: any;
  };
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

