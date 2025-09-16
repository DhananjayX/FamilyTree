const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();
const DEFAULT_TREE_ID = 'tree_00000'
const TREE_ROOT_PATH = path.join(__dirname, '../data/trees');

console.log('FAMILYDATA_PATH:', TREE_ROOT_PATH);

// Validation method for POST tree payload
function validatePost(payload) {
  const errors = [];
  
  // Check if payload exists
  if (!payload || typeof payload !== 'object') {
    return { isValid: false, errors: ['Invalid payload format'] };
  }
  
  // Validate treeName
  if (!payload.treeName || typeof payload.treeName !== 'string' || payload.treeName.trim().length === 0) {
    errors.push('treeName is required and must be a non-empty string');
  }
  
  // Validate creatorEmailId
  if (!payload.creatorEmailId || typeof payload.creatorEmailId !== 'string' || payload.creatorEmailId.trim().length === 0) {
    errors.push('creatorEmailId is required and must be a non-empty string');
  }
  
  // Basic email format validation
  if (payload.creatorEmailId && typeof payload.creatorEmailId === 'string') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.creatorEmailId.trim())) {
      errors.push('creatorEmailId must be a valid email address');
    }
  }
  
  // Validate treeData
  if (!payload.treeData || !Array.isArray(payload.treeData)) {
    errors.push('treeData is required and must be an array');
  } else if (payload.treeData.length === 0) {
    errors.push('treeData must contain at least one person');
  } else {
    // Validate each person in treeData
    payload.treeData.forEach((person, index) => {
      if (!person || typeof person !== 'object') {
        errors.push(`treeData[${index}] must be an object`);
        return;
      }
      
      // Check required person fields
      if (!person.personId || typeof person.personId !== 'string') {
        errors.push(`treeData[${index}] must have a valid personId`);
      }
      
      if (!person.firstName || typeof person.firstName !== 'string' || person.firstName.trim().length === 0) {
        errors.push(`treeData[${index}] must have a valid firstName`);
      }
      
      if (!person.lastName || typeof person.lastName !== 'string' || person.lastName.trim().length === 0) {
        errors.push(`treeData[${index}] must have a valid lastName`);
      }
      
      if (!person.gender || (person.gender !== 'male' && person.gender !== 'female')) {
        errors.push(`treeData[${index}] must have gender as 'male' or 'female'`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Validation method for PUT tree payload (more lenient - allows partial updates)
function validatePut(payload) {
  const errors = [];
  
  // Check if payload exists
  if (!payload || typeof payload !== 'object') {
    return { isValid: false, errors: ['Invalid payload format'] };
  }
  
  // Validate treeName if provided
  if (payload.treeName !== undefined) {
    if (typeof payload.treeName !== 'string' || payload.treeName.trim().length === 0) {
      errors.push('treeName must be a non-empty string');
    }
  }
  
  // Validate creatorEmailId if provided
  if (payload.creatorEmailId !== undefined) {
    if (typeof payload.creatorEmailId !== 'string' || payload.creatorEmailId.trim().length === 0) {
      errors.push('creatorEmailId must be a non-empty string');
    } else {
      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.creatorEmailId.trim())) {
        errors.push('creatorEmailId must be a valid email address');
      }
    }
  }
  
  // Validate treeData if provided
  if (payload.treeData !== undefined) {
    if (!Array.isArray(payload.treeData)) {
      errors.push('treeData must be an array');
    } else if (payload.treeData.length === 0) {
      errors.push('treeData must contain at least one person');
    } else {
      // Validate each person in treeData
      payload.treeData.forEach((person, index) => {
        if (!person || typeof person !== 'object') {
          errors.push(`treeData[${index}] must be an object`);
          return;
        }
        
        // Check required person fields
        if (!person.personId || typeof person.personId !== 'string') {
          errors.push(`treeData[${index}] must have a valid personId`);
        }
        
        if (!person.firstName || typeof person.firstName !== 'string' || person.firstName.trim().length === 0) {
          errors.push(`treeData[${index}] must have a valid firstName`);
        }
        
        if (!person.lastName || typeof person.lastName !== 'string' || person.lastName.trim().length === 0) {
          errors.push(`treeData[${index}] must have a valid lastName`);
        }
        
        if (!person.gender || (person.gender !== 'male' && person.gender !== 'female')) {
          errors.push(`treeData[${index}] must have gender as 'male' or 'female'`);
        }
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// GET /api/tree/:id - Get specific tree by ID, use default if not provided
router.get('/tree/:id?', async (req, res) => {
  try {
    const treeId = req.params.id || DEFAULT_TREE_ID;
    const treeFilePath = path.join(TREE_ROOT_PATH, `${treeId}.json`);
    
    console.log('Getting tree:', treeId, 'from path:', treeFilePath);
    
    // Check if tree file exists
    try {
      await fs.access(treeFilePath);
    } catch (accessError) {
      console.error('Tree file not found:', treeFilePath);
      return res.status(404).json({ 
        success: false, 
        error: 'Tree not found',
        treeId: treeId
      });
    }
    
    // Read tree data
    const treeData = await fs.readFile(treeFilePath, 'utf8');
    const persons = JSON.parse(treeData);
    
    console.log('Loaded tree:', treeId, 'with', persons.length, 'persons');
    
    res.json({ 
      success: true, 
      treeId: treeId,
      persons: persons,
      count: persons.length
    });
    
  } catch (error) {
    console.error('Error loading tree:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load tree data', 
      details: error.message 
    });
  }
});

// POST /api/tree - Create new tree with unique ID
router.post('/tree', async (req, res) => {
  try {
    // Validate the payload
    const validation = validatePost(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed',
        details: validation.errors
      });
    }
    
    const { treeName, creatorEmailId, treeData } = req.body;
    
    // Get count of existing trees to generate unique ID
    const files = await fs.readdir(TREE_ROOT_PATH);
    const treeFiles = files.filter(file => file.endsWith('.json') && file.startsWith('tree_'));
    const totalTrees = treeFiles.length;
    
    // Generate unique tree ID: 10000 + total trees
    const newTreeId = `tree_${10000 + totalTrees}`;
    const newTreeFilePath = path.join(TREE_ROOT_PATH, `${newTreeId}.json`);
    
    // Check if file already exists (safety check)
    try {
      await fs.access(newTreeFilePath);
      return res.status(409).json({ 
        success: false, 
        error: 'Tree ID already exists',
        treeId: newTreeId
      });
    } catch (accessError) {
      // File doesn't exist, which is what we want
    }
    
    // Create new tree structure
    const newTree = {
      treeId: newTreeId,
      treeName: treeName.trim(),
      creatorEmailId: creatorEmailId.trim(),
      createDate: new Date().toISOString(),
      treeData: treeData
    };
    
    // Write new tree file
    await fs.writeFile(newTreeFilePath, JSON.stringify(newTree, null, 2));
    
    console.log('Created new tree:', newTreeId, 'with name:', treeName, 'and', treeData.length, 'persons');
    
    // Confirm creation by reading stats
    try {
      const stats = await fs.stat(newTreeFilePath);
      console.log('New tree file size:', stats.size, 'bytes');
      
      res.status(201).json({ 
        success: true, 
        message: 'Tree created successfully',
        tree: newTree,
        fileSizeBytes: stats.size
      });
    } catch (statErr) {
      console.error('Tree created but stat failed:', statErr);
      res.status(201).json({ 
        success: true, 
        message: 'Tree created (stat check failed)',
        tree: newTree,
        statError: statErr.message
      });
    }
    
  } catch (error) {
    console.error('Error creating tree:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create tree', 
      details: error.message 
    });
  }
});

// PUT /api/tree/:id - Update existing tree by ID
router.put('/tree/:id', async (req, res) => {
  try {
    const treeId = req.params.id;
    
    if (!treeId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tree ID is required' 
      });
    }
    
    // Validate the payload
    const validation = validatePut(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed',
        details: validation.errors
      });
    }
    
    const treeFilePath = path.join(TREE_ROOT_PATH, `${treeId}.json`);
    
    // Check if tree file exists
    try {
      await fs.access(treeFilePath);
    } catch (accessError) {
      console.error('Tree file not found for update:', treeFilePath);
      return res.status(404).json({ 
        success: false, 
        error: 'Tree not found',
        treeId: treeId
      });
    }
    
    // Read existing tree data
    const existingTreeData = await fs.readFile(treeFilePath, 'utf8');
    const existingTree = JSON.parse(existingTreeData);
    
    // Merge the update data with existing tree (preserve original createDate)
    const updatedTree = {
      ...existingTree,
      ...req.body,
      treeId: treeId, // Ensure treeId cannot be changed
      createDate: existingTree.createDate, // Preserve original createDate
      modifyDate: new Date().toISOString() // Add modify date timestamp
    };
    
    // Write updated tree file
    await fs.writeFile(treeFilePath, JSON.stringify(updatedTree, null, 2));
    
    console.log('Updated tree:', treeId, 'with fields:', Object.keys(req.body));
    
    // Confirm update by reading stats
    try {
      const stats = await fs.stat(treeFilePath);
      console.log('Updated tree file size:', stats.size, 'bytes');
      
      res.json({ 
        success: true, 
        message: 'Tree updated successfully',
        tree: updatedTree,
        fileSizeBytes: stats.size
      });
    } catch (statErr) {
      console.error('Tree updated but stat failed:', statErr);
      res.json({ 
        success: true, 
        message: 'Tree updated (stat check failed)',
        tree: updatedTree,
        statError: statErr.message
      });
    }
    
  } catch (error) {
    console.error('Error updating tree:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update tree', 
      details: error.message 
    });
  }
});

module.exports = router;
