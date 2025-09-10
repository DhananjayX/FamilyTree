import { useState, useEffect } from 'react';
import MemberLite from './MemberLite';
import AddMember from './addmember';
import TreesPanel from './treespanel';
import config from '../../../config/dev.config';
import memberslabels from '../../labels/memberslabels';
import './members.css';

function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [treeId, setTreeId] = useState(config.app.defaultTreeId);

  useEffect(() => {
    fetchMembers();
  }, [treeId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${config.api.baseUrl}/members/${treeId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch members: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if response has success property and data array
      if (data.success && Array.isArray(data.data)) {
        setMembers(data.data);
      } else if (Array.isArray(data)) {
        setMembers(data);
      } else {
        console.error('Unexpected response format:', data);
        setError('Invalid response format from server');
        setMembers([]);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching members:', err);
      setMembers([]); // Ensure members is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = (memberData) => {
    // Add the new member to the existing members list
    setMembers(prev => [...prev, memberData]);
    setShowAddForm(false);
  };

  const handleTreeChange = (newTreeId) => {
    setTreeId(newTreeId);
    setShowAddForm(false); // Close add form when switching trees
  };

  const filteredAndSortedMembers = () => {
    // Ensure members is an array
    const membersArray = Array.isArray(members) ? members : [];
    
    // Simply return all members sorted by name (default)
    const sorted = [...membersArray].sort((a, b) => {
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    });

    return sorted;
  };

  if (loading) {
    return (
      <div className="members-page">
        <TreesPanel 
          selectedTreeId={treeId}
          onTreeSelect={handleTreeChange}
        />
        <div className="members-container">
          <div className="members-loading">
            <div className="loading-spinner"></div>
            <p>{memberslabels.messages.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="members-page">
        <TreesPanel 
          selectedTreeId={treeId}
          onTreeSelect={handleTreeChange}
        />
        <div className="members-container">
          <div className="members-error">
            <div className="error-title">{memberslabels.messages.errorTitle}</div>
            <p>{error}</p>
            <button onClick={fetchMembers} className="retry-button">
              {memberslabels.buttons.retry}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const processedMembers = filteredAndSortedMembers();

  return (
    <div className="members-page">
      {/* Trees Panel */}
      <TreesPanel 
        selectedTreeId={treeId}
        onTreeSelect={handleTreeChange}
      />
      
      {/* Main Content */}
      <div className="members-container">
        <div className="members-header">
          <div className="members-title">{memberslabels.header.title} </div>
          <p className="tree-info">{memberslabels.header.treeInfo(treeId, Array.isArray(members) ? members.length : 0)}</p>
          
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="add-member-btn"
          >
            {showAddForm ? memberslabels.buttons.cancel : memberslabels.buttons.addMember}
          </button>
        </div>

        {/* Add Member Form */}
        {showAddForm && (
          <AddMember 
            treeId={treeId}
            onMemberAdded={handleAddMember}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Members Display */}
        {processedMembers.length === 0 ? (
          <div className="no-members">
            <p>{memberslabels.messages.noMembers}</p>
          </div>
        ) : (
          <>
                   
            <div className="members-grid">
              {processedMembers.map(member => (
                <MemberLite key={member.memberId} member={member} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Members;
