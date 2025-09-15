import React, { useState } from 'react';
import { calculateAge, getParents, getChildren, getSiblings, getSpouses } from '../../utils/familyUtils.js';
import AddSpouseForm from './addspouseform.jsx';

const PersonDetails = ({ person, persons, onEdit, onDelete, onEditSpouse, onAddSpouse }) => {
  const [showAddSpouse, setShowAddSpouse] = useState(false);
  const [editSpouseIdx, setEditSpouseIdx] = useState(null);

  if (!person) return <div>Select a person to view details.</div>;

  const age = calculateAge(person.dob, person.dod);
  const parents = getParents(person, persons);
  const children = getChildren(person.personId, persons);
  const siblings = getSiblings(person, persons);
  const spouses = getSpouses(person, persons);

  // Handler for adding or editing spouse
  const handleAddSpouse = () => setShowAddSpouse(true);
  const handleEditSpouse = idx => setEditSpouseIdx(idx);
  const handleSpouseFormClose = () => {
    setShowAddSpouse(false);
    setEditSpouseIdx(null);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>
  {person.firstName} {person.lastName} {age !== null ? `(${age})` : ''}
        <button style={{ marginLeft: 16 }} onClick={() => onEdit && onEdit(person.personId)}>Edit</button>
        <button style={{ marginLeft: 8, color: 'red' }} onClick={() => onDelete && onDelete(person.personId)}>Delete</button>
      </h2>
  <div><strong>Gender:</strong> {person.gender ? person.gender.charAt(0).toUpperCase() + person.gender.slice(1) : '-'}</div>
      <div><strong>Date of Birth:</strong> {person.dob || '-'}</div>
      <div><strong>Date of Death:</strong> {person.dod || '-'}</div>
      <div><strong>Address:</strong> {person.address || '-'}</div>
      <div><strong>Notes:</strong> {person.notes || '-'}</div>
      <div style={{ marginTop: 16 }}>
        <strong>Parents:</strong>
        <ul>
          {parents.length ? parents.map(p => (
            <li key={p.personId}>{p.firstName} {p.lastName}</li>
          )) : <li>None</li>}
        </ul>
      </div>
      <div>
        <strong>Spouses:</strong>
        <button style={{ marginLeft: 8 }} onClick={handleAddSpouse}>Add Spouse</button>
        <ul style={{ listStyleType: 'disc', paddingLeft: 24 }}>
          {(person.spouses && person.spouses.length) ? person.spouses.map((sp, idx) => {
            // Find spouse person object
            const spousePerson = persons.find(p => p.personId === sp.spouseId);
            return (
              <li key={sp.spouseId} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {editSpouseIdx === idx ? (
                    <AddSpouseForm
                      person={person}
                      persons={persons}
                      mode="edit"
                      spouse={sp}
                      onAddSpouse={() => {}}
                      onEditSpouse={(updatedSpouse) => {
                        if (onEditSpouse) onEditSpouse(person.personId, idx, updatedSpouse);
                        handleSpouseFormClose();
                      }}
                      onCancel={handleSpouseFormClose}
                    />
                  ) : (
                    <>
                      <span style={{ fontWeight: 500 }}>
                        {spousePerson ? `${spousePerson.firstName} ${spousePerson.lastName}` : `Spouse ID: ${sp.spouseId}`}
                      </span>
                      <button style={{ marginLeft: 8 }} onClick={() => handleEditSpouse(idx)}>Edit Spouse</button>
                      <button
                        style={{ marginLeft: 8, color: 'red' }}
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this spouse?')) {
                            if (onEditSpouse) onEditSpouse(person.personId, idx, null, sp.spouseId);
                          }
                        }}
                      >
                        Delete Spouse
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          }) : <li>None</li>}
        </ul>
        {showAddSpouse && (
          <AddSpouseForm
            person={person}
            persons={persons}
            mode="add"
            onAddSpouse={(spouseData) => {
              if (onAddSpouse) onAddSpouse(person.personId, spouseData);
              handleSpouseFormClose();
            }}
            onEditSpouse={() => {}}
            onCancel={handleSpouseFormClose}
          />
        )}
      </div>
      <div>
        <strong>Children:</strong>
        <ul>
          {children.length ? children.map(c => (
            <li key={c.personId}>{c.firstName} {c.lastName}</li>
          )) : <li>None</li>}
        </ul>
      </div>
      <div>
        <strong>Siblings:</strong>
        <ul>
          {siblings && siblings.length > 0 ? (
            siblings.map(s => (
              <li key={s.personId}>{s.firstName} {s.lastName}</li>
            ))
          ) : (
            <li>None</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PersonDetails;
