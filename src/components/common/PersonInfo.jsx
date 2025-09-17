import React from 'react';
import { calculateAge } from '../../utils/familyUtils.js';
import SmallButton from './SmallButton.jsx';
import './PersonInfo.css';

const PersonInfo = ({ person, onEdit, onDelete }) => {
  if (!person) return null;
  const age = calculateAge(person.dob, person.dod);

  return (
    <div className="person-info-card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2>{person.firstName} {person.lastName} {age !== null ? `(${age})` : ''}</h2>
        <div>
          <SmallButton onClick={() => onEdit && onEdit(person.personId)} variant="primary" className="small-btn-xs">Edit</SmallButton>
          <SmallButton onClick={() => onDelete && onDelete(person.personId)} variant="danger" className="small-btn-xs" style={{ marginLeft: 8 }}>Remove</SmallButton>
        </div>
      </div>

      <div className="person-info-rows">
        <div className="person-info-row"><strong>Gender:</strong><span>{person.gender ? person.gender.charAt(0).toUpperCase() + person.gender.slice(1) : '-'}</span></div>
        <div className="person-info-row"><strong>DOB:</strong><span>{person.dob || '-'}</span></div>
        <div className="person-info-row"><strong>DOD:</strong><span>{person.dod || '-'}</span></div>
        <div className="person-info-row"><strong>Address:</strong><span>{person.address || '-'}</span></div>
        {person.notes ? <div className="person-info-row person-info-notes"><strong>Notes:</strong><span>{person.notes}</span></div> : null}
      </div>
    </div>
  );
};

export default PersonInfo;
