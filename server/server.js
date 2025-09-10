const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Data directories
const DATA_DIR = path.join(__dirname, 'data');
const MEMBERS_DIR = path.join(DATA_DIR, 'members');
const TREES_DIR = path.join(DATA_DIR, 'trees');

// Ensure data directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(MEMBERS_DIR, { recursive: true });
    await fs.mkdir(TREES_DIR, { recursive: true });
    console.log('Data directories initialized');
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

// Generate next member ID
async function getNextMemberId() {
  try {
    const files = await fs.readdir(MEMBERS_DIR);
    const memberFiles = files.filter(file => file.endsWith('.json'));
    
    if (memberFiles.length === 0) {
      return '100000000001'; // First member ID
    }
    
    // Find the highest existing ID
    let maxId = 100000000000;
    for (const file of memberFiles) {
      try {
        const content = await fs.readFile(path.join(MEMBERS_DIR, file), 'utf8');
        const member = JSON.parse(content);
        const memberId = parseInt(member.memberId);
        if (memberId > maxId) {
          maxId = memberId;
        }
      } catch (error) {
        console.error(`Error reading member file ${file}:`, error);
      }
    }
    
    return (maxId + 1).toString();
  } catch (error) {
    console.error('Error generating member ID:', error);
    return '100000000001';
  }
}

// GET route to fetch members for a specific tree
app.get('/api/members/:treeId', async (req, res) => {
  try {
    const { treeId } = req.params;
    
    if (!treeId) {
      return res.status(400).json({ 
        error: 'Tree ID is required',
        success: false 
      });
    }
    
    // Read all member files
    const files = await fs.readdir(MEMBERS_DIR);
    const memberFiles = files.filter(file => file.endsWith('.json'));
    
    const members = [];
    
    for (const file of memberFiles) {
      try {
        const filePath = path.join(MEMBERS_DIR, file);
        const content = await fs.readFile(filePath, 'utf8');
        const member = JSON.parse(content);
        
        // Filter members by treeId
        if (member.treeId === treeId) {
          members.push(member);
        }
      } catch (error) {
        console.error(`Error reading member file ${file}:`, error);
      }
    }
    
    // Sort members by ID for consistent ordering
    members.sort((a, b) => a.memberId.localeCompare(b.memberId));
    
    res.json({
      success: true,
      data: members,
      count: members.length,
      treeId: treeId
    });
    
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      success: false 
    });
  }
});

// GET route to fetch all members (for testing)
app.get('/api/members', async (req, res) => {
  try {
    const files = await fs.readdir(MEMBERS_DIR);
    const memberFiles = files.filter(file => file.endsWith('.json'));
    
    const members = [];
    
    for (const file of memberFiles) {
      try {
        const filePath = path.join(MEMBERS_DIR, file);
        const content = await fs.readFile(filePath, 'utf8');
        const member = JSON.parse(content);
        members.push(member);
      } catch (error) {
        console.error(`Error reading member file ${file}:`, error);
      }
    }
    
    // Sort members by ID
    members.sort((a, b) => a.memberId.localeCompare(b.memberId));
    
    res.json({
      success: true,
      data: members,
      count: members.length
    });
    
  } catch (error) {
    console.error('Error fetching all members:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      success: false 
    });
  }
});

// POST route to add a new member
app.post('/api/members', async (req, res) => {
  try {
    const { firstName, lastName, gender, relationship, treeId } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !gender || !treeId) {
      return res.status(400).json({ 
        error: 'Missing required fields: firstName, lastName, gender, treeId',
        success: false 
      });
    }
    
    // Generate new member ID
    const memberId = await getNextMemberId();
    
    // Create member object
    const newMember = {
      memberId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender: gender.toLowerCase(),
      relationship: relationship ? relationship.trim() : '',
      treeId: treeId.toString(),
      createdAt: new Date().toISOString()
    };
    
    // Save member to file
    const fileName = `member_${memberId}.json`;
    const filePath = path.join(MEMBERS_DIR, fileName);
    await fs.writeFile(filePath, JSON.stringify(newMember, null, 2));
    
    console.log(`New member added: ${firstName} ${lastName} (ID: ${memberId})`);
    
    res.status(201).json({
      success: true,
      data: newMember,
      message: 'Member added successfully'
    });
    
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      success: false 
    });
  }
});

// GET route to fetch all trees
app.get('/api/trees', async (req, res) => {
  try {
    const files = await fs.readdir(TREES_DIR);
    const treeFiles = files.filter(file => file.endsWith('.json'));
    
    const trees = [];
    
    for (const file of treeFiles) {
      try {
        const filePath = path.join(TREES_DIR, file);
        const content = await fs.readFile(filePath, 'utf8');
        const tree = JSON.parse(content);
        
        // Get member count for this tree
        const memberFiles = await fs.readdir(MEMBERS_DIR);
        const memberCount = await Promise.all(
          memberFiles.filter(f => f.endsWith('.json')).map(async (memberFile) => {
            try {
              const memberContent = await fs.readFile(path.join(MEMBERS_DIR, memberFile), 'utf8');
              const member = JSON.parse(memberContent);
              return member.treeId === tree.treeId ? 1 : 0;
            } catch {
              return 0;
            }
          })
        ).then(counts => counts.reduce((sum, count) => sum + count, 0));
        
        // Only include trees that have members
        if (memberCount > 0) {
          trees.push({
            ...tree,
            memberCount
          });
        }
      } catch (error) {
        console.error(`Error reading tree file ${file}:`, error);
      }
    }
    
    // Sort trees by creation date (newest first)
    trees.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      data: trees,
      count: trees.length
    });
    
  } catch (error) {
    console.error('Error fetching trees:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      success: false 
    });
  }
});

// POST route to create a new tree
app.post('/api/trees', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        error: 'Tree name is required',
        success: false 
      });
    }
    
    // Generate new tree ID
    const treeId = Date.now().toString();
    
    // Create tree object
    const newTree = {
      treeId,
      name: name.trim(),
      createdAt: new Date().toISOString(),
      description: ''
    };
    
    // Save tree to file
    const fileName = `tree_${treeId}.json`;
    const filePath = path.join(TREES_DIR, fileName);
    await fs.writeFile(filePath, JSON.stringify(newTree, null, 2));
    
    console.log(`New tree created: ${name} (ID: ${treeId})`);
    
    res.status(201).json({
      success: true,
      data: { ...newTree, memberCount: 0 },
      message: 'Tree created successfully'
    });
    
  } catch (error) {
    console.error('Error creating tree:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      success: false 
    });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Family Tree API'
  });
});

// Start server
async function startServer() {
  await ensureDirectories();
  
  app.listen(PORT, () => {
    console.log(`Family Tree API server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Members endpoint: http://localhost:${PORT}/api/members/:treeId`);
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server gracefully...');
  process.exit(0);
});

startServer().catch(console.error);

module.exports = app;
