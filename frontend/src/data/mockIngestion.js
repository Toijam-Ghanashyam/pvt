import { API_BASE_URL } from '../config/api';

/**
 * Triggers the file upload endpoint on the FastAPI backend.
 */
export async function simulateIngestion(mode, file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("layer_type", mode);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Upload failed");
  }
  return await response.json();
}

/**
 * Triggers the live conflict engine on the FastAPI backend.
 */
export async function simulateConflictEngine() {
  try {
    const response = await fetch(`${API_BASE_URL}/run-conflict-engine`, {
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