import { useState } from 'react';
import config from '../../../config/dev.config';
import memberslabels from '../../labels/memberslabels';
import './addmember.css';

const AddMember = ({ onMemberAdded, onCancel, treeId }) => {
  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    birthDate: '',
    location: '',
    occupation: '',
    relationship: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddMember = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const memberData = {
        firstName: newMember.firstName.trim(),
        lastName: newMember.lastName.trim(),
        gender: newMember.gender,
        relationship: newMember.relationship.trim(),
        treeId: treeId || config.app.defaultTreeId
      };

      // Make API call to add member
      const response = await fetch(`${config.api.baseUrl}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData)
      });

      if (!response.ok) {
        throw new Error(`Failed to add member: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Call the parent callback with the new member data
        if (onMemberAdded) {
          onMemberAdded(result.data);
        }
        
        // Reset form
        setNewMember({
          firstName: '',
          lastName: '',
          gender: '',
          birthDate: '',
          location: '',
          occupation: '',
          relationship: ''
        });

        console.log('Member added successfully:', result.data);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Failed to add member:', err);
      alert('Failed to add member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-member-form">
      <div className="form-title">{memberslabels.form.title}</div>
      <form onSubmit={handleAddMember}>
        <div className="form-row">
          <input
            type="text"
            placeholder={memberslabels.form.placeholders.firstName}
            value={newMember.firstName}
            onChange={(e) => setNewMember(prev => ({...prev, firstName: e.target.value}))}
            required
          />
          <input
            type="text"
            placeholder={memberslabels.form.placeholders.lastName}
            value={newMember.lastName}
            onChange={(e) => setNewMember(prev => ({...prev, lastName: e.target.value}))}
            required
          />
        </div>
        
        <div className="form-row">
          <select
            value={newMember.gender}
            onChange={(e) => setNewMember(prev => ({...prev, gender: e.target.value}))}
            required
          >
            <option value="">{memberslabels.form.placeholders.gender}</option>
            <option value="male">{memberslabels.form.genderOptions.male}</option>
            <option value="female">{memberslabels.form.genderOptions.female}</option>
          </select>
          
          <input
            type="date"
            placeholder={memberslabels.form.placeholders.birthDate}
            value={newMember.birthDate}
            onChange={(e) => setNewMember(prev => ({...prev, birthDate: e.target.value}))}
          />
        </div>
        
        <div className="form-row">
          <input
            type="text"
            placeholder={memberslabels.form.placeholders.location}
            value={newMember.location}
            onChange={(e) => setNewMember(prev => ({...prev, location: e.target.value}))}
          />
          <input
            type="text"
            placeholder={memberslabels.form.placeholders.occupation}
            value={newMember.occupation}
            onChange={(e) => setNewMember(prev => ({...prev, occupation: e.target.value}))}
          />
        </div>
        
        <div className="form-row">
          <input
            type="text"
            placeholder="Relationship (e.g., Father, Mother, Child)"
            value={newMember.relationship}
            onChange={(e) => setNewMember(prev => ({...prev, relationship: e.target.value}))}
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : memberslabels.buttons.submit}
          </button>
          <button 
            type="button" 
            onClick={onCancel} 
            className="cancel-btn"
            disabled={isSubmitting}
          >
            {memberslabels.buttons.cancel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMember;
