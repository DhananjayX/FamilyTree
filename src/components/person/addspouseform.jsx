
import React, { useState, useEffect } from 'react';
import SmallButton from '../common/SmallButton.jsx';
import '../common/formcard.css';

// mode: 'add' or 'edit', spouse: spouse object (for edit)
const AddSpouseForm = ({
  person,
  persons,
  mode = 'add',
  spouse = null,
  onAddSpouse,
  onEditSpouse,
  onDeleteSpouse,
  onCancel
}) => {
  // For add mode: filter available persons of opposite sex and not already a spouse
  const availableSpouses = persons.filter(
    p => p.personId !== person.personId && p.gender && p.gender !== person.gender && !(person.spouses || []).some(s => s.spouseId === p.personId)
  );

  // Form state
  const [spouseId, setSpouseId] = useState('');
  const [marriageDate, setMarriageDate] = useState('');
  const [divorceDate, setDivorceDate] = useState('');

  useEffect(() => {
    if (mode === 'edit' && spouse) {
      setSpouseId(spouse.spouseId);
      setMarriageDate(spouse.marriageDate || '');
      setDivorceDate(spouse.divorceDate || '');
    } else if (mode === 'add') {
      setSpouseId('');
      setMarriageDate('');
      setDivorceDate('');
    }
  }, [mode, spouse]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'add') {
      if (!spouseId) return;
      onAddSpouse({ spouseId, marriageDate, divorceDate });
    } else if (mode === 'edit') {
      onEditSpouse({ spouseId, marriageDate, divorceDate });
    }
  };

  return (
  <div className="form-card compact">
      <h3>{mode === 'add' ? 'Add Spouse' : 'Edit Spouse'}</h3>
      <form onSubmit={handleSubmit}>
        {mode === 'add' && (
          <div className="form-row">
            <label>Spouse:</label>
            <select value={spouseId} onChange={e => setSpouseId(e.target.value)} required>
              <option value="">Select Spouse</option>
              {availableSpouses.map(p => (
                <option key={p.personId} value={p.personId}>{p.firstName} {p.lastName} ({p.gender})</option>
              ))}
            </select>
          </div>
        )}
        {mode === 'edit' && (
          <div className="form-row">
            <label>Spouse Name:</label>
            <div>{(() => {
              const sp = persons.find(p => p.personId === spouseId);
              return sp ? `${sp.firstName} ${sp.lastName}` : `Spouse ID: ${spouseId}`;
            })()}</div>
          </div>
        )}
        <div className="form-row">
          <label>Marriage Date:</label>
          <input type="date" value={marriageDate} onChange={e => setMarriageDate(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Divorce Date:</label>
          <input type="date" value={divorceDate} onChange={e => setDivorceDate(e.target.value)} />
        </div>
        <div className="form-actions">
          <SmallButton type="submit" variant="primary">{mode === 'add' ? 'Add Spouse' : 'Save'}</SmallButton>
          <SmallButton type="button" variant="neutral" onClick={onCancel} className="form-cancel">Cancel</SmallButton>
        </div>
      </form>
    </div>
  );
};

export default AddSpouseForm;
