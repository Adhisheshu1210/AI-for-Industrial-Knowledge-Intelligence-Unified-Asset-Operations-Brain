import json
import logging
from typing import List, Dict, Any, Optional
from google import genai
from google.genai import types
from app.core.config import settings

logger = logging.getLogger("fastapi_app")


class GeminiService:
    def __init__(self):
        self.client = None
        if settings.GEMINI_API_KEY:
            # Setup enterprise client with the key
            self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        else:
            logger.warning("GEMINI_API_KEY is not defined in environment variables.")

    def _get_client(self) -> genai.Client:
        if not self.client:
            # Fallback lazy setup
            if settings.GEMINI_API_KEY:
                self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
            else:
                raise ValueError("Gemini API key is required but missing.")
        return self.client

    async def process_document_ocr(self, filename: str, content: str) -> Dict[str, Any]:
        """Analyzes raw extracted text to generate title, summary, parameters and category."""
        client = self._get_client()
        
        prompt = f"""
        You are an expert industrial document extractor. Analyze the following document text from file "{filename}":
        ---
        {content}
        ---
        Extract:
        1. A clean, structured Title
        2. A precise, professional Category (e.g., SOP, Diagram, Compliance, Report)
        3. Industrial tags (e.g., lockout, pressure, electrical, maintenance)
        4. Key Equipment ID or System Reference mentioned (if any, else "N/A")
        5. A concise AI summary of the content (max 3 sentences)
        6. A JSON object of extracted physical parameters (e.g., max temperature, pressure bounds, voltage limits, flow rate, torque) with keys and values.
        """

        try:
            response = client.models.generate_content(
                model="gemini-3.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "title": types.Schema(type=types.Type.STRING),
                            "category": types.Schema(type=types.Type.STRING),
                            "tags": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING)),
                            "equipmentID": types.Schema(type=types.Type.STRING),
                            "systemRef": types.Schema(type=types.Type.STRING),
                            "aiSummary": types.Schema(type=types.Type.STRING),
                            "extractedParameters": types.Schema(type=types.Type.OBJECT, additional_properties=types.Schema(type=types.Type.STRING))
                        },
                        required=["title", "category", "tags", "equipmentID", "systemRef", "aiSummary", "extractedParameters"]
                    )
                )
            )
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"Error in process_document_ocr: {e}")
            # Reliable fallback metadata
            return {
                "title": filename.replace("_", " ").split(".")[0].title(),
                "category": "SOP",
                "tags": ["extracted", "automatic"],
                "equipmentID": "N/A",
                "systemRef": "N/A",
                "aiSummary": "Failed to analyze document summary automatically.",
                "extractedParameters": {}
            }

    async def chat_with_copilot(self, message: str, history: List[Dict[str, str]], context: Optional[str] = None) -> str:
        """Standard chatbot with grounding context of specific industrial manuals."""
        client = self._get_client()
        
        system_instruction = """You are the INDUS AI Senior Operations Copilot, an expert advisor on industrial plants, electrical setups, OSHA compliance, and machinery safety.
        Provide highly accurate, professional, and safety-conscious answers. 
        Where possible, reference specific physical engineering principles or standards (e.g. ISO-9001, OSHA 1910).
        """
        
        if context:
            system_instruction += f"\n\nUse the following document text as grounding context to answer the user's query:\n{context}"

        contents = []
        for msg in history:
            role = "user" if msg["role"] == "user" else "model"
            contents.append(types.Content(role=role, parts=[types.Part.from_text(text=msg["content"])]))
        
        contents.append(types.Content(role="user", parts=[types.Part.from_text(text=message)]))

        try:
            response = client.models.generate_content(
                model="gemini-3.5-flash",
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.2
                )
            )
            return response.text
        except Exception as e:
            logger.error(f"Error in chat_with_copilot: {e}")
            return f"Error communicating with Gemini model: {str(e)}"

    async def analyze_compliance(self, scenario: str) -> Dict[str, Any]:
        """Audits an industrial floor scenario or SOP for regulatory compliance hazards."""
        client = self._get_client()
        
        prompt = f"""
        Conduct a rigorous EHS compliance and hazard safety audit on the following industrial floor scenario or procedure:
        ---
        {scenario}
        ---
        Identify:
        1. Compliance status (COMPLIANT, WARNING, or VIOLATION)
        2. Risk Level (LOW, MEDIUM, HIGH)
        3. Incident risk rating percentage (0-100, where 100 is catastrophic failure imminent)
        4. Detailed findings list of unsafe practices, missing safety steps or hazardous layouts
        5. Specific breached regulatory clauses (e.g. OSHA 1910.147, NFPA 70E, ISO 45001)
        6. Remediation steps to secure compliance and guarantee floor reliability
        """

        try:
            response = client.models.generate_content(
                model="gemini-3.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "compliance_status": types.Schema(type=types.Type.STRING),
                            "risk_level": types.Schema(type=types.Type.STRING),
                            "incident_risk_rating": types.Schema(type=types.Type.INTEGER),
                            "findings": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING)),
                            "breached_clauses": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING)),
                            "remediation_steps": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING))
                        },
                        required=["compliance_status", "risk_level", "incident_risk_rating", "findings", "breached_clauses", "remediation_steps"]
                    )
                )
            )
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"Error in analyze_compliance: {e}")
            return {
                "compliance_status": "WARNING",
                "risk_level": "MEDIUM",
                "incident_risk_rating": 50,
                "findings": ["Failed to run digital audit due to system error."],
                "breached_clauses": ["N/A"],
                "remediation_steps": ["Retry EHS analysis or consult on-site inspector."]
            }

    async def formalize_observation(self, title: str, observation: str) -> Dict[str, Any]:
        """Translates informal operator field observations into standardized lessons learned."""
        client = self._get_client()
        
        prompt = f"""
        Codify this informal operator field observation into a formalized, ISO-9001 compliant reliability lesson learned.
        Observation Title: {title}
        Raw Observation: {observation}
        
        Deconstruct into:
        1. A formal technical title (procedural/engineering nomenclature)
        2. A precise Asset Category (e.g., Boiler, Steam Turbine, Centrifugal Pump, High Voltage Switchgear)
        3. Scientific rationale explaining the physical or chemical phenomenon (e.g. cavitation, thermal expansion, electric arc, galvanic corrosion)
        4. Fundamental engineering root cause of the incident/observation
        5. Interim operator guidelines for operators on the floor
        6. Permanent reliability engineering physical solution to fix it forever
        7. Safety precautions and critical warnings
        """

        try:
            response = client.models.generate_content(
                model="gemini-3.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "formal_title": types.Schema(type=types.Type.STRING),
                            "asset_category": types.Schema(type=types.Type.STRING),
                            "scientific_rationale": types.Schema(type=types.Type.STRING),
                            "fundamental_cause": types.Schema(type=types.Type.STRING),
                            "floor_guidelines": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING)),
                            "permanent_engineering_solution": types.Schema(type=types.Type.STRING),
                            "safety_precautions": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING))
                        },
                        required=["formal_title", "asset_category", "scientific_rationale", "fundamental_cause", "floor_guidelines", "permanent_engineering_solution", "safety_precautions"]
                    )
                )
            )
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"Error in formalize_observation: {e}")
            return {
                "formal_title": f"FML-{title.upper()}",
                "asset_category": "General Plant",
                "scientific_rationale": "Underlying physics could not be automatically determined.",
                "fundamental_cause": "System failed to analyze fundamental engineering root cause.",
                "floor_guidelines": ["Verify operating parameters manually."],
                "permanent_engineering_solution": "Inspect machinery and consult manufacturer manuals.",
                "safety_precautions": ["Follow standard PPE guidelines."]
            }


gemini_service = GeminiService()
