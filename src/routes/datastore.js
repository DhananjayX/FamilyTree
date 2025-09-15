// src/routes/datastore.js
// Utility functions for saving/loading person data to localStorage and backend

// Save persons array to localStorage
export function savePersonsToLocal(persons) {
  localStorage.setItem('familytree_persons', JSON.stringify(persons));
}

// Load persons array from localStorage
export function loadPersonsFromLocal() {
  const data = localStorage.getItem('familytree_persons');
  return data ? JSON.parse(data) : null;
}

// Save persons array to backend (familydata.json via API)
export async function savePersonsToBackend(persons) {
  // You should have an API endpoint to handle this POST/PUT
  // Example: POST /api/saveFamilyData
  const response = await fetch('/api/saveFamilyData', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ persons })
  });
  if (!response.ok) throw new Error('Failed to save to backend');
  return await response.json();
}

// Optionally, add a function to auto-save before unload
export function setupAutoSave(personsGetter) {
  window.addEventListener('beforeunload', () => {
    savePersonsToLocal(personsGetter());
  });
}
