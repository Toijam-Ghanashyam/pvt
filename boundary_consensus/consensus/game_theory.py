from typing import List, Dict, Optional
import math
from shapely.geometry import Polygon
from shapely.validation import make_valid
from ..schemas import AgentProposal, ProposedBoundary


class ShapleyPayoffCalculator:
    """Computes cooperative game payoffs using an approximation of Shapley values

    and evaluates domain-specific semantic spatial-evidence consistency.
    """

    @staticmethod
    def _boundary_to_polygon(boundary: ProposedBoundary) -> Optional[Polygon]:
        """Safely convert ProposedBoundary coordinates (lat, lng) to a valid Shapely Polygon (x=lng, y=lat).

        Returns None if coordinates represent missing evidence or cannot form a
        valid polygon.
        """
        if not boundary or not boundary.coordinates or len(boundary.coordinates) < 3:
            return None

        ring = [(pt.lng, pt.lat) for pt in boundary.coordinates]
        try:
            poly = Polygon(ring)
            if not poly.is_valid:
                poly = make_valid(poly)
            if poly.geom_type == "MultiPolygon":
                poly = max(poly.geoms, key=lambda p: p.area, default=None)
            elif poly.geom_type != "Polygon":
                return None

            return poly if poly and not poly.is_empty and poly.area > 0 else None
        except Exception:
            return None

    @classmethod
    def _evaluate_semantic_spatial_relationship(
        cls,
        drone_poly: Optional[Polygon],
        revenue_poly: Optional[Polygon],
        municipal_poly: Optional[Polygon],
    ) -> Optional[float]:
        """Evaluates semantic spatial evidence consistency across stakeholder tiers.

        Distinguishes evidence consistency from conflict severity:
          - Full Containment: Strong spatial consistency (structure sits cleanly within legal bounds).
          - Partial Crossing: Strong spatial evidence consistency (both sources verify a physical
            structure actively straddling the cadastral boundary, establishing genuine encroachment evidence).
          - Boundary Touching: Moderate spatial evidence consistency (structure aligns along perimeter).
          - Disjoint: Weak spatial consistency (entity is geographically detached from parcel).

        Missing Municipal evidence is treated neutrally (no penalty or distortion).
        """
        if drone_poly is None or revenue_poly is None:
            return None

        try:
            drone_area = drone_poly.area
            if drone_area <= 0:
                return 0.0

            intersection_area = drone_poly.intersection(revenue_poly).area
            overlap_ratio = min(1.0, max(0.0, intersection_area / drone_area))

            # 1. Full Containment: Both sources demonstrate clean internal containment
            if revenue_poly.contains(drone_poly) or overlap_ratio >= 0.999:
                spatial_consistency = 0.90

            # 2. Partial Boundary Crossing: High evidence consistency verifying encroachment
            # Both drone footprint and cadastral parcel confirm structural boundary interaction.
            # Bounded between 0.70 and 0.85 depending on footprint participation.
            elif overlap_ratio > 0.0:
                spatial_consistency = 0.70 + (0.15 * overlap_ratio)

            # 3. Boundary Touching: Moderate evidence consistency along perimeter
            elif drone_poly.touches(revenue_poly):
                spatial_consistency = 0.40

            # 4. Disjoint: Weak evidence consistency (decaying over geographic distance in degrees)
            else:
                dist = drone_poly.distance(revenue_poly)
                # 0.001 deg ~ 111 meters
                spatial_consistency = max(0.0, 0.20 * math.exp(-dist / 0.001))

            # Optional Municipal Layer Supporting Evidence
            if municipal_poly is not None and not municipal_poly.is_empty:
                muni_supports = municipal_poly.intersects(revenue_poly) or municipal_poly.intersects(drone_poly)
                adjustment = 0.05 if muni_supports else -0.05
                spatial_consistency = max(0.0, min(1.0, spatial_consistency + adjustment))

            return round(spatial_consistency, 4)
        except Exception:
            return None

    @staticmethod
    def calculate_payoffs(proposals: List[AgentProposal], winner: AgentProposal) -> Dict[str, float]:
        """Calculate cooperative surplus and compensation payoffs based on agent bids."""
        total_bid = sum(p.bid for p in proposals)
        payoffs = {}

        if total_bid == 0:
            for p in proposals:
                payoffs[p.agent_id] = 0.0
            return payoffs

        for p in proposals:
            marginal_contribution = p.bid / total_bid
            if p.agent_id == winner.agent_id:
                # Winner receives higher surplus share
                payoffs[p.agent_id] = round(marginal_contribution * 1.5, 4)
            else:
                # Losers receive cooperative side-payment to incentivize truth-telling
                payoffs[p.agent_id] = round(marginal_contribution * 0.5, 4)

        return payoffs

    @classmethod
    def evaluate_consensus_score(cls, proposals: List[AgentProposal]) -> float:
        """Calculates multi-agent consensus score based on evidence availability,

        confidence quality, confidence consistency, semantic spatial
        consistency, and sensor uncertainty.

        Missing evidence (empty coordinates) is strictly neutral.
        """
        # 1. Evidence Availability: Filter proposals with actual physical coordinates
        active_proposals = [
            p for p in proposals if p.confidence_score > 0.0 and p.proposed_boundary.coordinates
        ]

        if not active_proposals:
            return 0.0

        # Extract stakeholder geometries
        drone_poly = None
        revenue_poly = None
        municipal_poly = None

        for p in active_proposals:
            poly = cls._boundary_to_polygon(p.proposed_boundary)
            if p.stakeholder_type == "Drone":
                drone_poly = poly
            elif p.stakeholder_type == "Revenue":
                revenue_poly = poly
            elif p.stakeholder_type == "Municipal":
                municipal_poly = poly

        # 2. Evidence Confidence Quality: Mean confidence of active stakeholders
        confidences = [p.confidence_score for p in active_proposals]
        mean_confidence = sum(confidences) / len(confidences)

        # 3. Confidence Consistency: Variance penalty
        variance = sum((c - mean_confidence) ** 2 for c in confidences) / len(confidences)
        consistency_score = 1.0 - math.sqrt(variance)

        # 4. Semantic Spatial Consistency
        spatial_consistency = cls._evaluate_semantic_spatial_relationship(
            drone_poly, revenue_poly, municipal_poly
        )

        # 5. Uncertainty Buffer Penalty (bounded)
        avg_uncertainty = (
            sum(p.proposed_boundary.uncertainty_buffer_meters for p in active_proposals)
            / len(active_proposals)
        )
        uncertainty_penalty = min(avg_uncertainty / 10.0, 0.15)

        # 6. Score Synthesis
        if spatial_consistency is not None:
            # Multi-tier evidence available (e.g. Drone footprint + Revenue parcel)
            # 35% Spatial consistency, 45% Confidence quality, 20% Confidence consistency
            raw_score = (
                (spatial_consistency * 0.35)
                + (mean_confidence * 0.45)
                + (consistency_score * 0.20)
                - uncertainty_penalty
            )
        else:
            # Single-tier evidence available (only one stakeholder has physical geometry)
            raw_score = (mean_confidence * 0.75) + (consistency_score * 0.25) - uncertainty_penalty

        return round(max(0.0, min(1.0, raw_score)), 4)