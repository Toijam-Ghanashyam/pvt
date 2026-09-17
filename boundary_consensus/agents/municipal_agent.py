from .base_agent import BaseAgent
from ..schemas import DisputeContext, AgentProposal, ProposedBoundary


class MunicipalAgent(BaseAgent):
    def __init__(self, agent_id: str):
        super().__init__(agent_id=agent_id, stakeholder_type="Municipal", weight=0.9)

    def generate_proposal(self, context: DisputeContext, round_num: int) -> AgentProposal:
        claimed = context.initial_claimed_boundaries.get("Municipal")
        has_evidence = claimed is not None and len(claimed.coordinates) > 0
        metadata = context.metadata or {}

        if has_evidence:
            boundary = claimed
            muni_conf = metadata.get("municipal_confidence")
            if muni_conf is not None:
                confidence = float(muni_conf)
            else:
                confidence = 0.75

            bid = round(confidence * self.weight * (1.0 - (round_num - 1) * 0.02), 4)
            rationale = (
                f"Spatially intersecting urban local body zone boundary verified "
                f"(source: {metadata.get('municipal_source_used', 'municipal_layers')})."
            )
        else:
            # Missing evidence: 0.0 confidence and 0.0 bid without fallback coordinates
            boundary = ProposedBoundary(coordinates=[], uncertainty_buffer_meters=0.0)
            confidence = 0.0
            bid = 0.0
            rationale = "No intersecting municipal jurisdiction or zone boundary found for this conflict."

        return AgentProposal(
            agent_id=self.agent_id,
            stakeholder_type=self.stakeholder_type,
            proposed_boundary=boundary,
            confidence_score=confidence,
            bid=bid,
            rationale=rationale
        )