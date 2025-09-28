import React, { useState, useEffect } from 'react';
import PersonListSidebar from '../person/personlistsidebar.jsx';
import CenteredFamilyTree from './CenteredFamilyTree.jsx';
import ErrorBoundary from '../common/ErrorBoundary.jsx';
import { usePersonsData } from '../../hooks/usePersonsData.js';

const ViewTree = () => {
	// Use the custom hook for persons data management
	const { persons, loading, error, treeMetadata, refreshData } = usePersonsData();
	
	// Initialize selected person from localStorage or null
	const [selectedPersonId, setSelectedPersonId] = useState(() => {
		try {
			return localStorage.getItem('familyTree_selectedPersonId') || null;
		} catch (error) {
			console.warn('Failed to read selectedPersonId from localStorage:', error);
			return null;
		}
	});

	// Save selectedPersonId to localStorage whenever it changes
	useEffect(() => {
		try {
			if (selectedPersonId) {
				localStorage.setItem('familyTree_selectedPersonId', selectedPersonId);
			} else {
				localStorage.removeItem('familyTree_selectedPersonId');
			}
		} catch (error) {
			console.warn('Failed to save selectedPersonId to localStorage:', error);
		}
	}, [selectedPersonId]);

	// Validate that the stored selectedPersonId exists in the current persons list
	useEffect(() => {
		if (selectedPersonId && persons.length > 0) {
			const personExists = persons.some(p => p.personId === selectedPersonId);
			if (!personExists) {
				// If stored person doesn't exist in current data, clear the selection
				setSelectedPersonId(null);
			}
		}
	}, [selectedPersonId, persons]);

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

	const selectedPerson = persons.find(p => p.personId === selectedPersonId) || null;

	return (
		<div style={{ display: 'flex', height: '100%' }}>
			<PersonListSidebar persons={persons} onSelect={setSelectedPersonId} selectedId={selectedPersonId} />
			<div style={{ flex: 1, padding: '1rem' }}>
				<h2 style={{ marginTop: 0 }}>
					{treeMetadata?.treeName || 'Family Tree'}
				</h2>
				{/* <div style={{ marginBottom: 8, fontSize: 13, color: '#444' }}>
					<strong>Persons:</strong> {persons.length} loaded
					{treeMetadata && (
						<span style={{ marginLeft: 12, color: '#777' }}>
							Tree: {treeMetadata.treeId}
						</span>
					)}
					{persons.length > 0 && <span style={{ marginLeft: 12, color: '#777' }}>Selected: {selectedPersonId || 'none'}</span>}
				</div> */}
				{selectedPerson ? (
					<ErrorBoundary>
						{/* debug: show selected person JSON for local inspection */}
						{/* <div style={{ marginBottom: 8, fontSize: 12, color: '#333' }}>
							<details>
								<summary style={{ cursor: 'pointer' }}>Selected person (debug)</summary>
								<pre style={{ maxHeight: 200, overflow: 'auto' }}>{JSON.stringify(selectedPerson, null, 2)}</pre>
							</details>
						</div> */}
						<CenteredFamilyTree person={selectedPerson} people={persons} />
					</ErrorBoundary>
				) : (
					<div style={{ color: '#666', padding: '1rem' }}>Select a person from the list to view their family tree.</div>
				)}
			</div>
		</div>
	);
};

export default ViewTree;
