import './MemberLite.css';
import memberslabels from '../../labels/memberslabels';

const MemberLite = ({ member }) => {
  const getAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`member-lite-card ${member.gender === 'female' ? 'female-card' : member.gender === 'male' ? 'male-card' : ''}`}>
      <div className="member-header">
        <div className="member-avatar">
          {member.firstName && member.lastName 
            ? `${member.firstName[0]}${member.lastName[0]}` 
            : '??'}
        </div>
        <div className="member-basic-info">
          <div className="member-name">
            {member.firstName} {member.lastName}
          </div>
        </div>
      </div>

      <div className="member-details">
        <div className="detail-row">
          <span className="detail-label">{memberslabels.memberDetails.age}</span>
          <span className="detail-value">{getAge(member.birthDate)}</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">{memberslabels.memberDetails.birthDate}</span>
          <span className="detail-value">{formatDate(member.birthDate)}</span>
        </div>

        {member.deathDate && (
          <div className="detail-row">
            <span className="detail-label">{memberslabels.memberDetails.deathDate}</span>
            <span className="detail-value">{formatDate(member.deathDate)}</span>
          </div>
        )}

        <div className="detail-row">
          <span className="detail-label">{memberslabels.memberDetails.location}</span>
          <span className="detail-value">{member.location || 'N/A'}</span>
        </div>

        {member.occupation && (
          <div className="detail-row">
            <span className="detail-label">{memberslabels.memberDetails.occupation}</span>
            <span className="detail-value">{member.occupation}</span>
          </div>
        )}

        <div className="member-relationships">
          {member.fatherId && (
            <div className="relationship-tag">{memberslabels.memberDetails.relationships.father}</div>
          )}
          {member.motherId && (
            <div className="relationship-tag">{memberslabels.memberDetails.relationships.mother}</div>
          )}
          {member.spouseIds && member.spouseIds.length > 0 && (
            <div className="relationship-tag">{memberslabels.memberDetails.relationships.married}</div>
          )}
          {member.childrenIds && member.childrenIds.length > 0 && (
            <div className="relationship-tag">{memberslabels.memberDetails.relationships.children(member.childrenIds.length)}</div>
          )}
        </div>
      </div>

      <div className="member-id">
        {memberslabels.memberDetails.id} {member.memberId}
      </div>
    </div>
  );
};

export default MemberLite;
