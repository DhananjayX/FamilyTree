const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

const FAMILYDATA_PATH = path.join(__dirname, '../data', 'FamilyData.json');
console.log('FAMILYDATA_PATH:', FAMILYDATA_PATH);

// POST /api/saveFamilyData
router.post('/saveFamilyData', async (req, res) => {
  try {
    const { persons } = req.body;
    if (!Array.isArray(persons)) {
      console.error('Invalid data format:', req.body);
      return res.status(400).json({ success: false, error: 'Invalid data format' });
    }
    console.log('Saving persons to:', FAMILYDATA_PATH);
    await fs.writeFile(FAMILYDATA_PATH, JSON.stringify(persons, null, 2));
    res.json({ success: true, message: 'Family data saved successfully' });
  } catch (error) {
    console.error('Error saving family data:', error);
    res.status(500).json({ success: false, error: 'Failed to save family data', details: error.message });
  }
});

module.exports = router;
