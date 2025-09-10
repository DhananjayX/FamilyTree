# Family Tree API Server

A Node.js Express server for managing family tree members data.

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## API Endpoints

### GET /api/health
Health check endpoint
- **Response**: `{ status: "OK", timestamp: "...", service: "Family Tree API" }`

### GET /api/members/:treeId
Get all members for a specific tree
- **Parameters**: 
  - `treeId` (string) - The tree identifier
- **Response**: 
```json
{
  "success": true,
  "data": [...],
  "count": 3,
  "treeId": "tree_001"
}
```

### GET /api/members
Get all members (for testing)
- **Response**: 
```json
{
  "success": true,
  "data": [...],
  "count": 4
}
```

## Data Structure

### Member JSON Format
```json
{
  "memberId": "100000000001",
  "treeId": "tree_001",
  "firstName": "John",
  "lastName": "Smith",
  "birthDate": "1950-03-15",
  "gender": "male",
  "fatherId": null,
  "motherId": null,
  "spouseIds": ["100000000002"],
  "emails": ["john.smith@example.com"],
  "phone": "+1-555-0101",
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701",
    "country": "USA"
  },
  "notes": "Family patriarch",
  "profileImage": null,
  "createDate": "2025-09-10T10:00:00Z",
  "modifyDate": "2025-09-10T10:00:00Z"
}
```

### Member ID System
- 12-digit sequential IDs starting from `100000000001`
- Each member gets the next available ID
- IDs are unique across all trees

## File Storage
- Members stored as individual JSON files in `server/data/members/`
- Filename format: `{memberId}.json`
- Each member tagged with `treeId` for tree association

## Example Usage

```bash
# Get members for tree_001
curl http://localhost:3001/api/members/tree_001

# Get all members
curl http://localhost:3001/api/members

# Health check
curl http://localhost:3001/api/health
```
