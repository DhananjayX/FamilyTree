import React, { useState } from 'react';
import SmallButton from '../common/SmallButton.jsx';
import '../common/formcard.css';

const GENDER_OPTIONS = [
  { value: '', label: 'Select Gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
];

const AddPersonForm = ({ onAdd, onCancel, persons = [], initialData = {}, requireDob = true }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    motherId: '',
    fatherId: '',
    dob: '',
    dod: '',
    address: '',
    notes: ''
  });

  // initialize from initialData when provided (useful for prefill flows like Add Sibling)
  React.useEffect(() => {
    if (initialData && Object.keys(initialData).length) {
      setForm(f => ({ ...f, ...initialData }));
    }
    // only respond to changes in initialData
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Generate a unique personId (e.g., p + timestamp)
    const personId = 'p' + Date.now();
    onAdd({ ...form, personId });
    setForm({ firstName: '', lastName: '', gender: '', dob: '', dod: '', address: '', notes: '', motherId: '', fatherId: '' });
  };

  return (
    <div className="form-card">
      <h3>Add Person</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-two">
          <div className="form-row"><label>First Name:</label><input name="firstName" value={form.firstName} onChange={handleChange} required /></div>
          <div className="form-row"><label>Last Name:</label><input name="lastName" value={form.lastName} onChange={handleChange} required /></div>
        </div>
        <div className="form-row">
          <label>Gender:</label>
          <select name="gender" value={form.gender} onChange={handleChange} required>
            {GENDER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="form-two">
          <div className="form-row"><label>Date of Birth:</label><input name="dob" type="date" value={form.dob} onChange={handleChange} required={requireDob} /></div>
          <div className="form-row"><label>Date of Death:</label><input name="dod" type="date" value={form.dod} onChange={handleChange} /></div>
        </div>
        <div className="form-row"><label>Address:</label><input name="address" value={form.address} onChange={handleChange} /></div>
        <div className="form-row"><label>Notes:</label><input name="notes" value={form.notes} onChange={handleChange} /></div>
        <div className="form-two">
          <div className="form-row">
            <label>Mother:</label>
            <select name="motherId" value={form.motherId} onChange={handleChange}>
              <option value="">-- None --</option>
              {persons.filter(p => p.gender === 'female').map(p => (
                <option key={p.personId} value={p.personId}>{p.firstName} {p.lastName}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Father:</label>
            <select name="fatherId" value={form.fatherId} onChange={handleChange}>
              <option value="">-- None --</option>
              {persons.filter(p => p.gender === 'male').map(p => (
                <option key={p.personId} value={p.personId}>{p.firstName} {p.lastName}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-actions">
          <SmallButton type="submit" variant="primary">Add Person</SmallButton>
          {typeof onCancel === 'function' && (
            <SmallButton type="button" variant="neutral" onClick={onCancel} className="form-cancel">Cancel</SmallButton>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddPersonForm;
