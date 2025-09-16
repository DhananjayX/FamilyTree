const express = require('express');
const fs = require('fs').promises;
const path = require('path');

/*inject route refs.*/
const treeRoutes = require('./routes/treeroutes');

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
const TREES_DIR = path.join(DATA_DIR, 'trees');

// Ensure data directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(TREES_DIR, { recursive: true });
    console.log('Data directories initialized');
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Family Tree API'
  });
});

app.use('/api', treeRoutes);

// Start server
async function startServer() {
  await ensureDirectories();
  
  app.listen(PORT, () => {
    console.log(`Family Tree API server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Tree endpoint: http://localhost:${PORT}/api/tree/:id`);
    console.log('----------------------------------------------------------');
    console.log('');
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server gracefully...');
  process.exit(0);
});

startServer().catch(console.error);

module.exports = app;
