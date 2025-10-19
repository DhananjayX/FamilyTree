import React from 'react';
import TreeListSidebar from './TreeListSidebar';
import PersonListSidebar from '../person/personlistsidebar';
import './LeftPanel.css';

const LeftPanel = ({ 
  onTreeSelect, 
  selectedTreeId, 
  persons, 
  onPersonSelect, 
  selectedPersonId,
  onPersonEdit 
}) => {
  return (
    <div className="left-panel">
      {/* Tree List Section */}
      <div className="tree-list-section">
        <TreeListSidebar 
          onTreeSelect={onTreeSelect}
          selectedTreeId={selectedTreeId}
        />
      </div>
      
      {/* Person List Section */}
      <div className="person-list-section">
        <PersonListSidebar
          persons={persons}
          onSelect={onPersonSelect}
          selectedId={selectedPersonId}
          onEdit={onPersonEdit}
        />
      </div>
    </div>
  );
};

export default LeftPanel;