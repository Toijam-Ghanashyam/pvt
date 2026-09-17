from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import ClusteringRequest, ClusteringResponse, Cluster
from clustering_engine import cluster_conflicts
import uvicorn

app = FastAPI(
    title="Conflict Root-Cause Clustering API",
    description="Standalone microservice for geospatial conflict analysis.",
    version="1.0.0"
)

# CORS setup for future GIS frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok", "service": "conflict-clustering-service"}

@app.post("/api/v1/cluster", response_model=ClusteringResponse)
def cluster_endpoint(request: ClusteringRequest):
    try:
        # Deduplicate conflicts based on conflict ID
        seen_ids = set()
        unique_conflicts = []
        for c in request.conflicts:
            if c.id not in seen_ids:
                seen_ids.add(c.id)
                unique_conflicts.append(c)
        
        if not unique_conflicts:
            return ClusteringResponse(clusters=[])
        
        # Run clustering pipeline
        clusters_data = cluster_conflicts(unique_conflicts)
        
        # Convert dictionary results back to Pydantic models for validation
        clusters = [Cluster(**c_data) for c_data in clusters_data]
        
        return ClusteringResponse(clusters=clusters)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error: " + str(e))

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
