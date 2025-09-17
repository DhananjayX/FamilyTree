import React, { useState, useEffect } from 'react';
import SmallButton from '../common/SmallButton.jsx';
import '../common/formcard.css';

const EditPersonForm = ({ person = {}, persons = [], onSave, onCancel }) => {
  const [form, setForm] = useState({ ...person });

  useEffect(() => setForm({ ...person }), [person]);

  const availablePersons = (persons || []).filter(p => p.personId !== person.personId);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave({ ...form, personId: person.personId });
  };

  return (
  <div className="form-card compact">
      <h3>Edit Person</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-two">
          <div className="form-row"><label>First Name:</label><input name="firstName" value={form.firstName || ''} onChange={handleChange} required /></div>
          <div className="form-row"><label>Last Name:</label><input name="lastName" value={form.lastName || ''} onChange={handleChange} required /></div>
        </div>
        <div className="form-row">
          <label>Gender:</label>
          <select name="gender" value={form.gender || ''} onChange={handleChange}>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-two">
          <div className="form-row"><label>Date of Birth:</label><input name="dob" type="date" value={form.dob || ''} onChange={handleChange} /></div>
          <div className="form-row"><label>Date of Death:</label><input name="dod" type="date" value={form.dod || ''} onChange={handleChange} /></div>
        </div>
        <div className="form-row"><label>Address:</label><input name="address" value={form.address || ''} onChange={handleChange} /></div>
        <div className="form-row"><label>Notes:</label><input name="notes" value={form.notes || ''} onChange={handleChange} /></div>
        <div className="form-two">
          <div className="form-row">
            <label>Mother:</label>
            <select name="motherId" value={form.motherId || ''} onChange={handleChange}>
              <option value="">-- None --</option>
              {availablePersons.filter(p => p.gender === 'female').map(p => (
                <option key={p.personId} value={p.personId}>{p.firstName} {p.lastName}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Father:</label>
            <select name="fatherId" value={form.fatherId || ''} onChange={handleChange}>
              <option value="">-- None --</option>
              {availablePersons.filter(p => p.gender === 'male').map(p => (
                <option key={p.personId} value={p.personId}>{p.firstName} {p.lastName}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-actions">
          <SmallButton type="submit" variant="primary">Save</SmallButton>
          <SmallButton type="button" variant="neutral" onClick={onCancel} className="form-cancel">Cancel</SmallButton>
        </div>
      </form>
    </div>
  );
};

export default EditPersonForm;
