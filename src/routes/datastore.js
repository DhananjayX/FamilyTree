// src/routes/datastore.js
// Utility functions for saving/loading person data to localStorage and backend
import config from '../config/index.js';

// Save persons array to localStorage
export function savePersonsToLocal(persons) {
  const storageKey = config?.storage?.localStorageKey || 'familytree_persons';
  localStorage.setItem(storageKey, JSON.stringify(persons));
}

// Load persons array from localStorage
export function loadPersonsFromLocal() {
  const storageKey = config?.storage?.localStorageKey || 'familytree_persons';
  const data = localStorage.getItem(storageKey);
  return data ? JSON.parse(data) : null;
}

// Save persons array to backend using new tree structure
export async function savePersonsToBackend(persons, treeId) {
  try {
    // Use config for API base URL and default tree ID
    const apiBaseUrl = config?.api?.baseUrl || 'http://localhost:3001/api';
    const defaultTreeId = config?.app?.defaultTreeId || 'tree_00000';
    const targetTreeId = treeId || defaultTreeId;
    
    // First, get the current tree data to preserve metadata
    const getResponse = await fetch(`${apiBaseUrl}/tree/${targetTreeId}`);
    
    if (!getResponse.ok) {
      throw new Error(`Failed to fetch current tree data: ${getResponse.status}`);
    }
    
    const currentTreeData = await getResponse.json();
    
    if (!currentTreeData.success) {
      throw new Error('Failed to fetch current tree data');
    }
    
    // Prepare the updated tree object with new persons data
    const updatedTree = {
      ...currentTreeData.persons,
      treeData: persons,
      modifyDate: new Date().toISOString()
    };
    
    // Save using PUT API endpoint
    const response = await fetch(`${apiBaseUrl}/tree/${targetTreeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTree)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save to backend: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Save operation failed');
    }
    
    console.log('Successfully saved persons to backend:', persons.length, 'persons');
    return result;
    
  } catch (error) {
    console.error('Error saving persons to backend:', error);
    
    // Fallback to old API if new one fails
    try {
      const fallbackResponse = await fetch('/api/saveFamilyData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persons })
      });
      
      if (!fallbackResponse.ok) {
        throw new Error('Fallback save also failed');
      }
      
      return await fallbackResponse.json();
    } catch (fallbackError) {
      console.error('Fallback save failed:', fallbackError);
      throw error; // Throw original error
    }
  }
}

// Optionally, add a function to auto-save before unload
export function setupAutoSave(personsGetter) {
  window.addEventListener('beforeunload', () => {
    savePersonsToLocal(personsGetter());
  });
}
