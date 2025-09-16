import React, { useState, useEffect, useCallback } from 'react';
import AddPersonForm from './addpersonform.jsx';
import AddSpouseForm from './addspouseform.jsx';
import EditPersonForm from './editpersonform.jsx';
import PersonListSidebar from './personlistsidebar.jsx';
import PersonDetails from './persondetails.jsx';
import { savePersonsToLocal, savePersonsToBackend, setupAutoSave } from '../../routes/datastore.js';
import { usePersonsData } from '../../hooks/usePersonsData.js';
import config from '../../config/index.js';

const Persons = () => {
  // Use the custom hook for persons data management
  const { persons, setPersons, loading, error, treeMetadata, refreshData } = usePersonsData();
  
  const [showForm, setShowForm] = useState(false);
  const [addingSpouseFor, setAddingSpouseFor] = useState(null);
  const [editingPersonId, setEditingPersonId] = useState(null);
  const [selectedPersonId, setSelectedPersonId] = useState(null);

  const handleAddPerson = (person) => {
    setPersons([...persons, { ...person, spouses: [] }]);
    setShowForm(false);
  };

  const handleAddSpouse = (personId, spouseData) => {
    setPersons(persons => persons.map(p => {
      if (p.personId === personId) {
        // Add spouse to the selected person
        return { ...p, spouses: [...(p.spouses || []), spouseData] };
      } else if (p.personId === spouseData.spouseId) {
        // Add reciprocal spouse entry to the selected spouse
        return {
          ...p,
          spouses: [
            ...(p.spouses || []),
            {
              spouseId: personId,
              marriageDate: spouseData.marriageDate,
              divorceDate: spouseData.divorceDate
            }
          ]
        };
      }
      return p;
    }));
    setAddingSpouseFor(null);
  };

  const handleEditSpouse = (personId, idx, updatedSpouse, deleteSpouseId) => {
    setPersons(persons => persons.map(p => {
      if (p.personId === personId) {
        let newSpouses = [...(p.spouses || [])];
        if (deleteSpouseId) {
          newSpouses = newSpouses.filter(s => s.spouseId !== deleteSpouseId);
        } else {
          newSpouses[idx] = updatedSpouse;
        }
        return { ...p, spouses: newSpouses };
      } else if (deleteSpouseId && p.personId === deleteSpouseId) {
        // Remove reciprocal spouse entry
        return { ...p, spouses: (p.spouses || []).filter(s => s.spouseId !== personId) };
      } else if (updatedSpouse && p.personId === updatedSpouse.spouseId) {
        // Update reciprocal spouse entry if exists
        const spouseIdx = (p.spouses || []).findIndex(s => s.spouseId === personId);
        if (spouseIdx !== -1) {
          const newSpouses = [...(p.spouses || [])];
          newSpouses[spouseIdx] = {
            spouseId: personId,
            marriageDate: updatedSpouse.marriageDate,
            divorceDate: updatedSpouse.divorceDate
          };
          return { ...p, spouses: newSpouses };
        }
      }
      return p;
    }));
  };

  const handleSavePerson = (updatedPerson) => {
    setPersons(persons => persons.map(p =>
      p.personId === updatedPerson.personId ? { ...p, ...updatedPerson } : p
    ));
    setEditingPersonId(null);
  };

  // Save to localStorage on every change
  useEffect(() => {
    savePersonsToLocal(persons);
  }, [persons]);

  // Auto-save to localStorage before unload
  useEffect(() => {
    setupAutoSave(() => persons);
  }, [persons]);

  // Save to backend (familydata.json) on every change (debounced)
  const saveToBackend = useCallback(() => {
    savePersonsToBackend(persons).catch(err => console.error('Backend save failed:', err));
  }, [persons]);

  useEffect(() => {
    const timeout = setTimeout(saveToBackend, config.app.autoSaveInterval); // debounce from config
    return () => clearTimeout(timeout);
  }, [saveToBackend]);

  // Manual save to server
  const handleManualSave = () => {
    savePersonsToBackend(persons)
      .then(() => alert('Data saved to server!'))
      .catch(err => alert('Failed to save to server: ' + err.message));
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div>
          <h3>Loading family tree data...</h3>
          <p>Fetching data from server...</p>
        </div>
      </div>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h3>Error loading data</h3>
          <p style={{ color: 'red' }}>{error}</p>
          <button onClick={refreshData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', minHeight: '80vh' }}>
      <PersonListSidebar
        persons={persons}
        onSelect={setSelectedPersonId}
        selectedId={selectedPersonId}
      />
      <div style={{ flex: 1, padding: '2rem', maxWidth: 700, margin: '0 auto' }}>
        <h2>All Persons</h2>
        <button onClick={() => setShowForm(f => !f)} style={{ marginBottom: '1rem' }}>
          {showForm ? 'Cancel' : 'Add Person'}
        </button>
        <button onClick={handleManualSave} style={{ marginLeft: 8, marginBottom: '1rem' }}>
          Save to Server
        </button>
        {/* Show nothing else on initial load */}
  {showForm && <AddPersonForm onAdd={handleAddPerson} persons={persons} />}
        {selectedPersonId && !showForm && (
          editingPersonId === selectedPersonId ? (
            <EditPersonForm
              person={persons.find(p => p.personId === selectedPersonId)}
              persons={persons}
              onSave={handleSavePerson}
              onCancel={() => setEditingPersonId(null)}
            />
          ) : (
            <PersonDetails
                person={persons.find(p => p.personId === selectedPersonId)}
                persons={persons}
                onEdit={id => setEditingPersonId(id)}
                onDelete={id => {
                  if (window.confirm('Are you sure you want to delete this person?')) {
                    setPersons(persons.filter(p => p.personId !== id));
                    setSelectedPersonId(null);
                  }
                }}
                onEditSpouse={handleEditSpouse}
                onAddSpouse={handleAddSpouse}
                onAddPerson={handleAddPerson}
                onSelectPerson={setSelectedPersonId}
              />
          )
        )}
      </div>
    </div>
  );
};

export default Persons;
