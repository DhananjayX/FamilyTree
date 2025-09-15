import React, { useState } from 'react';

const GENDER_OPTIONS = [
  { value: '', label: 'Select Gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
];

const EditPersonForm = ({ person, persons, onSave, onCancel }) => {
  const [form, setForm] = useState({ ...person });

  // Filter available persons for parent selection (exclude self)
  const availablePersons = persons.filter(p => p.personId !== person.personId);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: '1rem auto', maxWidth: 500, textAlign: 'left' }}>
      <div><label>First Name:</label><input name="firstName" value={form.firstName} onChange={handleChange} required /></div>
      <div><label>Last Name:</label><input name="lastName" value={form.lastName} onChange={handleChange} required /></div>
      <div>
        <label>Gender:</label>
        <select name="gender" value={form.gender} onChange={handleChange} required>
          {GENDER_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div><label>Date of Birth:</label><input name="dob" type="date" value={form.dob} onChange={handleChange} required /></div>
      <div><label>Date of Death:</label><input name="dod" type="date" value={form.dod} onChange={handleChange} /></div>
      <div><label>Address:</label><input name="address" value={form.address} onChange={handleChange} /></div>
      <div><label>Notes:</label><input name="notes" value={form.notes} onChange={handleChange} /></div>
      <div>
        <label>Mother ID:</label>
        <select name="motherId" value={form.motherId || ''} onChange={handleChange}>
          <option value="">Select Mother</option>
          {availablePersons.filter(p => p.gender === 'female').map(p => (
            <option key={p.personId} value={p.personId}>{p.firstName} {p.lastName}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Father ID:</label>
        <select name="fatherId" value={form.fatherId || ''} onChange={handleChange}>
          <option value="">Select Father</option>
          {availablePersons.filter(p => p.gender === 'male').map(p => (
            <option key={p.personId} value={p.personId}>{p.firstName} {p.lastName}</option>
          ))}
        </select>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel} style={{ marginLeft: 8 }}>Cancel</button>
      </div>
    </form>
  );
};

export default EditPersonForm;
