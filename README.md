# INDUS AI – Industrial Knowledge Intelligence Platform

> **Category**: Industrial Intelligence, Predictive Maintenance, HSE Regulatory Compliance, Enterprise RAG, and Organizational Learning.
> **Deployment Status**: Production-Ready (Containerized on Google Cloud Run & Standalone Docker Orchestration).
> **AI Architecture**: Powered by the **Gemini 3.5 Flash** Model with Server-Side Cognitive Handshakes.

---

##  EXECUTIVE SUMMARY & INDUSTRIAL VALUE CAPTURE

**INDUS AI** is a state-of-the-art, high-fidelity **Industrial Knowledge Intelligence Platform** engineered to bridge the gap between heavy industrial equipment operations, tribal floor knowledge, and complex safety/regulatory frameworks.

In critical infrastructure plants (steam utilities, petrochemical facilities, gas power stations), operations manuals, piping diagrams (P&IDs), shift handoff notes, and safety standards (OSHA, Factory Acts, OISD, PESO) are typically locked in fragmented, unsearchable PDFs or undocumented human habits. This fragmentation results in:
- **Excessive Downtime**: Delayed troubleshooting of critical rotary or static failures.
- **HSE Violations**: Undetected compliance gaps or expired safety inspections.
- **Lost Tribal Knowledge**: Operator shift workarounds are lost upon retirement.

**INDUS AI** resolves these operational leaks by consolidating all technical docs into a unified **AI Cognitive Engine**, extracting a semantic **Knowledge Graph**, performing real-time **Predictive Maintenance Diagnostics**, and providing a **Secure RAG Copilot** to give plant managers, maintenance crews, and EHS safety directors real-time, audit-ready industrial intelligence.

---

## ⚙️ TECHNICAL STACK & ARCHITECTURE

The platform utilizes a robust, high-performance, full-stack architecture that isolates sensitive APIs on the server-side while offering desktop-first visual responsive control on the front-end.

```
                                      +---------------------------------------------+
                                      |             OPERATOR PORTAL / UI            |
                                      |  (React 19 + Vite + Tailwind CSS + Recharts) |
                                      +--------------------+------------------------+
                                                           |
                                                   HTTPS / REST API
                                                           |
                                                           v
                                      +--------------------+------------------------+
                                      |          REST API GATEWAY / EXPRESS         |
                                      |   (Type-Safe Node.js Express Controller)    |
                                      +--------+-------------------+----------------+
                                               |                   |
                                    Cognitive Handshake     Semantic Extraction
                                               |                   |
                                               v                   v
                                      +--------+--------+  +-------+----------------+
                                      |   GEMINI API    |  |    INTERNAL NO-SQL     |
                                      |  (3.5-Flash SDK)|  |  KNOWLEDGE DATABASE    |
                                      +-----------------+  +------------------------+
                                                           |
                                                           | (Fallback Pipeline Match)
                                                           v
                                      +--------------------+------------------------+
                                      |       NEO4J-STYLE INTERACTIVE GRAPHS        |
                                      |  (Extracted Entity Nodes & Relationships)   |
                                      +---------------------------------------------+
```

### High-Fidelity Tech Stack Specifications
*   **Front-End Engine**: React 19, TypeScript 5.8, Tailwind CSS, Motion Animations, Lucide Icons.
*   **Data Visualization**: Recharts (OEE grids, thermal profiles, scatter parameters, vibration trends).
*   **Back-End Controller**: Node.js Express (REST Engine, File system indexers, Fallback pipeline algorithms).
*   **AI Orchestration**: `@google/genai` (Official modern Google GenAI SDK using Gemini 3.5 Flash).
*   **High-Scale Alternatives**: Pre-configured **FastAPI Python Backend** located in `/fastapi-backend` (featuring fully containerized schemas, PostgreSQL routers, and LangChain/ChromaDB templates for massive enterprise scaling).

---

## 📦 CORE FUNCTIONAL MODULES

### 1. Operations Cockpit (Unified Dashboard)
*   **Real-Time Telemetry Feed**: Tracks vibration profiles (mm/s RMS), drum steam pressures (psi), and circular temperature thermocouple readings.
*   **Active Alert Center**: Highlights critical anomalies (such as circular EGT spread deviations or suction starvation on pump feeds).
*   **Role-Based Views**: Automatically filters tools and permissions based on whether the active user is a **Control Room Operator**, **Reliability Engineer**, **EHS Safety Director**, or **General Plant Manager**.

### 2. Executive Analytics Dashboard
*   **Overall Equipment Effectiveness (OEE) Grid**: Visualizes OEE, Availability, Performance, and Quality tracking metrics over rolling 30-day periods.
*   **AI Ingestion & Process Logs**: Features processing latency charts, vector database ingestion rates, and system latency telemetry.
*   **Interactive Drill-Down Controls**: Deep-dives into asset-specific data points with full JSON and CSV file export configurations.

### 3. Knowledge Asset Manager (Document Ingestion & OCR)
*   **Hybrid Upload Engine**: Drag-and-drop or select PDF, PNG, PNG-P&ID blueprints, or raw incident logs.
*   **AI Document Intelligence OCR**: Extracts physical parameters (pressures, temperatures, serials, and equipment IDs) and annotates handwritten operator notes using multi-stage regex and Gemini vision mapping.
*   **Duplication & Version Control**: Checks file hashes to prevent double-indexing and applies major/minor versioning loops (e.g., `v1.0` -> `v1.1` on SOP revisions).

### 4. Interactive Knowledge Graph (Semantic Node Map)
*   **Dynamic SVG D3 Canvas**: Computes real-time node forces, drag bounds, and node-link gravity.
*   **Asset Relationships**: Maps physical linkages (`CONNECTED_TO`, `LOCATED_IN`, `REGULATED_BY`) to trace how upstream deaerator valves affect downstream boilers or turbines.
*   **Semantic Expansion**: Expands selected nodes to view technical metadata, OEM specs, and connected maintenance histories.

### 5. AI Asset Copilot (High-Fidelity RAG Engine)
*   **Source-Grounded Chat**: Ask natural language questions about technical procedures ("What is the pre-purge sequence for HPB-201?").
*   **Strict RAG Evidence Citations**: Every answer highlights the exact document ID, category, and matching clause to eliminate AI hallucinations.
*   **Contextual Auto-Suggestions**: Displays dynamic prompts matched with the active selected asset's current state.

### 6. Reliability & FMEA Workspace
*   **Predictive Maintenance Diagnostics**: Predicts Remaining Useful Life (RUL) and estimates emergency maintenance costs based on thermal/vibration telemetry.
*   **Failure Modes & Effects Analysis (FMEA)**: Generates complete engineering hazard matrix models calculating Severity, Occurrence, Detection, and Risk Priority Numbers (RPN).

### 7. EHS Compliance & OSHA Safety Audit
*   **Compliance Scorecards**: Evaluates Standard Operating Procedures (SOPs) against regulations (OSHA, Factory Acts, OISD, PESO) and outputs compliance percentages.
*   **Gaps & Expired Certifications Finder**: Flags missing inspections, expired steam boiler fitment logs, and non-compliant operations.
*   **Automated Action Plans (CAPA)**: Schedules remediation tasks and assigns direct EHS compliance deadlines.

### 8. Reliability Learning & Root Cause Engine
*   **RCA Solver (5-Whys & Fishbone)**: Generates fishbone diagrams (Ishikawa) dissecting incidents across People, Process, Equipment, Environment, Management, and Materials.
*   **Tribal Knowledge Codifier**: Formulates casual operator notes or casual floor walkdowns into formalized engineering standard SOP amendments.
*   **Bulletins Dispatcher**: Broadcasts critical safety alerts directly to relevant engineering departments.

---

## 🔒 SECURITY BEST PRACTICES & ROLE MANAGEMENT

INDUS AI adheres strictly to **industrial security standards** for mission-critical operations:

1.  **Strict Server-Side API Key Isolation**: The Gemini API key (`GEMINI_API_KEY`) is stored inside the secure environment and never shipped or leaked to the client browser. All AI prompts are proxied through Node/Express middlewares.
2.  **No Public Credential Inputs**: No in-app UI fields exist to input keys (preventing session interception). Credentials are set in the secure system environments or `.env` configurations.
3.  **Station Authorization Matrices**:
    *   `operator`: Read SOPs, report incident logs, view operations telemetry.
    *   `engineer`: Ingest files, run FMEA models, draft SOP revisions, run RCA.
    *   `safety_inspector`: Run EHS safety audits, LOTO clearances, track expired certificates.
    *   `plant_manager`: Full override authority, approve CAPA actions, and view OEE matrices.

---

## 🚀 DEPLOYMENT & PRODUCTION RUN GUIDE

### Quick-Start Local Run
1.  **Clone the Repository**:
    ```bash
    git clone <repo-url>
    cd indus-ai
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment Variables**:
    Create a `.env` file in the root directory:
    ```env
    GEMINI_API_KEY=your_google_gemini_api_key_here
    NODE_ENV=development
    ```
4.  **Run Development Stack**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the live platform.

### Docker Container Production Deployment
Build and run the entire full-stack application as a unified, optimized Docker container.

```bash
# Build the unified image
docker build -t indus-ai:latest .

# Run the container (Binds to port 3000)
docker run -d -p 3000:3000 --env GEMINI_API_KEY="your_api_key" --name indus-app indus-ai:latest
```

---

## 🤖 API ENDPOINT MATRIX (Express Gateway)

| Method | Endpoint | Description | Payload Schema / Output |
|:---|:---|:---|:---|
| **GET** | `/api/documents` | Retrieve all registered industrial documents and metadata. | Returns list of docs + active API key connection states. |
| **GET** | `/api/documents/:id` | Retrieve full technical content and parameters of a specific doc. | Return matching Document object. |
| **POST** | `/api/documents` | Ingest and OCR a technical doc, proxying Gemini metadata extraction. | Request: `{ title, category, content, fileType... }` |
| **DELETE**| `/api/documents/:id` | Delete a specific document from the index. | Returns success message. |
| **POST** | `/api/maintenance/predictive-parameters` | Process telemetry inputs and return RUL & preventatives. | Request: `{ assetId, vibration, temperature, pressure, flowRate... }` |
| **POST** | `/api/maintenance/fmea` | Generate high-fidelity failure mode risk matrices (Severity/Occ/Det/RPN).| Request: `{ componentName, failureMode }` |
| **POST** | `/api/compliance/document-audit` | Audit technical documents against Factory Acts / OISD / ISO standards. | Request: `{ documentId, framework... }` |
| **POST** | `/api/lessons/rca` | Process incident report and output detailed 5-Whys & Fishbone diagram. | Request: `{ documentId, rawDescription... }` |
| **POST** | `/api/lessons/formalize` | standardizes operator notes into formal engineering SOP drafts. | Request: `{ rawInput, title... }` |
| **GET** | `/api/lessons/cross-patterns` | Query the continuous learning system to identify global recurring risks. | Returns aggregated cross-document risk radar patterns. |

---

## 🏆 HACKATHON EVALUATION MATRIX ALIGNMENT

**INDUS AI** is designed to achieve maximum points across all evaluation criteria:

*   **Technical Excellence**: Combines full-stack Node/Express with React 19, Recharts visualizations, the official Google GenAI SDK (`@google/genai`), multi-layered fallback models for high offline resilience, and clean, type-safe structures.
*   **Exceptional User Experience (UX)**: Features an eye-safe "Industrial Slate" dark UI, responsive desktop-first control docks, real-time alert tickers, role-based tool restrictions, and smooth layout-preserving motion transitions.
*   **Business Impact & Practical Value**: Directly targets the highest-cost issues in heavy industry (unplanned downtime, safety compliance gaps, and knowledge decay). CAPA tracking turns AI insights into direct, assignable team tasks.
*   **Production Readiness & Scalability**: Includes pre-configured Docker configurations, production-grade bundling scripts, a parallel FastAPI Python service for enterprise data routing, and robust exception-handling with fallback algorithms.
