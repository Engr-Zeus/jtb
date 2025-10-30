# AI Agent Instructions for RFID Vehicle Monitoring System

## Project Overview
This is a real-time vehicle monitoring system that tracks RFID-tagged commercial vehicles through checkpoints. The system consists of:
- Express.js WebSocket server for real-time updates
- Interactive web dashboard for monitoring vehicle compliance
- Non-compliance enforcement interface for flagged vehicles

## Architecture & Components

### Core Components
1. **Server Layer** (`server.js`/`checkpoint-server.js`)
   - Express server with WebSocket support for real-time updates
   - Handles vehicle tracking and statistics
   - API endpoints for vehicle registration and updates

2. **Main Dashboard** (`index.html`)
   - Real-time monitoring interface
   - Shows vehicle stats, agent status, and alerts
   - Uses WebSocket for live updates

3. **Enforcement Interface** (`non_complaince.html`)
   - Focused view for non-compliant vehicle handling
   - Enforcement action triggers and status tracking
   - Direct communication with enforcement teams

### Data Flow Patterns
- Vehicle data flows from RFID checkpoints → Server → WebSocket → UI
- Statistics are maintained server-side and broadcast to all connected clients
- Enforcement actions trigger real-time updates across interfaces

## Development Workflows

### Local Development
```bash
npm install    # Install dependencies
npm start     # Start server on port 3000
```

### WebSocket Events Structure
- `stats`: Vehicle statistics updates
- `vehicle`: New vehicle detection events
- Clients receive initial stats on connection

### Key Patterns & Conventions

#### Front-end
- Use CSS variables for theming (defined in `:root`)
- Grid-based layout system with responsive breakpoints
- Component status classes: `.ok`, `.fail`, `.pending`, etc.

#### Back-end
- Broadcast pattern for client updates:
```javascript
function broadcast(data) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}
```

## Integration Points
1. **RFID Checkpoint Integration**
   - POST `/api/vehicle` or `/vehicle` with vehicle data
   - Required fields: plate, details, status

2. **Enforcement System Integration**
   - WebSocket events for real-time enforcement updates
   - Status updates: CLEARED, PENDING, FLAGGED

## Configurations
- Server port: 3000 (configurable in server files)
- Client reconnection: Automatic on disconnect
- Compliance thresholds: 80% for COMPLIANT status

## Best Practices
1. Always handle WebSocket connection state
2. Use broadcast for real-time updates to all clients
3. Include timestamp with vehicle events
4. Structure vehicle data consistently across endpoints

## Common Operations
- Adding vehicle entries: Use `addVehicle()` with proper time formatting
- Updating statistics: Call `updateStats()` after state changes
- Adding alerts: Use `addAlert()` with proper severity levels