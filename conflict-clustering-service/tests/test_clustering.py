import pytest
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_health():
    response = client.get("/")
    assert response.status_code == 200

def test_empty_conflicts():
    response = client.post("/api/v1/cluster", json={"conflicts": []})
    assert response.status_code == 200
    assert response.json() == {"clusters": []}

def test_coordinate_transformation_pattern():
    # 5 conflicts with identical lat/lng offsets (~111m shift)
    conflicts = []
    for i in range(5):
        conflicts.append({
            "id": f"shift_{i}",
            "type": "overlap",
            "location_centroid": {"lat": 28.6 + (i*0.0001), "lng": 77.2 + (i*0.0001)},
            "source_a": {"name": "Gov", "centroid": {"lat": 28.6 + (i*0.0001), "lng": 77.2 + (i*0.0001)}},
            "source_b": {"name": "Pvt", "centroid": {"lat": 28.601 + (i*0.0001), "lng": 77.201 + (i*0.0001)}},
            "conflict_polygon_metrics": {"area_sqm": 100, "perimeter_m": 40}
        })
    
    res = client.post("/api/v1/cluster", json={"conflicts": conflicts})
    assert res.status_code == 200
    clusters = res.json()["clusters"]
    
    found = any("Coordinate Transformation Issue" in c["root_cause_hypothesis"] for c in clusters)
    assert found

def test_single_conflict_transformation():
    conflict = {
        "id": "single_shift",
        "type": "overlap",
        "location_centroid": {"lat": 28.6, "lng": 77.2},
        "source_a": {"name": "Gov", "centroid": {"lat": 28.6, "lng": 77.2}},
        "source_b": {"name": "Pvt", "centroid": {"lat": 28.601, "lng": 77.201}},
        "conflict_polygon_metrics": {"area_sqm": 100, "perimeter_m": 40}
    }
    
    res = client.post("/api/v1/cluster", json={"conflicts": [conflict]})
    assert res.status_code == 200
    clusters = res.json()["clusters"]
    
    assert len(clusters) == 1
    assert clusters[0]["root_cause_hypothesis"] == "No Clear Systemic Pattern"
    assert clusters[0]["conflict_ids"] == ["single_shift"]

def test_two_conflicts_transformation():
    conflicts = []
    for i in range(2):
        conflicts.append({
            "id": f"shift_{i}",
            "type": "overlap",
            "location_centroid": {"lat": 28.6 + (i*0.0001), "lng": 77.2 + (i*0.0001)},
            "source_a": {"name": "Gov", "centroid": {"lat": 28.6 + (i*0.0001), "lng": 77.2 + (i*0.0001)}},
            "source_b": {"name": "Pvt", "centroid": {"lat": 28.601 + (i*0.0001), "lng": 77.201 + (i*0.0001)}},
            "conflict_polygon_metrics": {"area_sqm": 100, "perimeter_m": 40}
        })
    
    res = client.post("/api/v1/cluster", json={"conflicts": conflicts})
    assert res.status_code == 200
    clusters = res.json()["clusters"]
    
    assert len(clusters) == 1
    assert clusters[0]["root_cause_hypothesis"] == "No Clear Systemic Pattern"

def test_sliver_pattern():
    conflicts = []
    for i in range(5):
        conflicts.append({
            "id": f"sliver_{i}",
            "type": "gap",
            "location_centroid": {"lat": 19.0 + (i*0.0001), "lng": 72.8 + (i*0.0001)},
            "source_a": {"name": "Gov", "centroid": {"lat": 19.0, "lng": 72.8}},
            "source_b": {"name": "Pvt", "centroid": {"lat": 19.0, "lng": 72.8}},
            "conflict_polygon_metrics": {"area_sqm": 1, "perimeter_m": 300}
        })
    
    res = client.post("/api/v1/cluster", json={"conflicts": conflicts})
    clusters = res.json()["clusters"]
    
    found = any("Source-Alignment Issue" in c["root_cause_hypothesis"] for c in clusters)
    assert found

def test_duplicate_ids():
    conflict = {
        "id": "dup_1", "type": "overlap", 
        "location_centroid": {"lat": 0, "lng": 0},
        "source_a": {"name": "A", "centroid": {"lat": 0, "lng": 0}},
        "source_b": {"name": "B", "centroid": {"lat": 0, "lng": 0}},
        "conflict_polygon_metrics": {"area_sqm": 10, "perimeter_m": 10}
    }
    
    res = client.post("/api/v1/cluster", json={"conflicts": [conflict, conflict, conflict]})
    clusters = res.json()["clusters"]
    assert sum(len(c["conflict_ids"]) for c in clusters) == 1
    
def test_zero_perimeter_handling():
    conflict = {
        "id": "zero_perim", "type": "overlap", 
        "location_centroid": {"lat": 0, "lng": 0},
        "source_a": {"name": "A", "centroid": {"lat": 0, "lng": 0}},
        "source_b": {"name": "B", "centroid": {"lat": 0, "lng": 0}},
        "conflict_polygon_metrics": {"area_sqm": 10, "perimeter_m": 0}
    }
    res = client.post("/api/v1/cluster", json={"conflicts": [conflict]})
    assert res.status_code == 200

def test_systemic_source_mismatch_test_a():
    conflicts = []
    for i in range(9):
        conflicts.append({
            "id": f"rev_sur_{i}",
            "type": "overlap",
            "location_centroid": {"lat": 10.0 + (i * 0.1), "lng": 20.0},
            "source_a": {"name": "Revenue", "centroid": {"lat": 10.0, "lng": 20.0}},
            "source_b": {"name": "Survey", "centroid": {"lat": 10.0, "lng": 20.0}},
            "conflict_polygon_metrics": {"area_sqm": 50, "perimeter_m": 50}
        })
    conflicts.append({
        "id": "muni_for_0",
        "type": "overlap",
        "location_centroid": {"lat": 30.0, "lng": 40.0},
        "source_a": {"name": "Municipal", "centroid": {"lat": 30.0, "lng": 40.0}},
        "source_b": {"name": "Forest", "centroid": {"lat": 30.0, "lng": 40.0}},
        "conflict_polygon_metrics": {"area_sqm": 50, "perimeter_m": 50}
    })
    
    res = client.post("/api/v1/cluster", json={"conflicts": conflicts})
    assert res.status_code == 200
    clusters = res.json()["clusters"]
    found_systemic = any(c["root_cause_hypothesis"] == "Systemic Source Mismatch" for c in clusters)
    assert found_systemic

def test_systemic_source_mismatch_test_b():
    conflicts = []
    for i in range(5):
        conflicts.append({
            "id": f"rev_sur_{i}",
            "type": "overlap",
            "location_centroid": {"lat": 10.0, "lng": 20.0},
            "source_a": {"name": "Revenue", "centroid": {"lat": 10.0, "lng": 20.0}},
            "source_b": {"name": "Survey", "centroid": {"lat": 10.0, "lng": 20.0}},
            "conflict_polygon_metrics": {"area_sqm": 50, "perimeter_m": 50}
        })
    for i in range(5):
        conflicts.append({
            "id": f"muni_for_{i}",
            "type": "overlap",
            "location_centroid": {"lat": 30.0, "lng": 40.0},
            "source_a": {"name": "Municipal", "centroid": {"lat": 30.0, "lng": 40.0}},
            "source_b": {"name": "Forest", "centroid": {"lat": 30.0, "lng": 40.0}},
            "conflict_polygon_metrics": {"area_sqm": 50, "perimeter_m": 50}
        })
        
    res = client.post("/api/v1/cluster", json={"conflicts": conflicts})
    assert res.status_code == 200
    clusters = res.json()["clusters"]
    found_systemic = any(c["root_cause_hypothesis"] == "Systemic Source Mismatch" for c in clusters)
    assert not found_systemic

def test_systemic_source_mismatch_test_c():
    conflicts = []
    for i in range(2):
        conflicts.append({
            "id": f"rev_sur_{i}",
            "type": "overlap",
            "location_centroid": {"lat": 10.0, "lng": 20.0},
            "source_a": {"name": "Revenue", "centroid": {"lat": 10.0, "lng": 20.0}},
            "source_b": {"name": "Survey", "centroid": {"lat": 10.0, "lng": 20.0}},
            "conflict_polygon_metrics": {"area_sqm": 50, "perimeter_m": 50}
        })
        
    res = client.post("/api/v1/cluster", json={"conflicts": conflicts})
    assert res.status_code == 200
    clusters = res.json()["clusters"]
    found_systemic = any(c["root_cause_hypothesis"] == "Systemic Source Mismatch" for c in clusters)
    assert not found_systemic

def test_systemic_source_mismatch_test_d_order_independence():
    conflicts = []
    for i in range(9):
        a_name = "Survey" if i % 2 == 0 else "Revenue"
        b_name = "Revenue" if i % 2 == 0 else "Survey"
        conflicts.append({
            "id": f"rev_sur_{i}",
            "type": "overlap",
            "location_centroid": {"lat": 10.0 + (i * 0.1), "lng": 20.0},
            "source_a": {"name": a_name, "centroid": {"lat": 10.0, "lng": 20.0}},
            "source_b": {"name": b_name, "centroid": {"lat": 10.0, "lng": 20.0}},
            "conflict_polygon_metrics": {"area_sqm": 50, "perimeter_m": 50}
        })
    conflicts.append({
        "id": "muni_for_0",
        "type": "overlap",
        "location_centroid": {"lat": 30.0, "lng": 40.0},
        "source_a": {"name": "Municipal", "centroid": {"lat": 30.0, "lng": 40.0}},
        "source_b": {"name": "Forest", "centroid": {"lat": 30.0, "lng": 40.0}},
        "conflict_polygon_metrics": {"area_sqm": 50, "perimeter_m": 50}
    })
    
    res = client.post("/api/v1/cluster", json={"conflicts": conflicts})
    assert res.status_code == 200
    clusters = res.json()["clusters"]
    found_systemic = any(c["root_cause_hypothesis"] == "Systemic Source Mismatch" for c in clusters)
    assert found_systemic
