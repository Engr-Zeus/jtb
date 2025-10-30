import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 3000;

// Serve static files
app.use(express.static(__dirname));
app.use(express.json());

// Store vehicle data
let vehicleStats = {
    total: 0,
    active: 0,
    compliant: 0,
    nonCompliant: 0
};

const vehicles = [];

// WebSocket connections
const clients = new Set();

wss.on('connection', (ws) => {
    console.log('Client connected');
    clients.add(ws);

    // Send initial data
    ws.send(JSON.stringify({
        type: 'stats',
        stats: vehicleStats
    }));

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected');
    });
});

// Broadcast to all clients
function broadcast(data) {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// API Endpoints
app.post('/api/vehicle', (req, res) => {
    const vehicle = {
        time: new Date().toLocaleTimeString(),
        plate: req.body.plate,
        details: req.body.details,
            status: req.body.status || 'Non Compliant'
    };

    vehicles.push(vehicle);
    vehicleStats.total++;
    
    // Expecting 'Compliant' or 'Non Compliant'
    if (vehicle.status === 'Compliant') {
        vehicleStats.compliant++;
    } else {
        vehicleStats.nonCompliant++;
    }
    vehicleStats.active = vehicleStats.nonCompliant;

    // Broadcast updates
    broadcast({ type: 'vehicle', vehicle });
    broadcast({ type: 'stats', stats: vehicleStats });

    res.json({ success: true });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});