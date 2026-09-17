from abc import ABC, abstractmethod
from ..schemas import DisputeContext, AgentProposal

class BaseAgent(ABC):
    def __init__(self, agent_id: str, stakeholder_type: str, weight: float = 1.0):
        self.agent_id = agent_id
        self.stakeholder_type = stakeholder_type
        self.weight = weight

    @abstractmethod
    def generate_proposal(self, context: DisputeContext, round_num: int) -> AgentProposal:
        """
        Generate a spatial boundary proposal and bid for the given dispute context.
        """
        pass