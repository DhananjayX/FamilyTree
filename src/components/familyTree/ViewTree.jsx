import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CenteredFamilyTree from './CenteredFamilyTree';
import PersonListSidebar from '../person/personlistsidebar';
import TreeListSidebar from '../common/TreeListSidebar';
import './ViewTree.css';

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
        // Person doesn't exist in current tree, clear selection
        setSelectedPersonId(null);
      }
    }
  }, [selectedPersonId, persons]);

  // Handle tree selection from TreeListSidebar
  const handleTreeSelect = (treeId, personsFromTree) => {
    console.log('🌳 ViewTree - Tree selected:', treeId);
    console.log('🌳 ViewTree - Setting selectedTreeId to:', treeId);
    
    // THIS IS CRUCIAL - make sure you're setting the selectedTreeId state
    setSelectedTreeId(treeId);
    
    // Update persons list with the tree's members
    setPersons(personsFromTree);
    
    // Clear selected person if it doesn't exist in the new tree
    if (selectedPersonId) {
      const personExistsInNewTree = personsFromTree.some(p => p.personId === selectedPersonId);
      if (!personExistsInNewTree) {
        console.log('❌ Previous selected person not in new tree, clearing selection');
        setSelectedPersonId(null);
      }
    }
  };

  // Handle person selection from PersonListSidebar
  const handlePersonSelect = (person) => {
    console.log('Person selected from sidebar:', person.firstName, person.lastName, 'ID:', person.personId);
    setSelectedPersonId(person.personId);
  };

  // Handle person selection from CenteredFamilyTree
  const handleTreePersonSelect = (person) => {
    console.log('Person selected from tree:', person.firstName, person.lastName, 'ID:', person.personId);
    setSelectedPersonId(person.personId);
  };

  // Handle viewing person details
  const handleViewPerson = () => {
    navigate('/persons');
  };

  // Find the selected person object
  const selectedPerson = persons.find(p => p.personId === selectedPersonId) || null;

  console.log('ViewTree render - selectedPersonId:', selectedPersonId, 'selectedPerson:', selectedPerson);

  return (
    <div className="view-tree-layout">
      {/* Left Panel - Contains both Tree List and Person List */}
      <div className="left-panel">
        <TreeListSidebar 
          onTreeSelect={handleTreeSelect}
          selectedTreeId={selectedTreeId}
        />
        <PersonListSidebar
          persons={persons}
          onSelect={handlePersonSelect}
          selectedId={selectedPersonId}
        />
      </div>

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
                <div>
                  <p>Please select a person from the "{selectedTreeData.treeName}" tree to view the family tree.</p>
                  <p>Available persons: {persons.length}</p>
                </div>
              ) : (
                <p>No persons found in the "{selectedTreeData.treeName}" tree.</p>
              )
            ) : (
              <p>Please select a family tree to begin.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default ViewTree;
