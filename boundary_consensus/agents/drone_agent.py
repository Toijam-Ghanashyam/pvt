from .base_agent import BaseAgent
from ..schemas import DisputeContext, AgentProposal, ProposedBoundary


class DroneAgent(BaseAgent):
    def __init__(self, agent_id: str):
        super().__init__(agent_id=agent_id, stakeholder_type="Drone", weight=1.2)

    def generate_proposal(self, context: DisputeContext, round_num: int) -> AgentProposal:
        claimed = context.initial_claimed_boundaries.get("Drone")
        has_evidence = claimed is not None and len(claimed.coordinates) > 0
        metadata = context.metadata or {}

        if has_evidence:
            boundary = claimed
            # Use genuine AI model confidence if available in metadata
            ai_conf = metadata.get("drone_ai_confidence")
            if ai_conf is not None:
                confidence = float(ai_conf)
            else:
                confidence = 0.85

            bid = round(confidence * self.weight * (1.0 - (round_num - 1) * 0.05), 4)
            rationale = (
                f"Verified building footprint extracted from high-resolution orthophoto "
                f"(source: {metadata.get('drone_source_used', 'ai_buildings')})."
            )
        else:
            # Empty boundary: no synthetic coordinates or false confidence
            boundary = ProposedBoundary(coordinates=[], uncertainty_buffer_meters=0.0)
            confidence = 0.0
            bid = 0.0
            rationale = "No authentic drone/building spatial evidence available in database for this conflict."

        return AgentProposal(
            agent_id=self.agent_id,
            stakeholder_type=self.stakeholder_type,
            proposed_boundary=boundary,
            confidence_score=confidence,
            bid=bid,
            rationale=rationale
        )