import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CenteredFamilyTree from './CenteredFamilyTree';
import LeftPanel from '../common/LeftPanel';
import './ViewTree.css';
import Persons from '../person/persons'

function ViewTree() {
  const [persons, setPersons] = useState([]);
  const [selectedPersonId, setSelectedPersonId] = useState(() => {
    try {
      return localStorage.getItem('familyTree_selectedPersonId') || null;
    } catch (error) {
      console.warn('Failed to read selectedPersonId from localStorage:', error);
      return null;
    }
  });
  const [selectedTreeId, setSelectedTreeId] = useState(null);
  const [selectedTreeData, setSelectedTreeData] = useState(null);
  const [editingPersonId, setEditingPersonId] = useState(null);
  const [editingPerson, setEditingPerson] = useState(null);
  const [showPersonsPanel, setShowPersonsPanel] = useState(false);
  const [panelMode, setPanelMode] = useState('edit'); // 'edit' or 'view'

  const navigate = useNavigate();

  // When selectedPersonId changes, save to localStorage
  useEffect(() => {
    if (selectedPersonId) {
      try {
        localStorage.setItem('familyTree_selectedPersonId', selectedPersonId);
      } catch (error) {
        console.warn('Failed to save selectedPersonId to localStorage:', error);
      }
    } else {
      try {
        localStorage.removeItem('familyTree_selectedPersonId');
      } catch (error) {
        console.warn('Failed to remove selectedPersonId from localStorage:', error);
      }
    }
  }, [selectedPersonId]);

  // Validate that selected person exists in current tree
  useEffect(() => {
    if (selectedPersonId && persons.length > 0) {
      const personExists = persons.some(p => p.personId === selectedPersonId);
      if (!personExists) {
        setSelectedPersonId(null);
      }
    }
  }, [selectedPersonId, persons]);

  // Handle tree selection from TreeListSidebar
  const handleTreeSelect = useCallback((treeId, personsFromTree) => {
    console.log('Tree selected:', treeId);
    
    // Find the complete tree data from cached trees
    const cachedTreesData = localStorage.getItem('familyTree_cachedTrees');
    let selectedTree = null;
    
    if (cachedTreesData) {
      try {
        const parsedCache = JSON.parse(cachedTreesData);
        selectedTree = parsedCache.trees?.find(tree => tree.treeId === treeId);
      } catch (error) {
        console.warn('Failed to parse cached tree data:', error);
      }
    }
    
    setSelectedTreeId(treeId);
    setSelectedTreeData(selectedTree);
    setPersons(personsFromTree);
    
    // Clear selected person if it doesn't exist in the new tree
    if (selectedPersonId) {
      const personExistsInNewTree = personsFromTree.some(p => p.personId === selectedPersonId);
      if (!personExistsInNewTree) {
        setSelectedPersonId(null);
      }
    }
  }, [selectedPersonId]);

  // Handle person selection from PersonListSidebar
  const handlePersonSelect = useCallback((person) => {
    if (!person) {
      console.error('Person object is undefined!');
      return;
    }
    
    if (!person.personId) {
      console.error('Person object missing personId:', person);
      return;
    }
    
    console.log('Person selected from sidebar:', person.firstName, person.lastName, 'ID:', person.personId);
    setSelectedPersonId(person.personId);
  }, []);

  // Handle person selection from CenteredFamilyTree
  const handleTreePersonSelect = useCallback((person) => {
    console.log('Person selected from tree:', person.firstName, person.lastName, 'ID:', person.personId);
    setSelectedPersonId(person.personId);
  }, []);

  // Handle viewing person details from tree node view icon
  const handleViewPerson = useCallback((person) => {
    if (person) {
      console.log('View person from tree node:', person.firstName, person.lastName);
      setEditingPersonId(person.personId);
      setEditingPerson(person);
      setPanelMode('view');
      setShowPersonsPanel(true);
    } else {
      // Fallback - navigate to persons page if no person provided
      navigate('/persons');
    }
  }, [navigate]);

  // Handle person edit from PersonListSidebar - open Persons component as sliding panel
  const handlePersonEdit = useCallback((person) => {
    console.log('Edit person:', person.firstName, person.lastName);
    setEditingPersonId(person.personId);
    setEditingPerson(person);
    setPanelMode('edit');
    setShowPersonsPanel(true);
  }, []);

  const handleClosePersonsPanel = () => {
    setEditingPersonId(null);
    setEditingPerson(null);
    setShowPersonsPanel(false);
    setPanelMode('edit');
  };

  const handlePersonSave = (updatedPerson) => {
    console.log('Person updated:', updatedPerson);
    
    // Update the persons array
    setPersons(prevPersons => 
      prevPersons.map(person => 
        person.personId === updatedPerson.personId ? updatedPerson : person
      )
    );
    
    // TODO: Save to local storage or call TreeListSidebar update function
    
    // Close the persons panel
    handleClosePersonsPanel();
  };

  // Find the selected person object
  const selectedPerson = persons.find(p => p.personId === selectedPersonId) || null;

  return (
    <div className="view-tree-layout">
      {/* Left Panel - Contains both Tree List and Person List */}
      <LeftPanel 
        onTreeSelect={handleTreeSelect}
        selectedTreeId={selectedTreeId}
        persons={persons}
        onPersonSelect={handlePersonSelect}
        selectedPersonId={selectedPersonId}
        onPersonEdit={handlePersonEdit}
      />

      {/* Main Content - Family Tree */}
      <main className="tree-content">
        <div className="page-header">
          <h1>Family Tree</h1>
          {selectedTreeData && (
            <div className="tree-info-header">
              <span className="current-tree">{selectedTreeData.treeName}</span>
              <span className="member-count">({selectedTreeData.memberCount} members)</span>
            </div>
          )}
        </div>

        {selectedPerson && persons.length > 0 ? (
          <CenteredFamilyTree
            person={selectedPerson}
            people={persons}
            width={1000}
            height={600}
            onSelect={handleTreePersonSelect}
            onViewPerson={handleViewPerson}
          />
        ) : (
          <div className="no-selection">
            {selectedTreeData ? (
              persons.length > 0 ? (
                <p>Please select a person from the "{selectedTreeData.treeName}" tree to view the family tree.</p>
              ) : (
                <p>No persons found in the "{selectedTreeData.treeName}" tree.</p>
              )
            ) : (
              <p>Please select a family tree to begin.</p>
            )}
          </div>
        )}
      </main>

      {/* Sliding Persons Panel */}
      {showPersonsPanel && editingPerson && (
        <div className="sliding-persons-panel">
          <div className="persons-panel-overlay" onClick={handleClosePersonsPanel}></div>
          <div className="persons-panel-content">
            <div className={`persons-panel-header ${panelMode}-mode`}>
              <h2>
                {panelMode === 'view' ? 'View Person' : 'Edit Person'}: {editingPerson.firstName} {editingPerson.lastName}
              </h2>
              <button 
                className="close-panel-btn" 
                onClick={handleClosePersonsPanel}
                title="Close panel (Esc)"
              >
                ✕
              </button>
            </div>
            <div className="persons-panel-body">
              <Persons 
                selectedPerson={editingPerson}
                onPersonSave={handlePersonSave}
                isEmbedded={true}
                mode={panelMode}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewTree;
