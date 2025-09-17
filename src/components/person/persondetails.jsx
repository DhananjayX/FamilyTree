import React, { useState } from 'react';
import { calculateAge, getParents, getChildren, getSiblings, getSpouses } from '../../utils/familyUtils.js';
import AddSpouseForm from './addspouseform.jsx';
import AddPersonForm from './addpersonform.jsx';
import AddChildForm from './addchildform.jsx';

const PersonDetails = ({ person, persons, onEdit, onDelete, onEditSpouse, onAddSpouse, onAddPerson, onSelectPerson }) => {
  const [showAddSpouse, setShowAddSpouse] = useState(false);
  const [editSpouseIdx, setEditSpouseIdx] = useState(null);
  const [showAddSiblingForm, setShowAddSiblingForm] = useState(false);
  const [showAddChildForm, setShowAddChildForm] = useState(false);

  if (!person) return <div>Select a person to view details.</div>;

  const age = calculateAge(person.dob, person.dod);
  const parents = getParents(person, persons);
  const children = getChildren(person.personId, persons);
  const siblings = getSiblings(person, persons);
  const spouses = getSpouses(person, persons);

  // sort helper: prefer DOB (older first). If DOB missing, fallback to age (older first).
  const sortByDobOrAge = (a, b) => {
    const da = a && a.dob ? Date.parse(a.dob) : NaN;
    const db = b && b.dob ? Date.parse(b.dob) : NaN;
    if (!isNaN(da) && !isNaN(db)) {
      // earlier DOB => older => should come first
      return da - db;
    }
    if (!isNaN(da)) return -1;
    if (!isNaN(db)) return 1;
    // both no DOB: fallback to age (older first)
    const ageA = calculateAge(a.dob, a.dod);
    const ageB = calculateAge(b.dob, b.dod);
    const valA = (typeof ageA === 'number') ? ageA : -Infinity;
    const valB = (typeof ageB === 'number') ? ageB : -Infinity;
    return valB - valA;
  };

  const sortedChildren = [...children].sort(sortByDobOrAge);
  const sortedSiblings = [...(siblings || [])].sort(sortByDobOrAge);

  // Handler for adding or editing spouse
  const handleAddSpouse = () => setShowAddSpouse(true);
  const handleEditSpouse = idx => setEditSpouseIdx(idx);
  const handleSpouseFormClose = () => {
    setShowAddSpouse(false);
    setEditSpouseIdx(null);
  };

  const handleAddSibling = () => setShowAddSiblingForm(true);
  const handleAddSiblingClose = () => setShowAddSiblingForm(false);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>
  {person.firstName} {' '} {person.lastName} {age !== null ? `(${age})` : ''}
        <button style={{ marginLeft: 16 }} onClick={() => onEdit && onEdit(person.personId)}>Edit</button>
        <button style={{ marginLeft: 8, color: 'red' }} onClick={() => onDelete && onDelete(person.personId)}>Delete</button>
      </h2>
  <div><strong>Gender:</strong> {person.gender ? person.gender.charAt(0).toUpperCase() + person.gender.slice(1) : '-'}</div>
      <div><strong>Date of Birth:</strong> {person.dob || '-'}</div>
      <div><strong>Date of Death:</strong> {person.dod || '-'}</div>
      <div><strong>Address:</strong> {person.address || '-'}</div>
      <div><strong>Notes:</strong> {person.notes || '-'}</div>
      <div style={{ marginTop: 10 }}>
        <strong>Parents:</strong>
        <ul>
          {parents.length ? parents.map(p => (
            <li key={p.personId}>
              <button onClick={() => onSelectPerson && onSelectPerson(p.personId)} style={{ background: 'transparent', border: 'none', padding: 0, color: '#1976d2', cursor: 'pointer' }}>
                {p.firstName} {p.lastName}
              </button>
            </li>
          )) : <li>None</li>}
        </ul>
      </div>
      <div>
        <strong>Spouses:</strong>
        <button style={{ marginLeft: 8 }} onClick={handleAddSpouse}>Add Spouse</button>
        <ul style={{ listStyleType: 'disc', paddingLeft: 0 }}>
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
                      <span>
                        {spousePerson ? (
                          <button onClick={() => onSelectPerson && onSelectPerson(spousePerson.personId)} style={{ background: 'transparent', border: 'none', padding: 0, color: '#1976d2', cursor: 'pointer' }}>
                            {spousePerson.firstName} {spousePerson.lastName}
                          </button>
                        ) : (
                          `Spouse ID: ${sp.spouseId}`
                        )}
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
        <button style={{ marginLeft: 8 }} onClick={() => {
          // open add child form
          setShowAddChildForm(true);
        }}>Add Child</button>
        <ul>
          {sortedChildren.length ? sortedChildren.map(c => (
            <li key={c.personId}>
              <button onClick={() => onSelectPerson && onSelectPerson(c.personId)} style={{ background: 'transparent', border: 'none', padding: 0, color: c.dod ? 'red' : '#1976d2', cursor: 'pointer' }}>
                {c.firstName} {c.lastName} {calculateAge(c.dob, c.dod) !== null ? `(${calculateAge(c.dob, c.dod)})` : ''}
              </button>
            </li>
          )) : <li>None</li>}
        </ul>
        {showAddChildForm && (
          <AddChildForm
            parent={person}
            // pick first spouse as partner if exists
            partner={ (person.spouses && person.spouses.length) ? persons.find(p => p.personId === person.spouses[0].spouseId) : null }
            persons={persons}
            requireDob={false}
            onAdd={(newChild) => {
              // default parents are already set by AddChildForm via initialData
              if (typeof onAddPerson === 'function') {
                onAddPerson(newChild);
              } else if (onEdit) {
                onEdit(newChild);
              }
              setShowAddChildForm(false);
            }}
            onCancel={() => setShowAddChildForm(false)}
          />
        )}
      </div>
      <div>
        <strong>Siblings:</strong>
  <button style={{ marginLeft: 8 }} onClick={handleAddSibling}>Add Sibling</button>
        <ul>
          {sortedSiblings && sortedSiblings.length > 0 ? (
            sortedSiblings.map(s => (
              <li key={s.personId}>
                <button onClick={() => onSelectPerson && onSelectPerson(s.personId)} style={{ background: 'transparent', border: 'none', padding: 0, color: s.dod ? 'red' : '#1976d2', cursor: 'pointer' }}>
                  {s.firstName} {s.lastName} {calculateAge(s.dob, s.dod) !== null ? `(${calculateAge(s.dob, s.dod)})` : ''}
                </button>
              </li>
            ))
          ) : (
            <li>None</li>
          )}
        </ul>
        {showAddSiblingForm && (
          <AddPersonForm
            persons={persons}
            initialData={{ motherId: person.motherId || '', fatherId: person.fatherId || '', lastName: person.lastName || '' }}
            requireDob={false}
            onAdd={(newPerson) => {
              // merge any selected values from the form with defaults
              const prefilled = { ...newPerson };
              prefilled.motherId = newPerson.motherId || person.motherId || '';
              prefilled.fatherId = newPerson.fatherId || person.fatherId || '';
              // call the dedicated add handler if provided by parent
              if (typeof onAddPerson === 'function') {
                onAddPerson(prefilled);
              } else if (onEdit) {
                // fallback: call onEdit so caller can decide how to handle
                onEdit(prefilled);
              }
              handleAddSiblingClose();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PersonDetails;
