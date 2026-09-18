const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function simulateIngestion(mode, file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/ingest`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Ingestion failed on backend server.');
  }

  const data = await response.json();
  return { summary: data.message, count: 1 };
}

export async function simulateConflictEngine() {
  const response = await fetch(`${API_BASE}/run-conflict-engine`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    throw new Error('Engine execution failed');
  }

  return await response.json();
}