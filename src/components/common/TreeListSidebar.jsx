import React, { useState, useEffect, useRef } from 'react';
import './TreeListSidebar.css';

const TreeListSidebar = ({ onTreeSelect, selectedTreeId }) => {
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Load trees from localStorage or server on component mount
  useEffect(() => {
    loadTrees();
  }, []);

  // Auto-select first tree when trees are loaded and no tree is selected
  useEffect(() => {
    if (trees.length > 0 && !selectedTreeId) {
      const firstTree = trees[0];
      onTreeSelect(firstTree.treeId, firstTree.treeData || []);
    }
  }, [trees, selectedTreeId, onTreeSelect]);

  const loadTrees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load from localStorage first (includes both server cache and local uploads)
      const allTrees = loadAllTreesFromStorage();
      if (allTrees && allTrees.length > 0) {
        console.log('Loaded trees from localStorage:', allTrees.length, 'trees');
        setTrees(allTrees);
        setLoading(false);
        return;
      }
      
      // If no cached data, fetch from server only
      console.log('Fetching trees from server...');
      const response = await fetch('/api/trees');
      
      if (!response.ok) {
        throw new Error(`Failed to load trees: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown server error');
      }
      
      const serverTrees = result.trees || [];
      console.log('Loaded trees from server:', serverTrees.length, 'trees');
      
      // Save server trees to cache and combine with local trees
      saveServerTreesToStorage(serverTrees);
      const allTreesCombined = loadAllTreesFromStorage();
      setTrees(allTreesCombined);
      
    } catch (err) {
      console.error('Error loading trees:', err);
      setError(err.message);
      
      // Try to load from localStorage as fallback
      const allTrees = loadAllTreesFromStorage();
      if (allTrees && allTrees.length > 0) {
        console.log('Using cached trees as fallback');
        setTrees(allTrees);
        setError(`Server error: ${err.message} (using cached data)`);
      } else {
        setTrees([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAllTreesFromStorage = () => {
    const serverTrees = loadServerTreesFromStorage();
    const localTrees = loadLocalTreesFromStorage();
    
    // Combine server and local trees, avoiding duplicates
    const allTrees = [...(serverTrees || [])];
    
    if (localTrees) {
      localTrees.forEach(localTree => {
        // Only add if not already present (by treeId)
        if (!allTrees.find(tree => tree.treeId === localTree.treeId)) {
          allTrees.push({ ...localTree, isLocal: true });
        }
      });
    }
    
    return allTrees.length > 0 ? allTrees : null;
  };

  const loadServerTreesFromStorage = () => {
    try {
      const cached = localStorage.getItem('familyTree_cachedTrees');
      if (cached) {
        const parsedData = JSON.parse(cached);
        const cacheTime = parsedData.timestamp || 0;
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (now - cacheTime < maxAge) {
          return parsedData.trees || [];
        } else {
          console.log('Server cache expired, removing old data');
          localStorage.removeItem('familyTree_cachedTrees');
        }
      }
    } catch (error) {
      console.warn('Failed to load server trees from localStorage:', error);
      localStorage.removeItem('familyTree_cachedTrees');
    }
    return null;
  };

  const loadLocalTreesFromStorage = () => {
    try {
      const localTrees = localStorage.getItem('familyTree_localTrees');
      if (localTrees) {
        return JSON.parse(localTrees);
      }
    } catch (error) {
      console.warn('Failed to load local trees from localStorage:', error);
      localStorage.removeItem('familyTree_localTrees');
    }
    return null;
  };

  const saveServerTreesToStorage = (treesData) => {
    try {
      const cacheData = {
        trees: treesData,
        timestamp: Date.now()
      };
      localStorage.setItem('familyTree_cachedTrees', JSON.stringify(cacheData));
      console.log('Saved server trees to localStorage:', treesData.length, 'trees');
    } catch (error) {
      console.warn('Failed to save server trees to localStorage:', error);
    }
  };

  const saveLocalTreesToStorage = (localTrees) => {
    try {
      localStorage.setItem('familyTree_localTrees', JSON.stringify(localTrees));
      console.log('Saved local trees to localStorage:', localTrees.length, 'trees');
    } catch (error) {
      console.warn('Failed to save local trees to localStorage:', error);
    }
  };

  const handleTreeClick = (tree) => {
    if (!tree.error) {
      console.log('Selected tree:', tree.treeId, 'with', tree.memberCount, 'members', tree.isLocal ? '(Local)' : '(Server)');
      const personsFromTree = tree.treeData || [];
      console.log('Loading', personsFromTree.length, 'persons into sidebar');
      onTreeSelect(tree.treeId, personsFromTree);
    }
  };

  const handleRefresh = () => {
    // Only clear server cache, keep local trees
    localStorage.removeItem('familyTree_cachedTrees');
    console.log('Server cache cleared, reloading...');
    loadTrees();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileContent = await readFileAsText(file);
      const treeData = JSON.parse(fileContent);
      
      // Validate the tree data structure
      if (!validateTreeStructure(treeData)) {
        alert('Invalid tree file format. Please upload a valid family tree JSON file.');
        return;
      }
      
      // Generate tree ID and name
      const fileName = file.name.replace('.json', '');
      const treeId = treeData.treeId || `local_${Date.now()}`;
      const treeName = treeData.treeName || fileName || 'Uploaded Tree';
      
      // Prepare the tree object
      const newTree = {
        ...treeData,
        treeId: treeId,
        treeName: treeName,
        memberCount: Array.isArray(treeData.treeData) ? treeData.treeData.length : 0,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        isLocal: true
      };
      
      // Add to local trees
      const existingLocalTrees = loadLocalTreesFromStorage() || [];
      
      // Check for duplicate treeId
      const existingIndex = existingLocalTrees.findIndex(tree => tree.treeId === treeId);
      if (existingIndex !== -1) {
        const confirmReplace = window.confirm(`A tree with ID "${treeId}" already exists. Do you want to replace it?`);
        if (confirmReplace) {
          existingLocalTrees[existingIndex] = newTree;
        } else {
          return;
        }
      } else {
        existingLocalTrees.push(newTree);
      }
      
      // Save to localStorage
      saveLocalTreesToStorage(existingLocalTrees);
      
      // Reload all trees
      const allTrees = loadAllTreesFromStorage();
      setTrees(allTrees);
      
      console.log('Successfully uploaded tree:', treeName, 'with', newTree.memberCount, 'members');
      alert(`Successfully uploaded "${treeName}" with ${newTree.memberCount} members!`);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file: ' + error.message);
    }
    
    // Reset file input
    event.target.value = '';
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const validateTreeStructure = (treeData) => {
    // Basic validation of tree structure
    if (typeof treeData !== 'object' || treeData === null) {
      return false;
    }
    
    // Check if it has required fields or at least treeData array
    if (!Array.isArray(treeData.treeData)) {
      return false;
    }
    
    // Optional: Validate treeData array structure
    if (treeData.treeData.length > 0) {
      const firstPerson = treeData.treeData[0];
      if (!firstPerson.personId || !firstPerson.firstName) {
        return false;
      }
    }
    
    return true;
  };

  const handleDeleteLocal = (treeId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this local tree? This action cannot be undone.');
    if (!confirmDelete) return;
    
    const existingLocalTrees = loadLocalTreesFromStorage() || [];
    const updatedLocalTrees = existingLocalTrees.filter(tree => tree.treeId !== treeId);
    
    saveLocalTreesToStorage(updatedLocalTrees);
    
    // Reload all trees
    const allTrees = loadAllTreesFromStorage();
    setTrees(allTrees);
    
    // Clear selection if deleted tree was selected
    if (selectedTreeId === treeId) {
      if (allTrees.length > 0) {
        const firstTree = allTrees[0];
        onTreeSelect(firstTree.treeId, firstTree.treeData || []);
      }
    }
    
    console.log('Deleted local tree:', treeId);
  };

  // Debug log to see current selectedTreeId
  console.log('🎯 TreeListSidebar render - selectedTreeId:', selectedTreeId);

  if (loading) {
    return (
      <aside className="tree-list-sidebar">
        <div className="tree-list-header">
          <h3>Family Trees</h3>
        </div>
        <div className="tree-list-loading">
          Loading trees...
        </div>
      </aside>
    );
  }

  if (error && trees.length === 0) {
    return (
      <aside className="tree-list-sidebar">
        <div className="tree-list-header">
          <h3>Family Trees</h3>
          <button onClick={handleRefresh} className="refresh-btn">↻</button>
        </div>
        <div className="tree-list-error">
          Error: {error}
          <button onClick={handleRefresh} className="retry-btn">Retry</button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="tree-list-sidebar">
      <div className="tree-list-header">
        <h3>Family Trees</h3>
        <div className="header-buttons">
          <button onClick={handleUploadClick} className="upload-btn" title="Upload tree file">📁</button>
          <button onClick={handleRefresh} className="refresh-btn" title="Refresh">↻</button>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      
      <div className="tree-list-container">
        {trees.length === 0 ? (
          <div className="tree-list-empty">
            No family trees found
            <button onClick={handleUploadClick} className="upload-btn-large">
              📁 Upload Tree File
            </button>
          </div>
        ) : (
          <ul className="tree-list">
            {trees.map(tree => {
              const isSelected = selectedTreeId === tree.treeId;
              
              return (
                <li
                  key={tree.treeId}
                  className={`tree-item ${isSelected ? 'selected' : ''} ${tree.error ? 'error' : ''} ${tree.isLocal ? 'local' : ''}`}
                  title={`${tree.treeName}${tree.isLocal ? ' (Local)' : ' (Server)'} - ${tree.memberCount} members`}
                >
                  <div className="tree-item-content" onClick={() => handleTreeClick(tree)}>
                    <span className="tree-name">
                      {tree.treeName}
                      {tree.isLocal && <span className="local-badge">📁</span>}
                    </span>
                    <span className="member-count">({tree.memberCount || 0})</span>
                  </div>
                  {tree.isLocal && (
                    <button 
                      className="delete-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLocal(tree.treeId);
                      }}
                      title="Delete local tree"
                    >
                      🗑️
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default TreeListSidebar;