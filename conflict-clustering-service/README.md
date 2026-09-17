# Conflict Root-Cause Clustering Service

This is a standalone microservice for an SIH project. It accepts a list of geospatial land/parcel conflicts and clusters them to determine the systemic "root cause" (e.g., Coordinate Transformation Issue, Source-Alignment Issue).

## Architecture
- **Language**: Python 3
- **Framework**: FastAPI
- **Algorithm**: Spatial clustering via Scikit-Learn `DBSCAN`, combined with rule-based heuristics using Euclidean distance variances and Sliver Indexes.

## Installation & Setup

1. Open your terminal in this directory.
2. Create a virtual environment (Recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

Start the FastAPI server:
```bash
python app.py
```
The API will be available at `http://localhost:8000`.

## API Usage

**Endpoint**: `POST /api/v1/cluster`

**Headers**: `Content-Type: application/json`

**Example cURL Request**:
```bash
curl -X POST http://localhost:8000/api/v1/cluster \
     -H "Content-Type: application/json" \
     -d @sample_input.json
```

## Running Tests

Run the automated pytest suite:
```bash
pytest tests/
```

## Integration Instructions for Frontend / Backend Developers
1. Run this microservice on a port (e.g., 8000).
2. From your Node.js/Java/React app, make an HTTP POST request to `http://localhost:8000/api/v1/cluster`.
3. Pass the JSON exactly as modeled in `sample_input.json`.
4. The service will return an array of clusters that you can display on a Dashboard or Map. CORS is already enabled.
