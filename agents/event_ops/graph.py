import requests
import json
import re
import uvicorn
from typing import TypedDict, Dict, Any, List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langgraph.graph import StateGraph, END

# --------------------------------------------------------------------------------
# 1. CONFIGURATION & STATE
# --------------------------------------------------------------------------------
# Performance Tip: High reasoning for planning/synthesis, light models for data retrieval
MODELS = {
    "reasoning": "mistral",      # Better for planning and complex synthesis
    "fast": "phi3:mini"         # Better for simple structured extraction
}

class EventState(TypedDict):
    event_request: str
    plan: Dict[str, Any]
    venue: Dict[str, Any]
    travel: Dict[str, Any]
    vendor: Dict[str, Any]
    schedule: Dict[str, Any]
    status: str

# Pydantic model for API requests
class EventRequest(BaseModel):
    prompt: str

# --------------------------------------------------------------------------------
# 2. UTILITIES
# --------------------------------------------------------------------------------
def extract_json(text: str) -> Dict[str, Any]:
    """Removes markdown code blocks and parses JSON string."""
    try:
        # Remove ```json ... ``` or ``` ... ``` blocks
        clean_text = re.sub(r"```(?:json)?\s*([\s\S]*?)\s*```", r"\1", text).strip()
        return json.loads(clean_text)
    except Exception as e:
        print(f"JSON Parse Error: {e}")
        return {"raw": text, "error": "could_not_parse_json"}

def call_ollama(prompt: str, model_type: str = "fast") -> Dict[str, Any]:
    """Generic caller for Ollama with model switching."""
    model_name = MODELS.get(model_type, MODELS["fast"])
    try:
        response = requests.post(
            "http://localhost:11434/api/chat",
            json={
                "model": model_name,
                "messages": [{"role": "user", "content": prompt}],
                "stream": False
            },
            timeout=120
        )
        content = response.json().get("message", {}).get("content", "")
        return extract_json(content)
    except Exception as e:
        return {"error": f"Connection failed: {str(e)}"}

# --------------------------------------------------------------------------------
# 3. AGENT NODES
# --------------------------------------------------------------------------------
def planner(state: EventState):
    print("🧭 [PLANNER] Creating event blueprint...")
    prompt = f"""
    Return ONLY valid JSON. 
    Schema: {{"event_type": string, "participants": number, "duration_days": number, "requirements": [string], "constraints": [string]}}
    User Request: {state['event_request']}
    """
    # Using reasoning model for the blueprint
    return {"plan": call_ollama(prompt, model_type="reasoning"), "status": "planned"}

def venue_agent(state: EventState):
    print("📍 [VENUE] Sourcing locations...")
    prompt = f"""
    Return ONLY valid JSON. 
    Schema: {{"venues": [ {{"name": string, "capacity": number, "score": number, "reason": string}} ]}}
    Based on this plan: {json.dumps(state['plan'])}
    """
    return {"venue": call_ollama(prompt, model_type="fast")}

def travel_agent(state: EventState):
    print("✈️ [TRAVEL] Planning logistics...")
    prompt = f"""
    Return ONLY valid JSON. 
    Schema: {{"travel": {{"arrival_strategy": string, "grouping_logic": string, "logistics_notes": [string]}}}}
    Based on this plan: {json.dumps(state['plan'])}
    """
    return {"travel": call_ollama(prompt, model_type="fast")}

def vendor_agent(state: EventState):
    print("📦 [VENDOR] Coordinating suppliers...")
    prompt = f"""
    Return ONLY valid JSON. 
    Schema: {{"vendors": [ {{"type": string, "name": string, "cost_estimate": number, "score": number}} ]}}
    Based on this plan: {json.dumps(state['plan'])}
    """
    return {"vendor": call_ollama(prompt, model_type="fast")}

def schedule_agent(state: EventState):
    print("📅 [SCHEDULE] Synthesizing final itinerary...")
    prompt = f"""
    Return ONLY valid JSON. 
    Schema: {{"schedule": [ {{"day": number, "items": [ {{"time": string, "activity": string}} ]}} ]}}
    Synthesize the following:
    Plan: {json.dumps(state['plan'])}
    Venue: {json.dumps(state['venue'])}
    Travel: {json.dumps(state['travel'])}
    Vendors: {json.dumps(state['vendor'])}
    """
    # Using reasoning model to merge 4 different JSON sources into one timeline
    return {"schedule": call_ollama(prompt, model_type="reasoning"), "status": "completed"}

# --------------------------------------------------------------------------------
# 4. GRAPH ORCHESTRATION
# --------------------------------------------------------------------------------
workflow = StateGraph(EventState)

# Add Nodes
workflow.add_node("planner", planner)
workflow.add_node("venue", venue_agent)
workflow.add_node("travel", travel_agent)
workflow.add_node("vendor", vendor_agent)
workflow.add_node("schedule", schedule_agent)

# Define Flow
workflow.set_entry_point("planner")

# PARALLEL STEP: Planner triggers all three search agents simultaneously
workflow.add_edge("planner", "venue")
workflow.add_edge("planner", "travel")
workflow.add_edge("planner", "vendor")

# JOIN STEP: All three search agents must finish before Schedule starts
workflow.add_edge("venue", "schedule")
workflow.add_edge("travel", "schedule")
workflow.add_edge("vendor", "schedule")

workflow.add_edge("schedule", END)

# Compile
app_graph = workflow.compile()

# --------------------------------------------------------------------------------
# 5. API LAYER (FASTAPI)
# --------------------------------------------------------------------------------
api = FastAPI(title="Local AI Event Orchestrator")

@api.get("/")
async def root():
    return {"status": "Online", "orchestrator": "LangGraph", "local_ai": "Ollama"}

@api.post("/generate")
async def generate_event(request: EventRequest):
    try:
        # Initial state for the graph
        inputs = {"event_request": request.prompt, "status": "starting"}
        
        # Invoke the graph
        final_state = app_graph.invoke(inputs)
        
        return {
            "success": True,
            "data": final_state
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --------------------------------------------------------------------------------
# 6. EXECUTION
# --------------------------------------------------------------------------------
if __name__ == "__main__":
    print("\n🚀 Starting Local AI Orchestration Server...")
    print("📡 API available at: http://localhost:8000/generate")
    print("🧠 Models in use: Mistral (Reasoning) + Phi-3 (Fast)\n")
    uvicorn.run(api, host="0.0.0.0", port=8000)
