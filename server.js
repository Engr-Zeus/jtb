import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const PORT = 3000;

// Serve static files
app.use(express.static(__dirname));

// Store connected clients
const clients = new Set();

// Store vehicle statistics
let stats = {
  total: 0,
  active: 0,
  compliant: 0,
  nonCompliant: 0
};

// WebSocket connection handler
wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('Client connected');

  // Send initial stats
  ws.send(JSON.stringify({ type: 'stats', stats }));

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});

// Broadcast to all connected clients
function broadcast(data) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Route for receiving RFID data
app.post('/vehicle', express.json(), (req, res) => {
  const vehicle = req.body;
  
  // Update stats
  stats.total++;
    // status expected: 'Compliant' or 'Non Compliant'
    if (vehicle.status === 'Compliant') {
      stats.compliant++;
    } else {
      stats.nonCompliant++;
    }
    // active represents currently non-compliant/pending items
    stats.active = stats.nonCompliant;

  // Broadcast updates
  broadcast({ type: 'vehicle', vehicle });
  broadcast({ type: 'stats', stats });

  res.json({ success: true });
});

server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
