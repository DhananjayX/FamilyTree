import React from 'react';
import AddPersonForm from './addpersonform.jsx';
import '../common/formcard.css';

// Simple wrapper for AddPersonForm to represent adding a child
const AddChildForm = ({ parent, partner, persons, onAdd, requireDob = true, onCancel }) => {
  // Determine motherId/fatherId depending on parent's gender
  const motherId = parent.gender === 'female' ? parent.personId : (partner && partner.gender === 'female' ? partner.personId : '');
  const fatherId = parent.gender === 'male' ? parent.personId : (partner && partner.gender === 'male' ? partner.personId : '');

  const initialData = {
    motherId: motherId || '',
    fatherId: fatherId || '',
    lastName: parent.lastName || ''
  };

  return (
  <div className="form-card compact">
      <h3>Add Child</h3>
      <AddPersonForm
        persons={persons}
        initialData={initialData}
        requireDob={requireDob}
        onAdd={(person) => {
          if (onAdd) onAdd(person);
        }}
        onCancel={onCancel}
      />
    </div>
  );
};

export default AddChildForm;
