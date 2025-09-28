import { useState, useEffect } from 'react';
import config from '../../../config/dev.config';
import treeslabels from '../../labels/treeslabels';
import './treespanel.css';

const TreesPanel = ({ selectedTreeId, onTreeSelect, onCreateTree }) => {
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrees();
  }, []);

  const fetchTrees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${config.api.baseUrl}/trees`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch trees: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle different response formats
      if (data.success && Array.isArray(data.data)) {
        setTrees(data.data);
      } else if (Array.isArray(data)) {
        setTrees(data);
      } else {
        console.error('Unexpected trees response format:', data);
        setError('Invalid response format from server');
        setTrees([]);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching trees:', err);
      setTrees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTree = () => {
    if (onCreateTree) {
      onCreateTree();
    }
  };

  const handleTreeClick = (treeId) => {
    if (onTreeSelect) {
      onTreeSelect(treeId);
    }
  };

  if (loading) {
    return (
      <div className="trees-panel">
        <div className="trees-header">
          <div className="trees-title">{treeslabels.header.title}</div>
        </div>
        <div className="trees-loading">
          <div className="loading-spinner-small"></div>
          <p>{treeslabels.messages.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trees-panel">
        <div className="trees-header">
          <div className="trees-title">{treeslabels.header.title}</div>
        </div>
        <div className="trees-error">
          <p>{treeslabels.messages.error} {error}</p>
          <button onClick={fetchTrees} className="retry-btn-small">
            {treeslabels.buttons.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="trees-panel">
      <div className="trees-header">
        <div className="trees-title">{treeslabels.header.title}</div>
        <button onClick={handleCreateTree} className="create-tree-btn">
          {treeslabels.buttons.newTree}
        </button>
      </div>
      
      <div className="trees-list">
        {trees.length === 0 ? (
          <div className="no-trees">
            <p>{treeslabels.messages.noTrees}</p>
          </div>
        ) : (
          trees.map(tree => (
            <div 
              key={tree.treeId}
              className={`tree-item ${selectedTreeId === tree.treeId ? 'active' : ''}`}
              onClick={() => handleTreeClick(tree.treeId)}
            >
              <div className="tree-name">{tree.name || `Tree ${tree.treeId}`}</div>
              <div className="tree-info">
                <span className="tree-id">{treeslabels.treeInfo.idLabel} {tree.treeId}</span>
                {tree.memberCount && (
                  <span className="member-count">{tree.memberCount} {treeslabels.treeInfo.membersLabel}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TreesPanel;
