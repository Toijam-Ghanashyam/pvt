import math
import numpy as np

def get_shift_vector_m(lat1, lon1, lat2, lon2):
    """
    Approximate Cartesian shift (dx, dy) in meters between two lat/lng points.
    Suitable for prototype analysis.
    """
    R = 6371000 # Earth radius in meters
    lat1_rad, lat2_rad = math.radians(lat1), math.radians(lat2)
    lon1_rad, lon2_rad = math.radians(lon1), math.radians(lon2)
    
    # dx depends on the cosine of the average latitude
    dx = (lon2_rad - lon1_rad) * R * math.cos((lat1_rad + lat2_rad) / 2)
    dy = (lat2_rad - lat1_rad) * R
    return dx, dy

def calculate_sliver_index(area, perimeter):
    """
    Sliver Index = Area / Perimeter^2. 
    Lower values indicate long, thin polygons (digitization/alignment errors).
    """
    if perimeter <= 0: 
        return 0
    return area / (perimeter ** 2)

def analyze_cluster(cluster_id, conflicts):
    """
    Analyzes a group of conflicts and returns a hypothesis.
    """
    if not conflicts:
        return None
        
    source_a_name = conflicts[0].source_a.name
    source_b_name = conflicts[0].source_b.name
    
    shifts_dx = []
    shifts_dy = []
    shifts_mag = []
    sliver_indices = []
    
    for c in conflicts:
        dx, dy = get_shift_vector_m(
            c.source_a.centroid.lat, c.source_a.centroid.lng,
            c.source_b.centroid.lat, c.source_b.centroid.lng
        )
        mag = math.hypot(dx, dy)
        shifts_dx.append(dx)
        shifts_dy.append(dy)
        shifts_mag.append(mag)
        
        s_idx = calculate_sliver_index(
            c.conflict_polygon_metrics.area_sqm,
            c.conflict_polygon_metrics.perimeter_m
        )
        sliver_indices.append(s_idx)
        
    avg_dx = np.mean(shifts_dx)
    avg_dy = np.mean(shifts_dy)
    avg_mag = np.mean(shifts_mag)
    
    # Combined spatial variance (spread of the shift vectors)
    var_dx = np.var(shifts_dx)
    var_dy = np.var(shifts_dy)
    shift_variance = float(var_dx + var_dy) 
    
    avg_sliver = np.mean(sliver_indices)
    
    # Defaults
    hypothesis = "No Clear Systemic Pattern"
    confidence = 0.0
    desc = "Conflicts do not show a strong geometric or spatial alignment pattern."
    
    std_dev = math.sqrt(shift_variance)
    
    # Rule 1: Coordinate Transformation Issue
    # Consistent shift direction (low variance) and meaningful magnitude (> 0.5m)
    # BUG FIX: Require at least 3 conflicts to establish a true systemic transformation pattern.
    if len(conflicts) >= 3 and std_dev < 3.0 and avg_mag > 0.5:
        hypothesis = "Coordinate Transformation Issue"
        # Confidence is high when variance is near 0
        confidence = round(max(0.0, 0.98 - (std_dev * 0.1)), 2)
        desc = f"Consistent geographic shift of ~{avg_mag:.1f} meters detected between sources."
        
    # Rule 2: Source-Alignment / Digitization Issue
    # Highly thin polygons (low sliver index)
    elif avg_sliver < 0.02 and avg_sliver > 0:
        hypothesis = "Source-Alignment Issue"
        # Confidence increases as sliver index approaches 0
        confidence = round(max(0.0, 0.95 - (avg_sliver * 15)), 2)
        desc = "Concentration of long, thin sliver overlaps indicates border digitization mismatch."
        
    # Rule 3: Localized Spatial Pattern
    # It's a spatial cluster (len >= 3) but lacks clear vector or sliver evidence
    elif len(conflicts) >= 3:
        hypothesis = "Localized Spatial Pattern"
        confidence = 0.65
        desc = "Conflicts are heavily localized in this region, pointing to potential surveyor or regional data errors."
        
    metrics = {
        "average_shift_m": round(float(avg_mag), 2),
        "shift_variance_m": round(shift_variance, 2),
        "average_sliver_index": round(float(avg_sliver), 5),
        "conflict_count": len(conflicts)
    }
    
    return {
        "cluster_id": cluster_id,
        "root_cause_hypothesis": hypothesis,
        "confidence": confidence,
        "description": desc,
        "conflict_ids": [c.id for c in conflicts],
        "cluster_metrics": metrics,
        "primary_sources": [source_a_name, source_b_name]
    }