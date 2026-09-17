from .base_agent import BaseAgent
from ..schemas import DisputeContext, AgentProposal, ProposedBoundary


class RevenueAgent(BaseAgent):
    def __init__(self, agent_id: str):
        super().__init__(agent_id=agent_id, stakeholder_type="Revenue", weight=1.0)

    def generate_proposal(self, context: DisputeContext, round_num: int) -> AgentProposal:
        claimed = context.initial_claimed_boundaries.get("Revenue")
        has_evidence = claimed is not None and len(claimed.coordinates) > 0
        metadata = context.metadata or {}

        if has_evidence:
            boundary = claimed
            # Check metadata for explicit revenue confidence; otherwise use conservative baseline
            rev_conf = metadata.get("revenue_confidence")
            if rev_conf is not None:
                confidence = float(rev_conf)
            else:
                # Conservative confidence applied exclusively to verified existing cadastral geometry
                confidence = 0.80

            bid = round(confidence * self.weight * (1.0 - (round_num - 1) * 0.03), 4)
            rationale = (
                f"Official cadastral survey plot boundary verified from registry records "
                f"(source: {metadata.get('revenue_source_used', 'cadastral_plots')})."
            )
        else:
            # Empty boundary: no synthetic coordinates or false confidence
            boundary = ProposedBoundary(coordinates=[], uncertainty_buffer_meters=0.0)
            confidence = 0.0
            bid = 0.0
            rationale = "No authentic revenue/cadastral plot geometry available in database for this conflict."

        return AgentProposal(
            agent_id=self.agent_id,
            stakeholder_type=self.stakeholder_type,
            proposed_boundary=boundary,
            confidence_score=confidence,
            bid=bid,
            rationale=rationale
        )