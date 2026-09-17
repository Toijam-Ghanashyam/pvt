from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class Coordinates(BaseModel):
    lat: float
    lng: float

class ProposedBoundary(BaseModel):
    coordinates: List[Coordinates]
    uncertainty_buffer_meters: float

class AgentProposal(BaseModel):
    agent_id: str
    stakeholder_type: str
    proposed_boundary: ProposedBoundary
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    bid: float = Field(..., description="Calculated bid based on stake and confidence")
    rationale: str

class DisputeContext(BaseModel):
    dispute_id: str
    region_id: str
    initial_claimed_boundaries: Dict[str, ProposedBoundary]
    metadata: Optional[Dict[str, Any]] = None

class ConsensusRoundResult(BaseModel):
    round_number: int
    winning_agent_id: str
    winning_stakeholder: str
    winning_boundary: ProposedBoundary
    payoff: float
    consensus_score: float
    status: str
    agent_payoffs: Dict[str, float]

class ResolutionReport(BaseModel):
    dispute_id: str
    final_boundary: ProposedBoundary
    rounds_taken: int
    consensus_score: float
    audit_trail: List[ConsensusRoundResult]
    game_equilibrium_reached: bool
