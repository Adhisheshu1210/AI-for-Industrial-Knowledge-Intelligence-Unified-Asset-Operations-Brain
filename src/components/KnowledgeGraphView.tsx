import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { 
  Network, 
  Search, 
  Sliders, 
  RotateCcw, 
  Trash2, 
  Plus, 
  Cpu, 
  GitCommit, 
  HelpCircle, 
  Compass, 
  Info, 
  AlertTriangle, 
  Zap, 
  Database, 
  Layers, 
  Users, 
  ShieldAlert, 
  Download, 
  Share2, 
  CheckCircle,
  Eye,
  ArrowRight
} from "lucide-react";
import { Document, GraphNode, GraphRelationship, KnowledgeGraphData, RoleType } from "../types";

interface KnowledgeGraphViewProps {
  documents: Document[];
  activeRole: RoleType;
  isApiConfigured: boolean;
}

export default function KnowledgeGraphView({
  documents,
  activeRole,
  isApiConfigured
}: KnowledgeGraphViewProps) {
  // Graph Database States
  const [graphData, setGraphData] = useState<KnowledgeGraphData>({ nodes: [], relationships: [] });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [extracting, setExtracting] = useState<boolean>(false);
  const [extractionMsg, setExtractionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filter/Search and Query workspace states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");
  const [cypherQuery, setCypherQuery] = useState<string>("");
  const [queryError, setQueryError] = useState<string | null>(null);

  // Inspector & Intelligent tool states
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [impactAnalysisResult, setImpactAnalysisResult] = useState<{
    targetNodeId: string;
    affectedNodes: Array<{ node: GraphNode; depth: number; relationType: string }>;
  } | null>(null);
  
  const [pathDiscovery, setPathDiscovery] = useState<{
    source: string;
    target: string;
    pathNodes: string[];
    pathRelationships: string[];
    stepsText: string[];
  } | null>(null);

  // Manual Node & Edge Creator State
  const [showCreatorModal, setShowCreatorModal] = useState<boolean>(false);
  const [newNodeType, setNewNodeType] = useState<string>("equipment");
  const [newNodeId, setNewNodeId] = useState<string>("");
  const [newNodeLabel, setNewNodeLabel] = useState<string>("");
  const [newNodeDesc, setNewNodeDesc] = useState<string>("");
  const [newNodeCriticality, setNewNodeCriticality] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");

  const [newRelSource, setNewRelSource] = useState<string>("");
  const [newRelTarget, setNewRelTarget] = useState<string>("");
  const [newRelType, setNewRelType] = useState<string>("CONNECTED_TO");
  const [newRelContext, setNewRelContext] = useState<string>("");

  // D3 References
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);

  // Fetch Graph Data from backend
  const fetchGraphData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/knowledge-graph");
      const result = await response.json();
      if (result.success) {
        setGraphData(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch knowledge graph:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  // Trigger RAG Knowledge Graph Extraction from Document
  const handleExtractFromDocument = async () => {
    if (!selectedDocId) return;
    setExtracting(true);
    setExtractionMsg(null);
    try {
      const response = await fetch("/api/knowledge-graph/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: selectedDocId })
      });
      const result = await response.json();
      if (result.success) {
        setExtractionMsg({
          type: "success",
          text: result.message || "Extraction completed successfully."
        });
        // Refresh graph
        await fetchGraphData();
      } else {
        throw new Error(result.error || "Extraction failed.");
      }
    } catch (err: any) {
      setExtractionMsg({
        type: "error",
        text: err.message || "Extraction pipeline interrupted."
      });
    } finally {
      setExtracting(false);
    }
  };

  // Reset Graph Database back to seed layouts
  const handleResetGraph = async () => {
    if (!confirm("Are you sure you want to reset the organizational knowledge graph back to nominal plant layout seeds? All custom document extractions will be reverted.")) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/knowledge-graph/reset", { method: "POST" });
      const result = await response.json();
      if (result.success) {
        setGraphData(result.data);
        setSelectedNode(null);
        setImpactAnalysisResult(null);
        setPathDiscovery(null);
        setCypherQuery("");
        setQueryError(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Create manual node
  const handleCreateNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeId || !newNodeLabel) return;
    try {
      const response = await fetch("/api/knowledge-graph/node", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newNodeId,
          label: newNodeLabel,
          type: newNodeType,
          properties: {
            description: newNodeDesc,
            criticality: newNodeCriticality,
            status: "User Created"
          }
        })
      });
      const result = await response.json();
      if (result.success) {
        alert(result.message);
        setNewNodeId("");
        setNewNodeLabel("");
        setNewNodeDesc("");
        await fetchGraphData();
      } else {
        alert(result.error);
      }
    } catch (err: any) {
      alert("Error adding node: " + err.message);
    }
  };

  // Create manual relationship
  const handleCreateRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRelSource || !newRelTarget || !newRelType) return;
    try {
      const response = await fetch("/api/knowledge-graph/relationship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: newRelSource,
          target: newRelTarget,
          type: newRelType,
          properties: {
            context: newRelContext || "User created connection link."
          }
        })
      });
      const result = await response.json();
      if (result.success) {
        alert(result.message);
        setNewRelSource("");
        setNewRelTarget("");
        setNewRelContext("");
        await fetchGraphData();
      } else {
        alert(result.error);
      }
    } catch (err: any) {
      alert("Error building edge: " + err.message);
    }
  };

  // Color Mapping based on Entity Type
  const getNodeColor = (type: string, isHighlighted: boolean, isSecondary: boolean) => {
    if (isSecondary) return "#1e293b"; // Dimmed background
    
    let baseColor = "#4b5563"; // default slate
    switch (type.toLowerCase()) {
      case "equipment": baseColor = "#f97316"; break; // orange
      case "sensor": baseColor = "#3b82f6"; break;    // blue
      case "valve": baseColor = "#06b6d4"; break;     // cyan
      case "department": baseColor = "#eab308"; break;// yellow
      case "employee": baseColor = "#a855f7"; break;  // purple
      case "maintenance": baseColor = "#f43f5e"; break;// rose
      case "safety": baseColor = "#10b981"; break;     // emerald
      case "regulation": baseColor = "#ec4899"; break; // pink
      case "location": baseColor = "#84cc16"; break;   // lime
      case "incident": baseColor = "#ef4444"; break;   // red
      case "vendor": baseColor = "#14b8a6"; break;     // teal
      case "event": baseColor = "#6366f1"; break;      // indigo
    }
    return baseColor;
  };

  // Cypher-like Query Compiler & Filtering
  const getFilteredData = (): KnowledgeGraphData => {
    let filteredNodes = [...graphData.nodes];
    let filteredRels = [...graphData.relationships];

    // If there is an active query error or standard search filter
    if (cypherQuery.trim()) {
      const query = cypherQuery.toLowerCase().trim();
      
      // Parse simple queries like: MATCH (n:equipment)
      if (query.startsWith("match (n:")) {
        const typeMatch = query.match(/match\s*\(n:([a-z0-9_]+)\)/i);
        if (typeMatch && typeMatch[1]) {
          const targetType = typeMatch[1].toLowerCase();
          filteredNodes = filteredNodes.filter(n => n.type.toLowerCase() === targetType);
        }
      } 
      // Parse queries like: MATCH (n)-[r:CONNECTED_TO]->(m)
      else if (query.includes("-[r:") || query.includes("->")) {
        const typeMatch = query.match(/-\[r:([a-z0-9_]+)\]->/i);
        if (typeMatch && typeMatch[1]) {
          const targetRelType = typeMatch[1].toUpperCase();
          filteredRels = filteredRels.filter(r => r.type === targetRelType);
          const activeNodeIds = new Set([
            ...filteredRels.map(r => typeof r.source === "object" ? r.source.id : r.source),
            ...filteredRels.map(r => typeof r.target === "object" ? r.target.id : r.target)
          ]);
          filteredNodes = filteredNodes.filter(n => activeNodeIds.has(n.id));
        }
      }
      // Simple search within Cypher workspace
      else {
        filteredNodes = filteredNodes.filter(n => 
          n.id.toLowerCase().includes(query) || 
          n.label.toLowerCase().includes(query) || 
          n.type.toLowerCase().includes(query)
        );
      }
    }

    // Standard Search Keyword and Filter
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase().trim();
      filteredNodes = filteredNodes.filter(n => 
        n.id.toLowerCase().includes(term) || 
        n.label.toLowerCase().includes(term) ||
        (n.properties.description && n.properties.description.toLowerCase().includes(term))
      );
    }

    if (selectedTypeFilter !== "ALL") {
      filteredNodes = filteredNodes.filter(n => n.type.toUpperCase() === selectedTypeFilter.toUpperCase());
    }

    // Retain only valid relationships matching current visible nodes
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    filteredRels = filteredRels.filter(r => {
      const srcId = typeof r.source === "object" ? r.source.id : r.source;
      const tgtId = typeof r.target === "object" ? r.target.id : r.target;
      return nodeIds.has(srcId) && nodeIds.has(tgtId);
    });

    return { nodes: filteredNodes, relationships: filteredRels };
  };

  const filtered = getFilteredData();

  // Downstream Impact Analysis DFS/BFS
  const runImpactAnalysis = (nodeId: string) => {
    const affected: Array<{ node: GraphNode; depth: number; relationType: string }> = [];
    const visited = new Set<string>([nodeId]);
    const queue: Array<{ id: string; depth: number }> = [{ id: nodeId, depth: 1 }];

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      if (depth > 4) break; // Maximum depth boundary for visibility

      // Find relationships where this node is either a source or target (bi-directional dependency tracing)
      graphData.relationships.forEach(rel => {
        const sId = typeof rel.source === "object" ? rel.source.id : rel.source;
        const tId = typeof rel.target === "object" ? rel.target.id : rel.target;

        if (sId === id && !visited.has(tId)) {
          visited.add(tId);
          const targetNode = graphData.nodes.find(n => n.id === tId);
          if (targetNode) {
            affected.push({ node: targetNode, depth, relationType: rel.type });
            queue.push({ id: tId, depth: depth + 1 });
          }
        }
      });
    }

    setImpactAnalysisResult({
      targetNodeId: nodeId,
      affectedNodes: affected
    });
    setPathDiscovery(null); // Clear path highlights
  };

  // Shortest Path Discovery using BFS
  const runPathDiscovery = () => {
    if (!newRelSource || !newRelTarget) {
      alert("Please select both Source and Target nodes in the discovery forms.");
      return;
    }
    
    const start = newRelSource.toUpperCase().trim();
    const end = newRelTarget.toUpperCase().trim();

    if (start === end) {
      alert("Source and Target cannot be identical.");
      return;
    }

    // BFS Queue stores path of node IDs
    const queue: string[][] = [[start]];
    const visited = new Set<string>([start]);
    let shortestPath: string[] | null = null;

    while (queue.length > 0) {
      const path = queue.shift()!;
      const lastNode = path[path.length - 1];

      if (lastNode === end) {
        shortestPath = path;
        break;
      }

      // Get neighbors
      graphData.relationships.forEach(rel => {
        const sId = typeof rel.source === "object" ? rel.source.id : rel.source;
        const tId = typeof rel.target === "object" ? rel.target.id : rel.target;

        if (sId === lastNode && !visited.has(tId)) {
          visited.add(tId);
          queue.push([...path, tId]);
        }
        // Bi-directional link check
        else if (tId === lastNode && !visited.has(sId)) {
          visited.add(sId);
          queue.push([...path, sId]);
        }
      });
    }

    if (shortestPath) {
      // Build step narrative and identify matching relations
      const steps: string[] = [];
      const rels: string[] = [];

      for (let i = 0; i < shortestPath.length - 1; i++) {
        const curr = shortestPath[i];
        const next = shortestPath[i+1];
        
        // Find the matching relation
        const rel = graphData.relationships.find(r => {
          const sId = typeof r.source === "object" ? r.source.id : r.source;
          const tId = typeof r.target === "object" ? r.target.id : r.target;
          return (sId === curr && tId === next) || (sId === next && tId === curr);
        });

        if (rel) {
          rels.push(rel.id);
          const sLabel = graphData.nodes.find(n => n.id === curr)?.label || curr;
          const tLabel = graphData.nodes.find(n => n.id === next)?.label || next;
          steps.push(`[${curr}] ${sLabel} connects via **${rel.type}** to [${next}] ${tLabel}`);
        }
      }

      setPathDiscovery({
        source: start,
        target: end,
        pathNodes: shortestPath,
        pathRelationships: rels,
        stepsText: steps
      });
      setImpactAnalysisResult(null); // Clear impact highlights
      
      // Select the start node to trigger inspector focus
      const startNodeObj = graphData.nodes.find(n => n.id === start);
      if (startNodeObj) setSelectedNode(startNodeObj);
    } else {
      alert(`No active relationship paths discovered between [${start}] and [${end}]. Try adding relationships manually to link these asset registers.`);
    }
  };

  // Export Knowledge Graph to JSON
  const handleExportGraph = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filtered, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `indus_knowledge_graph_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // SVG D3 Force Directed Layout Simulation
  useEffect(() => {
    if (!svgRef.current || filtered.nodes.length === 0) return;

    const width = 800;
    const height = 550;

    // Create deep clones to avoid mutating original states
    const nodesClone: GraphNode[] = filtered.nodes.map(n => ({ ...n }));
    const relsClone: GraphRelationship[] = filtered.relationships.map(r => {
      const sourceId = typeof r.source === "object" ? r.source.id : r.source;
      const targetId = typeof r.target === "object" ? r.target.id : r.target;
      return { ...r, source: sourceId, target: targetId };
    });

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", "100%");

    // Setup clear zoom boundaries
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 3])
      .on("zoom", (event) => {
        d3.select(gRef.current).attr("transform", event.transform);
      });

    svg.call(zoom);

    // D3 Simulation setup
    const simulation = d3.forceSimulation<GraphNode>(nodesClone)
      .force("link", d3.forceLink<GraphNode, GraphRelationship>(relsClone)
        .id((d: any) => d.id)
        .distance(120)
      )
      .force("charge", d3.forceManyBody().strength(-180))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(35))
      .on("tick", ticked);

    const container = d3.select(gRef.current);
    container.selectAll("*").remove(); // Clear previous layouts

    // Arrow markers definitions for edges
    const defs = container.append("defs");
    
    // Regular relation arrow
    defs.append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 26) // Compensate node radius
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#475569");

    // Impact cascade arrow
    defs.append("marker")
      .attr("id", "arrow-impact")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 26)
      .attr("refY", 0)
      .attr("markerWidth", 7)
      .attr("markerHeight", 7)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#ef4444");

    // Path highlighted arrow
    defs.append("marker")
      .attr("id", "arrow-path")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 26)
      .attr("refY", 0)
      .attr("markerWidth", 7)
      .attr("markerHeight", 7)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#fbbf24");

    // Render Relationships (Links)
    const link = container.append("g")
      .selectAll("line")
      .data(relsClone)
      .enter()
      .append("line")
      .attr("stroke", (d) => {
        if (pathDiscovery && pathDiscovery.pathRelationships.includes(d.id)) return "#fbbf24"; // neon path
        if (impactAnalysisResult) {
          const sId = typeof d.source === "object" ? d.source.id : d.source;
          const tId = typeof d.target === "object" ? d.target.id : d.target;
          const affectedIds = new Set(impactAnalysisResult.affectedNodes.map(an => an.node.id));
          if (affectedIds.has(tId) || affectedIds.has(sId)) return "#ef4444"; // red impact
        }
        return "#334155"; // slate boundary
      })
      .attr("stroke-opacity", 0.85)
      .attr("stroke-width", (d) => {
        if (pathDiscovery && pathDiscovery.pathRelationships.includes(d.id)) return 3;
        if (impactAnalysisResult) {
          const sId = typeof d.source === "object" ? d.source.id : d.source;
          const tId = typeof d.target === "object" ? d.target.id : d.target;
          const affectedIds = new Set(impactAnalysisResult.affectedNodes.map(an => an.node.id));
          if (affectedIds.has(tId) || affectedIds.has(sId)) return 2.5;
        }
        return 1.25;
      })
      .attr("marker-end", (d) => {
        if (pathDiscovery && pathDiscovery.pathRelationships.includes(d.id)) return "url(#arrow-path)";
        if (impactAnalysisResult) {
          const tId = typeof d.target === "object" ? d.target.id : d.target;
          const affectedIds = new Set(impactAnalysisResult.affectedNodes.map(an => an.node.id));
          if (affectedIds.has(tId)) return "url(#arrow-impact)";
        }
        return "url(#arrow)";
      });

    // Render Nodes Groups
    const node = container.append("g")
      .selectAll("g")
      .data(nodesClone)
      .enter()
      .append("g")
      .attr("class", "cursor-pointer")
      .call(d3.drag<SVGGElement, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      )
      .on("click", (event, d) => {
        const originalNode = graphData.nodes.find(n => n.id === d.id);
        if (originalNode) setSelectedNode(originalNode);
      });

    // Node circles styling
    node.append("circle")
      .attr("r", (d) => d.id === selectedNode?.id ? 20 : 16)
      .attr("fill", (d) => {
        const isHighlightedPath = pathDiscovery?.pathNodes.includes(d.id) || false;
        const isHighlightedImpact = impactAnalysisResult?.affectedNodes.some(an => an.node.id === d.id) || d.id === impactAnalysisResult?.targetNodeId;
        const isDimmed = (pathDiscovery && !isHighlightedPath) || (impactAnalysisResult && !isHighlightedImpact);
        return getNodeColor(d.type, isHighlightedPath || isHighlightedImpact, !!isDimmed);
      })
      .attr("stroke", (d) => {
        if (d.id === selectedNode?.id) return "#ffffff";
        if (pathDiscovery?.pathNodes.includes(d.id)) return "#fbbf24";
        if (d.id === impactAnalysisResult?.targetNodeId) return "#ef4444";
        return "#1e293b";
      })
      .attr("stroke-width", (d) => (d.id === selectedNode?.id || pathDiscovery?.pathNodes.includes(d.id)) ? 2.5 : 1.2)
      .attr("class", (d) => {
        if (d.id === impactAnalysisResult?.targetNodeId) return "animate-pulse";
        return "";
      });

    // Node labels (ID inside)
    node.append("text")
      .attr("dy", ".3em")
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .attr("font-family", "monospace")
      .attr("font-size", "8px")
      .attr("font-weight", "bold")
      .text((d) => d.id.substring(0, 6));

    // Outer Hover Labels (Display Name)
    node.append("text")
      .attr("dy", "2.1em")
      .attr("text-anchor", "middle")
      .attr("fill", "#cbd5e1")
      .attr("font-size", "8px")
      .attr("font-weight", "500")
      .text((d) => d.label.length > 15 ? d.label.substring(0, 15) + "..." : d.label);

    function ticked() {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    }

    // Drag simulation logic
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [filtered, selectedNode, impactAnalysisResult, pathDiscovery]);

  // Quick preset queries
  const loadPresetQuery = (type: string) => {
    switch (type) {
      case "all_equip":
        setCypherQuery("MATCH (n:equipment)");
        setQueryError(null);
        break;
      case "all_sensors":
        setCypherQuery("MATCH (n:sensor)");
        setQueryError(null);
        break;
      case "conn_to":
        setCypherQuery("MATCH (n)-[r:CONNECTED_TO]->(m)");
        setQueryError(null);
        break;
      case "reg_by":
        setCypherQuery("MATCH (n)-[r:REGULATED_BY]->(m)");
        setQueryError(null);
        break;
      case "clear":
        setCypherQuery("");
        setQueryError(null);
        break;
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-elegant-dark font-sans text-slate-200">
      
      {/* LEFT SIDEBAR: KG Builder & Document Extractor */}
      <div className="w-full md:w-80 border-r border-slate-800 bg-elegant-sidebar h-full flex flex-col flex-shrink-0 overflow-y-auto">
        
        {/* Header Title */}
        <div className="p-4 border-b border-slate-800 bg-[#121622] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-orange-600 text-white">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Graph Intelligence Node</h2>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5">Seeded Semantic Asset Mapping</p>
            </div>
          </div>
          <button
            onClick={handleResetGraph}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Reset Knowledge Graph Database"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Knowledge Extraction Panel */}
        <div className="p-4 border-b border-slate-800 space-y-3.5 bg-elegant-sidebar">
          <div>
            <h3 className="text-[11px] font-bold uppercase text-slate-400 tracking-wide flex items-center gap-1.5 font-mono">
              <Cpu className="w-3.5 h-3.5 text-orange-400" />
              Ingest & Extract Ontologies
            </h3>
            <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
              Select an uploaded asset document or procedure standard. Our RAG compiler will parse the text and automatically establish nodes and relations.
            </p>
          </div>

          <div className="space-y-2">
            <select
              value={selectedDocId}
              onChange={(e) => {
                setSelectedDocId(e.target.value);
                setExtractionMsg(null);
              }}
              className="w-full bg-[#090b11] border border-slate-800 text-slate-300 rounded px-2.5 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
            >
              <option value="">-- Choose Target Document --</option>
              {documents.map(d => (
                <option key={d.id} value={d.id}>[{d.id}] {d.title.split(":")[0]}</option>
              ))}
            </select>

            <button
              onClick={handleExtractFromDocument}
              disabled={extracting || !selectedDocId}
              className="w-full py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-800/80 disabled:opacity-50 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer"
            >
              {extracting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Extracting Ontologies...</span>
                </>
              ) : (
                <>
                  <GitCommit className="w-4 h-4" />
                  <span>Extract Knowledge Graph</span>
                </>
              )}
            </button>
          </div>

          {extractionMsg && (
            <div className={`p-2.5 rounded border text-[10px] leading-relaxed flex items-start gap-1.5 ${
              extractionMsg.type === "success" 
                ? "bg-emerald-600/10 border-emerald-500/20 text-emerald-400" 
                : "bg-rose-600/10 border-rose-500/20 text-rose-400"
            }`}>
              {extractionMsg.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
              <p>{extractionMsg.text}</p>
            </div>
          )}
        </div>

        {/* Manual Graph Builder Workspace */}
        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-[11px] font-bold uppercase text-slate-400 tracking-wide flex items-center gap-1.5 font-mono">
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              Manual Graph Architect
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Inject physical components or relationships directly.</p>
          </div>

          {/* Toggle Creator Panels Accordion style */}
          <div className="space-y-3.5 divide-y divide-slate-800/50">
            
            {/* Add Node Form */}
            <form onSubmit={handleCreateNode} className="space-y-2 pt-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Form Node Register</span>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  required
                  placeholder="ID (e.g., PMP-102)"
                  value={newNodeId}
                  onChange={(e) => setNewNodeId(e.target.value.toUpperCase())}
                  className="bg-[#090b11] border border-slate-800 text-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none"
                />
                <select
                  value={newNodeType}
                  onChange={(e) => setNewNodeType(e.target.value)}
                  className="bg-[#090b11] border border-slate-800 text-slate-300 rounded px-2 py-1.5 text-xs cursor-pointer"
                >
                  <option value="equipment">Equipment</option>
                  <option value="sensor">Sensor</option>
                  <option value="valve">Valve</option>
                  <option value="location">Location</option>
                  <option value="employee">Employee</option>
                  <option value="regulation">Regulation</option>
                </select>
              </div>
              <input
                type="text"
                required
                placeholder="Node Name (e.g., Water Valve B)"
                value={newNodeLabel}
                onChange={(e) => setNewNodeLabel(e.target.value)}
                className="w-full bg-[#090b11] border border-slate-800 text-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none"
              />
              <input
                type="text"
                placeholder="Description"
                value={newNodeDesc}
                onChange={(e) => setNewNodeDesc(e.target.value)}
                className="w-full bg-[#090b11] border border-slate-800 text-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-1.5 bg-[#1a2135] hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 hover:border-blue-500/40 rounded text-[10px] font-bold font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                + Inject Entity Node
              </button>
            </form>

            {/* Add Edge Relation Form */}
            <form onSubmit={handleCreateRelationship} className="space-y-2 pt-3.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Form Semantic Edge</span>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  required
                  placeholder="Source ID"
                  value={newRelSource}
                  onChange={(e) => setNewRelSource(e.target.value.toUpperCase())}
                  className="bg-[#090b11] border border-slate-800 text-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none"
                  list="graph-nodes-list"
                />
                <input
                  type="text"
                  required
                  placeholder="Target ID"
                  value={newRelTarget}
                  onChange={(e) => setNewRelTarget(e.target.value.toUpperCase())}
                  className="bg-[#090b11] border border-slate-800 text-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none"
                  list="graph-nodes-list"
                />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <select
                  value={newRelType}
                  onChange={(e) => setNewRelType(e.target.value)}
                  className="bg-[#090b11] border border-slate-800 text-slate-300 rounded px-2 py-1.5 text-xs cursor-pointer"
                >
                  <option value="CONNECTED_TO">CONNECTED_TO</option>
                  <option value="MAINTAINED_BY">MAINTAINED_BY</option>
                  <option value="LOCATED_IN">LOCATED_IN</option>
                  <option value="REQUIRES">REQUIRES</option>
                  <option value="DEPENDS_ON">DEPENDS_ON</option>
                  <option value="REGULATED_BY">REGULATED_BY</option>
                  <option value="FAILED_DUE_TO">FAILED_DUE_TO</option>
                </select>
                <input
                  type="text"
                  placeholder="Context details..."
                  value={newRelContext}
                  onChange={(e) => setNewRelContext(e.target.value)}
                  className="bg-[#090b11] border border-slate-800 text-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-[#231b15] hover:bg-orange-600/20 text-orange-400 border border-orange-500/20 hover:border-orange-500/40 rounded text-[10px] font-bold font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                + Form Relationship Edge
              </button>
            </form>
          </div>
        </div>

        {/* Hidden Datalist to ease source/target matching */}
        <datalist id="graph-nodes-list">
          {graphData.nodes.map(n => (
            <option key={n.id} value={n.id}>{n.label}</option>
          ))}
        </datalist>

      </div>

      {/* CENTER WORKSPACE: D3 Visualization & Cypher Query console */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#090b11]">
        
        {/* Upper Cypher / Visual Query Console */}
        <div className="p-4 bg-elegant-sidebar border-b border-slate-800 space-y-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-orange-500" />
              <h3 className="text-xs font-bold uppercase text-white font-mono">Cognitive Cypher Query Workspace</h3>
            </div>
            
            {/* Quick Presets */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => loadPresetQuery("all_equip")}
                className="px-2 py-0.5 bg-[#0f172a] hover:bg-blue-900/40 border border-blue-500/20 text-[9px] font-mono rounded text-blue-400 cursor-pointer"
              >
                MATCH (equipment)
              </button>
              <button
                onClick={() => loadPresetQuery("all_sensors")}
                className="px-2 py-0.5 bg-[#0f172a] hover:bg-blue-900/40 border border-blue-500/20 text-[9px] font-mono rounded text-blue-400 cursor-pointer"
              >
                MATCH (sensor)
              </button>
              <button
                onClick={() => loadPresetQuery("conn_to")}
                className="px-2 py-0.5 bg-[#0f172a] hover:bg-blue-900/40 border border-blue-500/20 text-[9px] font-mono rounded text-blue-400 cursor-pointer"
              >
                MATCH [:CONNECTED_TO]
              </button>
              {cypherQuery && (
                <button
                  onClick={() => loadPresetQuery("clear")}
                  className="px-2 py-0.5 bg-red-950/20 hover:bg-red-900/40 border border-red-500/20 text-[9px] font-mono rounded text-red-400 cursor-pointer"
                >
                  ✕ Clear Query
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 font-mono text-[11px] text-orange-500 font-bold">$</span>
              <input
                type="text"
                placeholder="Execute Neo4j MATCH commands, or type keywords to isolate nodes (e.g. MATCH (n:equipment) )"
                value={cypherQuery}
                onChange={(e) => setCypherQuery(e.target.value)}
                className="w-full bg-[#090b11] border border-slate-800 text-slate-200 rounded-lg pl-7 pr-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <button
              onClick={handleExportGraph}
              className="px-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export visible Graph structure as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Central SVG D3 Canvas */}
        <div className="flex-1 relative overflow-hidden">
          
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-grid bg-[size:24px_24px] opacity-10 pointer-events-none"></div>

          {/* Quick Filters floating row */}
          <div className="absolute top-3 left-4 flex items-center gap-2 z-10">
            <div className="flex items-center gap-1 bg-[#121622]/95 border border-slate-800/80 rounded-full px-2 py-0.5 text-[10px]">
              <span className="text-slate-500 font-bold font-mono">Entity Filter:</span>
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="bg-transparent text-slate-300 outline-none cursor-pointer font-medium uppercase font-sans"
              >
                <option value="ALL">All Node Classes</option>
                <option value="EQUIPMENT">Equipment</option>
                <option value="SENSOR">Sensors</option>
                <option value="VALVE">Valves</option>
                <option value="LOCATION">Locations</option>
                <option value="EMPLOYEE">Employees</option>
                <option value="REGULATION">Regulations</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>

            {/* Keyword Finder */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Find node by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#121622]/95 border border-slate-800/80 rounded-full pl-8 pr-3 py-1 text-[10px] w-44 focus:outline-none focus:border-orange-500 text-slate-200"
              />
            </div>
          </div>

          {/* Graph node counts info banner */}
          <div className="absolute bottom-3 left-4 bg-slate-900/85 border border-slate-800 rounded px-2.5 py-1 text-[9px] font-mono text-slate-400 flex items-center gap-3 z-10">
            <span>Nodes: <strong className="text-white">{filtered.nodes.length}</strong> / {graphData.nodes.length}</span>
            <span className="h-2 w-[1px] bg-slate-800"></span>
            <span>Relationships: <strong className="text-white">{filtered.relationships.length}</strong> / {graphData.relationships.length}</span>
          </div>

          {/* Zoom Instruction Help Banner */}
          <div className="absolute top-3 right-4 bg-slate-900/85 border border-slate-800 rounded px-2.5 py-1 text-[9px] font-mono text-slate-500 flex items-center gap-1.5 z-10">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Scroll to Zoom | Drag to Pan & Move Nodes</span>
          </div>

          {/* D3 Simulation Container */}
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs font-mono text-slate-500">Mapping entity distances...</p>
            </div>
          ) : (
            <svg ref={svgRef} className="w-full h-full">
              <g ref={gRef} />
            </svg>
          )}

        </div>

      </div>

      {/* RIGHT SIDEBAR: Asset Inspector, Discovery Path & Downstream Impact */}
      <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-800 bg-elegant-sidebar h-full flex flex-col flex-shrink-0 overflow-y-auto">
        
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-800 bg-[#121622] flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-blue-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">Asset Inspector Station</h2>
        </div>

        {/* Node Inspector body */}
        <div className="flex-1 divide-y divide-slate-800/60">
          
          {selectedNode ? (
            <div className="p-4 space-y-4">
              {/* Node Title header */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-orange-400 bg-orange-500/5 px-2 py-0.5 rounded border border-orange-500/10">
                    {selectedNode.type}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">ID: {selectedNode.id}</span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1.5">{selectedNode.label}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1.5 italic font-sans">
                  "{selectedNode.properties.description || "No description provided."}"
                </p>
              </div>

              {/* Node Properties */}
              <div className="p-2.5 bg-[#090b11] border border-slate-800/80 rounded space-y-1.5 font-mono text-[10px]">
                <div className="flex justify-between border-b border-slate-800/40 pb-1">
                  <span className="text-slate-500">Criticality:</span>
                  <span className={`font-bold ${
                    selectedNode.properties.criticality === "CRITICAL" ? "text-red-400" :
                    selectedNode.properties.criticality === "HIGH" ? "text-orange-400" : "text-slate-300"
                  }`}>{selectedNode.properties.criticality || "MEDIUM"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/40 pb-1">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-slate-300">{selectedNode.properties.status || "Operational"}</span>
                </div>
                {selectedNode.properties.manufacturer && (
                  <div className="flex justify-between border-b border-slate-800/40 pb-1">
                    <span className="text-slate-500">OEM Manufacturer:</span>
                    <span className="text-slate-300 truncate max-w-[120px]">{selectedNode.properties.manufacturer}</span>
                  </div>
                )}
                {selectedNode.properties.extractedFrom && (
                  <div className="flex justify-between pb-0.5">
                    <span className="text-slate-500">Source Document:</span>
                    <span className="text-blue-400">{selectedNode.properties.extractedFrom}</span>
                  </div>
                )}
              </div>

              {/* Inspector Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => runImpactAnalysis(selectedNode.id)}
                  className="py-2 px-1 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 rounded text-[10px] font-bold font-mono uppercase transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="Downstream failure simulation"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Impact Analysis</span>
                </button>
                <button
                  onClick={() => {
                    setNewRelSource(selectedNode.id);
                  }}
                  className="py-2 px-1 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 rounded text-[10px] font-bold font-mono uppercase transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="Set as path origin"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Set Path Source</span>
                </button>
              </div>

              {/* List Connected Neighbors (Relationship Details) */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold font-mono uppercase text-slate-500">Local Adjacency Maps</h4>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                  {graphData.relationships
                    .filter(r => {
                      const sId = typeof r.source === "object" ? r.source.id : r.source;
                      const tId = typeof r.target === "object" ? r.target.id : r.target;
                      return sId === selectedNode.id || tId === selectedNode.id;
                    })
                    .map((r, idx) => {
                      const sId = typeof r.source === "object" ? r.source.id : r.source;
                      const tId = typeof r.target === "object" ? r.target.id : r.target;
                      const isOutgoing = sId === selectedNode.id;
                      const neighborId = isOutgoing ? tId : sId;
                      const neighborLabel = graphData.nodes.find(n => n.id === neighborId)?.label || neighborId;

                      return (
                        <div 
                          key={idx}
                          onClick={() => {
                            const neighborObj = graphData.nodes.find(n => n.id === neighborId);
                            if (neighborObj) setSelectedNode(neighborObj);
                          }}
                          className="p-2 bg-[#0c0e15] hover:bg-[#121622] rounded border border-slate-800/80 cursor-pointer text-[10px] space-y-0.5 leading-normal transition-all"
                        >
                          <div className="flex justify-between items-center font-mono">
                            <span className="text-slate-500 uppercase">{isOutgoing ? `→ ${r.type}` : `← ${r.type}`}</span>
                            <span className="text-blue-400 font-bold">[{neighborId}]</span>
                          </div>
                          <p className="text-slate-300 truncate font-sans">{neighborLabel}</p>
                        </div>
                      );
                    })}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 space-y-2">
              <Network className="w-10 h-10 mx-auto text-slate-700 animate-pulse" />
              <p className="text-xs">No active asset selected.</p>
              <p className="text-[10px] text-slate-600 max-w-xs mx-auto">
                Click any circle node on the interactive central canvas to inspect parameters, run failure simulation pathways, and verify downstream compliance regulations.
              </p>
            </div>
          )}

          {/* Intelligent Path Discovery Output */}
          <div className="p-4 space-y-3">
            <h3 className="text-[11px] font-bold uppercase text-slate-400 tracking-wide flex items-center gap-1.5 font-mono">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              Intelligence Path Discovery
            </h3>
            
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="text"
                placeholder="Origin ID (e.g., Sarah)"
                value={newRelSource}
                onChange={(e) => setNewRelSource(e.target.value.toUpperCase())}
                className="bg-[#090b11] border border-slate-800 text-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none"
              />
              <input
                type="text"
                placeholder="Target ID (e.g., HPB-201)"
                value={newRelTarget}
                onChange={(e) => setNewRelTarget(e.target.value.toUpperCase())}
                className="bg-[#090b11] border border-slate-800 text-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none"
              />
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={runPathDiscovery}
                className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold font-mono transition-all cursor-pointer"
              >
                Find Shortest Path
              </button>
              {(pathDiscovery || impactAnalysisResult) && (
                <button
                  onClick={() => {
                    setPathDiscovery(null);
                    setImpactAnalysisResult(null);
                  }}
                  className="px-2.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 cursor-pointer"
                  title="Clear graph highlights"
                >
                  ✕
                </button>
              )}
            </div>

            {pathDiscovery && (
              <div className="p-3 bg-[#0d1017] border border-slate-800 rounded space-y-2.5">
                <div className="text-[10px] font-mono text-slate-400 border-b border-slate-800 pb-1 flex justify-between">
                  <span>DISCOVERED TRANSIT GRAPH PATH:</span>
                  <span className="text-amber-400 font-bold">{pathDiscovery.pathNodes.length - 1} hops</span>
                </div>
                
                <div className="space-y-2 text-[10px]">
                  {pathDiscovery.stepsText.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 leading-relaxed text-slate-300">
                      <span className="text-amber-400 font-mono">{idx + 1}.</span>
                      <p>{step.split("**").map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="text-amber-300 font-bold font-mono">{part}</strong> : part)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Downstream Impact Tracing Output */}
          {impactAnalysisResult && (
            <div className="p-4 space-y-3 bg-[#1e1416]/25">
              <h3 className="text-[11px] font-bold uppercase text-red-400 tracking-wide flex items-center gap-1.5 font-mono">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                Downstream Impact Cascades
              </h3>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Simulated zero energy or out-of-service status of <strong>{impactAnalysisResult.targetNodeId}</strong> affects these systems:
              </p>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {impactAnalysisResult.affectedNodes.length > 0 ? (
                  impactAnalysisResult.affectedNodes.map((an, idx) => (
                    <div key={idx} className="p-2.5 bg-[#090b11] border border-red-500/10 rounded flex items-start gap-2.5">
                      <div className="p-1 rounded bg-red-950/40 text-red-400 text-[10px] font-mono">
                        Lvl {an.depth}
                      </div>
                      <div className="flex-1 min-w-0 text-[11px]">
                        <div className="flex justify-between font-mono text-[9px] text-slate-500 uppercase">
                          <span>Via: {an.relationType}</span>
                          <span className={`font-bold ${
                            an.node.properties.criticality === "CRITICAL" ? "text-red-400" :
                            an.node.properties.criticality === "HIGH" ? "text-orange-400" : "text-slate-400"
                          }`}>{an.node.properties.criticality || "MEDIUM"}</span>
                        </div>
                        <h5 className="font-semibold text-slate-200 truncate mt-0.5">{an.node.label}</h5>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal italic line-clamp-2">
                          "{an.node.properties.description}"
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-[#090b11] border border-slate-800 text-center text-slate-500 text-[10px]">
                    No immediate downstream dependencies identified for this target node. It acts as an operational terminal sink in the active knowledge model.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
