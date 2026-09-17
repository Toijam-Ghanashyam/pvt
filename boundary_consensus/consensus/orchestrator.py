from typing import List, Dict, Any
from ..schemas import DisputeContext, ResolutionReport, ConsensusRoundResult, AgentProposal
from .auction import VickreyAuction
from .game_theory import ShapleyPayoffCalculator
from ..agents.drone_agent import DroneAgent
from ..agents.revenue_agent import RevenueAgent
from ..agents.municipal_agent import MunicipalAgent

class ConsensusOrchestrator:
    def __init__(self, max_rounds: int = 5, consensus_threshold: float = 0.85):
        self.max_rounds = max_rounds
        self.consensus_threshold = consensus_threshold
        self.auction_engine = VickreyAuction()
        self.payoff_engine = ShapleyPayoffCalculator()
        
    def initialize_agents(self) -> List[Any]:
        return [
            DroneAgent(agent_id="agent_drone_01"),
            RevenueAgent(agent_id="agent_revenue_01"),
            MunicipalAgent(agent_id="agent_municipal_01")
        ]

    def run_resolution_cycle(self, context: DisputeContext) -> ResolutionReport:
        agents = self.initialize_agents()
        audit_trail: List[ConsensusRoundResult] = []
        is_resolved = False
        final_round_result = None

        for round_num in range(1, self.max_rounds + 1):
            # Gather proposals
            proposals: List[AgentProposal] = []
            for agent in agents:
                proposal = agent.generate_proposal(context, round_num)
                proposals.append(proposal)
                
            # Run Vickrey Auction
            winning_proposal, second_highest_bid = self.auction_engine.determine_winner(proposals)
            
            # Calculate Game Theoretic Payoffs
            payoffs = self.payoff_engine.calculate_payoffs(proposals, winning_proposal)
            
            # Evaluate Consensus
            consensus_score = self.payoff_engine.evaluate_consensus_score(proposals)
            
            status = "RESOLVED" if consensus_score >= self.consensus_threshold else "IN_PROGRESS"
            if round_num == self.max_rounds and status != "RESOLVED":
                status = "DEADLOCK"

            round_result = ConsensusRoundResult(
                round_number=round_num,
                winning_agent_id=winning_proposal.agent_id,
                winning_stakeholder=winning_proposal.stakeholder_type,
                winning_boundary=winning_proposal.proposed_boundary,
                payoff=second_highest_bid,
                consensus_score=consensus_score,
                status=status,
                agent_payoffs=payoffs
            )
            audit_trail.append(round_result)
            final_round_result = round_result

            if status == "RESOLVED":
                is_resolved = True
                break

        return ResolutionReport(
            dispute_id=context.dispute_id,
            final_boundary=final_round_result.winning_boundary,
            rounds_taken=len(audit_trail),
            consensus_score=final_round_result.consensus_score,
            audit_trail=audit_trail,
            game_equilibrium_reached=is_resolved
        )