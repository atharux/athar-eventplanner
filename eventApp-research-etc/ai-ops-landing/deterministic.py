import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from abc import ABC, abstractmethod
from pydantic import BaseModel, Field, validator
from dataclasses import dataclass
import hashlib
from openai import OpenAI  # Updated import

# =============================================================================
# RULE 1: SCHEMA-FIRST DESIGN - All data contracts defined before implementation
# =============================================================================
class OperationInputSchema(BaseModel):
    """Fixed input schema - versioned and enforced upfront."""
    version: str = Field("1.0", description="Schema version")
    data: Dict[str, Any]
    constraints: Dict[str, Any]

class ValidationResultSchema(BaseModel):
    version: str = "1.0"
    is_valid: bool
    reason: str
    validated_data: Dict[str, Any]
    input_hash: str = ""  # For idempotency verification; set by the pipeline after rules run

class AISuggestionSchema(BaseModel):
    version: str = "1.0"
    recommendation: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    rationale: str

# =============================================================================
# RULE 2: STRUCTURED LOGGING - Every stage logs inputs/outputs/metadata
# =============================================================================
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

def log_stage(name: str, input_data: Any, output_data: Any, metadata: Dict = None):
    """Structured logging for every pipeline stage."""
    metadata = metadata or {}
    logger.info(f"STAGE: {name}", extra={
        "input": input_data,
        "output": output_data,
        "metadata": metadata,
        "timestamp": datetime.utcnow().isoformat()
    })

# =============================================================================
# ENHANCED DETERMINISTIC TEMPLATE WITH ALL RULES
# =============================================================================
@dataclass
class OperationInput:
    """Wrapper with schema enforcement."""
    schema: OperationInputSchema

class DeterministicTemplate(ABC):
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)
        self._input_cache: Dict[str, Any] = {}  # Idempotency cache
    
    def _compute_input_hash(self, input_schema: OperationInputSchema) -> str:
        """Deterministic hash for idempotency check."""
        return hashlib.md5(json.dumps(input_schema.dict(), sort_keys=True).encode()).hexdigest()
    
    @abstractmethod
    def apply_rules(self, validated_data: Dict[str, Any]) -> ValidationResultSchema:
        """Pure deterministic rules - no AI."""
        pass
    
    @abstractmethod
    def get_ai_prompt(self, validated_data: Dict[str, Any]) -> str:
        pass
    
    # =============================================================================
    # RULE 3: IDEMPOTENT OPERATIONS - Same input = same output
    # =============================================================================
    def execute(self, raw_input: Dict) -> Dict[str, Any]:
        """Main pipeline - idempotent, schema-first, logged."""
        
        # STAGE 1: Schema validation (Schema-First)
        try:
            input_schema = OperationInputSchema(**raw_input)
        except Exception as e:
            log_stage("SCHEMA_VALIDATION", raw_input, None, {"error": str(e)})
            raise ValueError(f"Schema violation: {e}")
        
        input_hash = self._compute_input_hash(input_schema)
        
        # Idempotency check
        if input_hash in self._input_cache:
            logger.info(f"Idempotent execution - cached result for {input_hash[:8]}")
            return self._input_cache[input_hash]
        
        log_stage("INPUT_SCHEMA", raw_input, input_schema.dict())
        
        # STAGE 2: Deterministic rules (Graceful degradation for missing fields)
        validated_data = self._apply_graceful_rules(input_schema)
        rule_result = self.apply_rules(validated_data)
        rule_result.input_hash = input_hash
        
        log_stage("RULES_ENGINE", input_schema.dict(), rule_result.dict())
        
        if not rule_result.is_valid:
            result = {"status": "blocked", "result": rule_result.dict()}
            self._input_cache[input_hash] = result
            return result
        
        # STAGE 3: AI suggestions (only on validated data)
        ai_result = self._get_structured_ai(rule_result.validated_data)
        log_stage("AI_ANALYSIS", rule_result.dict(), ai_result.dict())
        
        # Final assembly with version
        final_result = {
            "version": "1.0",
            "status": "approved",
            "rules_output": rule_result.validated_data,
            "ai_suggestions": ai_result,
            "audit_log": {
                "input_hash": input_hash,
                "schema_version": input_schema.version,
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
        # RULE 3: Cache for idempotency
        self._input_cache[input_hash] = final_result
        
        log_stage("PIPELINE_COMPLETE", input_schema.dict(), final_result)
        return final_result
    
    # =============================================================================
    # RULE 4: GRACEFUL DEGRADATION - Defaults for missing fields
    # =============================================================================
    def _apply_graceful_rules(self, input_schema: OperationInputSchema) -> Dict[str, Any]:
        """Apply defaults for missing optional fields."""
        data = input_schema.data.copy()
        constraints = input_schema.constraints.copy()
        
        # Graceful defaults with logging
        data.setdefault("inventory", 0)
        data.setdefault("order_qty", 0)
        constraints.setdefault("max_stock", 1000)
        constraints.setdefault("credit_limit", 10000)
        
        missing_fields = [k for k in ["inventory", "order_qty"] if k not in input_schema.data]
        if missing_fields:
            logger.warning(f"Applied defaults for: {missing_fields}")
        
        return {"data": data, "constraints": constraints}
    
    def _get_structured_ai(self, validated_data: Dict) -> List[AISuggestionSchema]:
        """Structured AI with retries and Pydantic parsing."""
        prompt = self.get_ai_prompt(validated_data)
        suggestions = []
        
        for attempt in range(3):
            try:
                response = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.1
                )
                suggestion = AISuggestionSchema.parse_raw(response.choices[0].message.content)
                suggestions.append(suggestion)
                break
            except Exception as e:
                logger.warning(f"AI attempt {attempt+1} failed: {e}")
        
        return suggestions

# Industry examples remain the same but inherit the enhanced base
class LogisticsAutomation(DeterministicTemplate):
    def apply_rules(self, input_data: Dict[str, Any]) -> ValidationResultSchema:
        data = input_data["data"]
        constraints = input_data["constraints"]
        
        inventory, order_qty = data["inventory"], data["order_qty"]
        max_stock = constraints["max_stock"]
        
        if order_qty > inventory:
            return ValidationResultSchema(
                is_valid=False, reason="Insufficient inventory",
                validated_data={"action": "backorder", "shortfall": order_qty - inventory}
            )
        return ValidationResultSchema(
            is_valid=True, reason="Rules passed",
            validated_data={"action": "ship_full", "qty": order_qty}
        )
    
    def get_ai_prompt(self, validated_data: Dict) -> str:
        return f"Validated data: {json.dumps(validated_data)}. Suggest route optimizations only. Respond as JSON matching AISuggestionSchema."

# Usage - same input always produces identical output
if __name__ == "__main__":
    logi = LogisticsAutomation("your-key")
    
    # Identical inputs produce identical outputs (idempotent)
    test_input = {
        "version": "1.0",
        "data": {"order_qty": 50, "inventory": 40},
        "constraints": {"max_stock": 100}
    }
    
    result1 = logi.execute(test_input)
    result2 = logi.execute(test_input)  # Identical result
    # Blocked results carry no audit_log, so compare the full outputs.
    print("Idempotent:", result1 == result2)
