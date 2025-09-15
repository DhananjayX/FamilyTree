import React, { useState, useEffect } from 'react';
import PersonListSidebar from '../person/personlistsidebar.jsx';
import CenteredFamilyTree from './CenteredFamilyTree.jsx';
import ErrorBoundary from '../common/ErrorBoundary.jsx';
import { loadPersonsFromLocal } from '../../routes/datastore.js';
import { initialPersons as fallbackInitial } from '../person/persons.jsx';

const ViewTree = () => {
	const [persons, setPersons] = useState([]);
	const [selectedPersonId, setSelectedPersonId] = useState(null);

	useEffect(() => {
		const p = loadPersonsFromLocal() || fallbackInitial || [];
		setPersons(p);
		// Do not auto-select any person on load; wait for user click
	}, []);

	const selectedPerson = persons.find(p => p.personId === selectedPersonId) || null;

	return (
		<div style={{ display: 'flex', height: '100%' }}>
			<PersonListSidebar persons={persons} onSelect={setSelectedPersonId} selectedId={selectedPersonId} />
			<div style={{ flex: 1, padding: '1rem' }}>
				<h2 style={{ marginTop: 0 }}>Family Tree</h2>
				<div style={{ marginBottom: 8, fontSize: 13, color: '#444' }}>
					<strong>Persons:</strong> {persons.length} loaded
					{persons.length > 0 && <span style={{ marginLeft: 12, color: '#777' }}>Selected: {selectedPersonId || 'none'}</span>}
				</div>
				{selectedPerson ? (
					<ErrorBoundary>
						{/* debug: show selected person JSON for local inspection */}
						<div style={{ marginBottom: 8, fontSize: 12, color: '#333' }}>
							<details>
								<summary style={{ cursor: 'pointer' }}>Selected person (debug)</summary>
								<pre style={{ maxHeight: 200, overflow: 'auto' }}>{JSON.stringify(selectedPerson, null, 2)}</pre>
							</details>
						</div>
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
