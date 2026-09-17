from collections import defaultdict
import numpy as np
from sklearn.cluster import DBSCAN
from cause_analyzer import analyze_cluster

def cluster_conflicts(conflicts):
    if not conflicts:
        return []
    
    total_unique_conflicts = len(conflicts)
    
    # 1. Group by Source Pairs (The "Who") with order independence
    source_groups = defaultdict(list)
    source_pair_counts = defaultdict(int)
    
    for c in conflicts:
        pair = tuple(sorted([c.source_a.name, c.source_b.name]))
        source_groups[pair].append(c)
        source_pair_counts[pair] += 1
        
    # Determine dataset-level dominant source pair for Systemic Source Mismatch
    dominant_pair = None
    dominant_count = 0
    if source_pair_counts:
        dominant_pair, dominant_count = max(source_pair_counts.items(), key=lambda x: x[1])
        
    # Condition: At least 3 total unique conflicts and dominant pair ratio >= 0.90
    is_dataset_systemic = (total_unique_conflicts >= 3) and (dominant_count / total_unique_conflicts >= 0.90)
        
    final_clusters = []
    cluster_counter = 1
    
    # 2. Spatial Clustering (The "Where") via DBSCAN
    for pair, group in source_groups.items():
        if len(group) < 3:
            # Too few to form a meaningful spatial cluster, analyze as a generic group
            res = analyze_cluster(f"cluster_{cluster_counter}", group)
            if res:
                if is_dataset_systemic and pair == dominant_pair and res["root_cause_hypothesis"] == "No Clear Systemic Pattern":
                    res["root_cause_hypothesis"] = "Systemic Source Mismatch"
                    res["confidence"] = round(dominant_count / total_unique_conflicts, 2)
                    res["description"] = f"Systemic source mismatch detected: {pair[0]} vs {pair[1]} accounts for {dominant_count}/{total_unique_conflicts} conflicts."
                
                final_clusters.append(res)
                cluster_counter += 1
            continue
            
        # Extract lat/lng in radians for Haversine distance
        coords = np.array([[np.radians(c.location_centroid.lat), np.radians(c.location_centroid.lng)] for c in group])
        
        db = DBSCAN(eps=0.0005, min_samples=3, metric='haversine').fit(coords)
        labels = db.labels_
        
        # Regroup by spatial label
        label_to_conflicts = defaultdict(list)
        for i, label in enumerate(labels):
            label_to_conflicts[label].append(group[i])
            
        # 3. Analyze Patterns (The "Why")
        for label, cluster_group in label_to_conflicts.items():
            res = analyze_cluster(f"cluster_{cluster_counter}", cluster_group)
            
            if res:
                # LOGICAL FIX: Noise points (label == -1) are geographically widespread.
                # If cause_analyzer misclassifies them as a "Localized Spatial Pattern" simply because len >= 3, 
                # downgrade them to "No Clear Systemic Pattern" so dataset-level rules can apply.
                if label == -1 and res["root_cause_hypothesis"] == "Localized Spatial Pattern":
                    res["root_cause_hypothesis"] = "No Clear Systemic Pattern"
                    res["confidence"] = 0.0
                    res["description"] = "Conflicts do not show a strong geometric or spatial alignment pattern."

                # Apply dataset-level systemic source mismatch override
                if is_dataset_systemic and pair == dominant_pair and res["root_cause_hypothesis"] == "No Clear Systemic Pattern":
                    res["root_cause_hypothesis"] = "Systemic Source Mismatch"
                    res["confidence"] = round(dominant_count / total_unique_conflicts, 2)
                    res["description"] = f"Systemic source mismatch detected: {pair[0]} vs {pair[1]} accounts for {dominant_count}/{total_unique_conflicts} conflicts."
                
                final_clusters.append(res)
                cluster_counter += 1
                
    return final_clusters