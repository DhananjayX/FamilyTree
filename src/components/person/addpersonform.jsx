import React, { useState } from 'react';

const GENDER_OPTIONS = [
  { value: '', label: 'Select Gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
];

const AddPersonForm = ({ onAdd, persons = [] }) => {
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Generate a unique personId (e.g., p + timestamp)
    const personId = 'p' + Date.now();
    onAdd({ ...form, personId });
    setForm({ firstName: '', lastName: '', gender: '', dob: '', dod: '', address: '', notes: '' });
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
        <label>Mother:</label>
        <select name="motherId" value={form.motherId} onChange={handleChange}>
          <option value="">-- None --</option>
          {persons.filter(p => p.gender === 'female').map(p => (
            <option key={p.personId} value={p.personId}>{p.firstName} {p.lastName}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Father:</label>
        <select name="fatherId" value={form.fatherId} onChange={handleChange}>
          <option value="">-- None --</option>
          {persons.filter(p => p.gender === 'male').map(p => (
            <option key={p.personId} value={p.personId}>{p.firstName} {p.lastName}</option>
          ))}
        </select>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <button type="submit">Add Person</button>
      </div>
    </form>
  );
};

export default AddPersonForm;
