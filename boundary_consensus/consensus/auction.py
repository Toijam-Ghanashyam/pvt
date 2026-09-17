from typing import List, Tuple
from ..schemas import AgentProposal

class VickreyAuction:
    """
    Second-Price Sealed-Bid (Vickrey) Auction Mechanism.
    Highest bidder wins, but pays (or receives utility proportional to) the second-highest bid.
    """
    @staticmethod
    def determine_winner(proposals: List[AgentProposal]) -> Tuple[AgentProposal, float]:
        if not proposals:
            raise ValueError("Cannot run auction with empty proposals list")
            
        # Sort proposals descending by bid
        sorted_proposals = sorted(proposals, key=lambda x: x.bid, reverse=True)
        
        winner = sorted_proposals[0]
        
        if len(sorted_proposals) > 1:
            second_highest_bid = sorted_proposals[1].bid
        else:
            second_highest_bid = winner.bid
            
        return winner, second_highest_bid