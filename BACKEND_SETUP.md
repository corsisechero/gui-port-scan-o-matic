
# PortScan-O-Matic Backend Setup

This document provides instructions for setting up a local backend service for the PortScan-O-Matic application to perform actual network scans on your local network.

## Prerequisites

1. Node.js (v14.x or later)
2. npm or yarn
3. Nmap installed on your system (or another network scanning tool)

## Setting Up the Backend

### Step 1: Create a new directory for the backend

```bash
mkdir portscan-backend
cd portscan-backend
```

### Step 2: Initialize a new Node.js project

```bash
npm init -y
```

### Step 3: Install dependencies

```bash
npm install express cors node-nmap
```

### Step 4: Create the backend server

Create a file named `server.js` with the following content:

```javascript
const express = require('express');
const cors = require('cors');
const { NmapScan } = require('node-nmap');
const app = express();
const port = 3001;

// Enable CORS for the frontend
app.use(cors());
app.use(express.json());

// Store active scans
const activeScans = new Map();

// Status endpoint to check if the backend is running
app.get('/api/status', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start a new scan
app.post('/api/scan/start', (req, res) => {
  const { target, scanType, options } = req.body;
  
  // Generate a unique ID for this scan
  const scanId = Date.now().toString();
  
  // Configure scan based on type and options
  let nmapArgs = [];
  
  if (scanType === 'quick') {
    nmapArgs.push('-T4');  // Faster timing template
  } else if (scanType === 'comprehensive') {
    nmapArgs.push('-T3', '-A');  // Normal timing, enable OS detection, version detection, script scanning, and traceroute
  } else if (scanType === 'stealth') {
    nmapArgs.push('-sS', '-T2');  // SYN scan with slower timing
  }
  
  // Parse port range
  if (options.portRange) {
    nmapArgs.push('-p', options.portRange);
  }
  
  // Protocol options
  if (options.scanUdp) {
    nmapArgs.push('-sU');  // UDP scan
  }
  
  if (options.timeout) {
    nmapArgs.push('--host-timeout', options.timeout + 's');
  }
  
  console.log(`Starting scan of ${target} with args: ${nmapArgs.join(' ')}`);
  
  const scan = new NmapScan(target, nmapArgs);
  
  activeScans.set(scanId, {
    scan,
    progress: 0,
    completed: false,
    results: null,
    target,
    scanType,
    options
  });
  
  // Handle scan events
  scan.on('complete', (data) => {
    const scanInfo = activeScans.get(scanId);
    scanInfo.completed = true;
    scanInfo.progress = 100;
    
    // Format the results to match the frontend's expected structure
    const formattedResults = formatScanResults(data, target, scanType);
    scanInfo.results = formattedResults;
    
    console.log(`Scan ${scanId} completed.`);
  });
  
  scan.on('error', (error) => {
    console.error(`Scan ${scanId} error:`, error);
    const scanInfo = activeScans.get(scanId);
    scanInfo.completed = true;
    scanInfo.error = error.toString();
  });
  
  // Start the scan
  scan.startScan();
  
  // Start progress simulation (since nmap doesn't provide real-time progress)
  simulateProgress(scanId);
  
  res.status(200).json({ scanId });
});

// Check scan progress
app.get('/api/scan/progress/:scanId', (req, res) => {
  const { scanId } = req.params;
  
  if (!activeScans.has(scanId)) {
    return res.status(404).json({ error: 'Scan not found' });
  }
  
  const scanInfo = activeScans.get(scanId);
  
  res.status(200).json({
    progress: scanInfo.progress,
    completed: scanInfo.completed
  });
});

// Get scan results
app.get('/api/scan/results/:scanId', (req, res) => {
  const { scanId } = req.params;
  
  if (!activeScans.has(scanId)) {
    return res.status(404).json({ error: 'Scan not found' });
  }
  
  const scanInfo = activeScans.get(scanId);
  
  if (!scanInfo.completed) {
    return res.status(400).json({ error: 'Scan not completed yet' });
  }
  
  if (scanInfo.error) {
    return res.status(500).json({ error: scanInfo.error });
  }
  
  res.status(200).json(scanInfo.results);
  
  // Clean up after delivering results
  setTimeout(() => {
    activeScans.delete(scanId);
  }, 60000);  // Delete after 1 minute
});

// Start the server
app.listen(port, () => {
  console.log(`PortScan-O-Matic backend listening at http://localhost:${port}`);
});

// Helper function to simulate progress
function simulateProgress(scanId) {
  const scanInfo = activeScans.get(scanId);
  if (!scanInfo) return;
  
  // Don't update progress if already completed
  if (scanInfo.completed) return;
  
  // Determine how quickly progress should advance based on scan type
  const progressStep = scanInfo.scanType === 'quick' ? 5 : 
                      scanInfo.scanType === 'comprehensive' ? 2 : 3;
  
  scanInfo.progress += progressStep;
  
  // Cap at 95% until actually complete
  if (scanInfo.progress > 95 && !scanInfo.completed) {
    scanInfo.progress = 95;
  }
  
  // Continue simulation if not complete
  if (!scanInfo.completed) {
    setTimeout(() => simulateProgress(scanId), 500);
  }
}

// Helper function to format nmap results to match frontend expected structure
function formatScanResults(data, target, scanType) {
  const now = new Date();
  const host = data[0] || {};
  
  // Extract ports
  const ports = [];
  if (host.openPorts) {
    host.openPorts.forEach(port => {
      ports.push({
        port: port.port,
        service: port.service || '',
        state: 'open',
        protocol: 'tcp',
        version: port.version || undefined
      });
    });
  }
  
  // Create the formatted result
  const result = {
    target,
    timestamp: now.toLocaleString(),
    scanType,
    ports,
    hostInfo: {
      status: host.status || 'unknown',
      latency: host.rtt || 0,
      macAddress: host.mac || undefined,
      hostnames: host.hostname ? [host.hostname] : [target],
      os: host.osNmap || host.os || 'Unknown',
    },
    rawOutput: host.commandOutputString || '',
  };
  
  return result;
}
```

### Step 5: Start the backend

```bash
node server.js
```

## Usage

1. Start the backend server as described above
2. Launch the PortScan-O-Matic frontend application
3. The header will show a "Backend Connected" indicator if the connection is successful
4. Perform scans using the interface - they will now use the real Nmap scanner

## Troubleshooting

- **Backend Not Connecting**: Make sure the backend is running on port 3001 and that there are no firewall issues
- **Scan Errors**: Check that Nmap is properly installed on your system and available in your PATH
- **Permission Issues**: Some scan types require elevated privileges. You may need to run the backend with sudo/administrator privileges

## Security Notice

This backend provides direct access to Nmap, which is a powerful network scanning tool. Only use it on networks you own or have explicit permission to scan. Unauthorized scanning of networks may be illegal in your jurisdiction.
