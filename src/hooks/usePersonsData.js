import { useState, useEffect } from 'react';
import config from '../config/index.js';
import { loadPersonsFromLocal } from '../routes/datastore.js';

// Dummy initial data (fallback only)
export const initialPersons = [
  {
    personId: 'p1',
    firstName: 'John',
    lastName: 'Doe',
    gender: 'male',
    dob: '1950-05-20',
    dod: null,
    address: '123 Main St, City',
    notes: 'Loved gardening',
    spouses: []
  }
];

// Function to load persons from server
const loadPersonsFromServer = async (treeId = config.app.defaultTreeId) => {
  try {
    console.log('Loading persons from server for tree:', treeId);
    const response = await fetch(`${config.api.baseUrl}/tree/${treeId}`);
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      // Handle new tree structure with treeData wrapper
      if (data.persons && data.persons.treeData) {
        console.log('Loaded', data.persons.treeData.length, 'persons from server (new format)');
        return data.persons.treeData;
      }
      // Handle direct persons array (old format fallback)
      else if (Array.isArray(data.persons)) {
        console.log('Loaded', data.persons.length, 'persons from server (old format)');
        return data.persons;
      }
      // Handle case where persons is the tree object itself
      else if (data.persons && data.persons.treeId) {
        const treeObject = data.persons;
        if (Array.isArray(treeObject.treeData)) {
          console.log('Loaded', treeObject.treeData.length, 'persons from server (tree object format)');
          return treeObject.treeData;
        }
      }
    }
    
    console.warn('Server response format unexpected:', data);
    return null;
  } catch (error) {
    console.error('Failed to load persons from server:', error);
    return null;
  }
};

// Custom hook for loading persons data
export const usePersonsData = (treeId = config.app.defaultTreeId) => {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [treeMetadata, setTreeMetadata] = useState(null);

  // Initialize data from server on component mount
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try to load from server first
        const response = await fetch(`${config.api.baseUrl}/tree/${treeId}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.persons) {
            // Extract tree metadata
            const metadata = {
              treeId: data.persons.treeId,
              treeName: data.persons.treeName,
              creatorEmailId: data.persons.creatorEmailId,
              createDate: data.persons.createDate,
              modifyDate: data.persons.modifyDate
            };
            setTreeMetadata(metadata);
            
            // Extract persons data
            const personsData = data.persons.treeData || [];
            if (personsData.length > 0) {
              console.log('Using server data:', personsData.length, 'persons');
              setPersons(personsData);
            } else {
              // Fall back to local storage if server data is empty
              const localData = loadPersonsFromLocal();
              if (localData && localData.length > 0) {
                console.log('Using local storage data:', localData.length, 'persons');
                setPersons(localData);
              } else {
                // Last resort: use initial dummy data
                console.log('Using fallback initial data');
                setPersons(initialPersons);
              }
            }
          } else {
            throw new Error('Invalid server response format');
          }
        } else {
          throw new Error(`Server responded with ${response.status}`);
        }
      } catch (err) {
        console.error('Error initializing data:', err);
        setError(err.message);
        
        // Fall back to local storage on error
        const localData = loadPersonsFromLocal();
        if (localData && localData.length > 0) {
          setPersons(localData);
        } else {
          setPersons(initialPersons);
        }
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, [treeId]);

  // Refresh data function
  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const serverData = await loadPersonsFromServer(treeId);
      if (serverData && serverData.length > 0) {
        setPersons(serverData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    persons,
    setPersons,
    loading,
    error,
    treeMetadata,
    refreshData
  };
};