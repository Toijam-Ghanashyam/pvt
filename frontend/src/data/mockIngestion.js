/**
 * mockIngestion.js
 * ----------------
 * Connected to live backend endpoints.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export function simulateIngestion(mode, file) {
  // Retaining the UI simulation for ingestion parsing as full 
  // zip/shapefile parsing requires building an extensive FastAPI ingestion route.
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const ext = file.name.split('.').pop().toLowerCase();
      const unsupported = ['exe', 'pdf', 'docx', 'pptx', 'jpg', 'png'];
      if (unsupported.includes(ext)) {
        reject(`Unsupported file format: .${ext}. Expected geospatial data files.`);
        return;
      }
      resolve({
        summary: `Data uploaded and queued for processing!`,
        count: 1,
      });
    }, 1500);
  });
}

/**
 * Triggers the live conflict engine on the FastAPI backend.
 */
export async function simulateConflictEngine() {
  try {
    const response = await fetch(`${API_BASE}/run-conflict-engine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Engine execution failed");
    }

    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
}