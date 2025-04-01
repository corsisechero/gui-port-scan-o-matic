import { ScanOptions } from '@/components/ScanForm';
import { ScanResult, PortData } from '@/components/ResultsDisplay';
import { toast } from '@/components/ui/use-toast';

// Try to connect to the local backend, fallback to mock data if not available
export const scanTarget = async (
  target: string,
  scanType: string,
  options: ScanOptions,
  progressCallback: (progress: number) => void
): Promise<ScanResult> => {
  // First check if the backend is available
  let isBackendAvailable = false;
  
  try {
    const response = await fetch('http://localhost:3001/api/status', { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    isBackendAvailable = response.ok;
  } catch (error) {
    console.log('Backend not available, using mock data');
    isBackendAvailable = false;
  }

  // If backend is available, use it
  if (isBackendAvailable) {
    try {
      return await scanWithBackend(target, scanType, options, progressCallback);
    } catch (error) {
      console.error('Error with backend scan:', error);
      // Only fall back to mock data if explicitly requested
      if (window.confirm('Backend scan failed. Would you like to run a simulated scan instead?')) {
        return scanWithMockData(target, scanType, options, progressCallback);
      } else {
        throw new Error('Scan failed. Please check if the target exists and is reachable.');
      }
    }
  } else {
    // Fallback to mock data with user confirmation
    if (window.confirm('Backend not available. Would you like to run a simulated scan instead? Note: This will generate fake data and may not reflect actual network status.')) {
      return scanWithMockData(target, scanType, options, progressCallback);
    } else {
      throw new Error('Backend is required for actual network scanning. Please start the backend server.');
    }
  }
};

// Function to scan using the local backend
const scanWithBackend = async (
  target: string,
  scanType: string,
  options: ScanOptions,
  progressCallback: (progress: number) => void
): Promise<ScanResult> => {
  try {
    // Start the scan
    const startResponse = await fetch('http://localhost:3001/api/scan/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, scanType, options })
    });
    
    if (!startResponse.ok) {
      throw new Error('Failed to start scan');
    }
    
    const { scanId } = await startResponse.json();
    
    // Poll for progress
    let completed = false;
    let progress = 0;
    
    while (!completed) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const progressResponse = await fetch(`http://localhost:3001/api/scan/progress/${scanId}`);
      
      if (!progressResponse.ok) {
        throw new Error('Failed to get scan progress');
      }
      
      const progressData = await progressResponse.json();
      progress = progressData.progress;
      completed = progressData.completed;
      
      progressCallback(progress);
    }
    
    // Get the results
    const resultsResponse = await fetch(`http://localhost:3001/api/scan/results/${scanId}`);
    
    if (!resultsResponse.ok) {
      throw new Error('Failed to get scan results');
    }
    
    const results = await resultsResponse.json();
    
    // Verify that the host is actually up
    if (results.hostInfo?.status !== 'up' || results.ports.length === 0) {
      results.hostInfo.status = 'down';
      results.ports = [];
    }
    
    return results;
  } catch (error) {
    console.error('Error during scan:', error);
    throw error; // Re-throw the error to be handled by the parent function
  }
};

// This is the mock data function
const scanWithMockData = async (
  target: string,
  scanType: string,
  options: ScanOptions,
  progressCallback: (progress: number) => void
): Promise<ScanResult> => {
  // Simulate scanning process with progress updates
  const totalSteps = 100;
  const stepTime = scanType === 'quick' ? 30 : scanType === 'comprehensive' ? 80 : 50;
  
  for (let i = 0; i <= totalSteps; i++) {
    await new Promise(resolve => setTimeout(resolve, stepTime));
    progressCallback(i);
  }
  
  // Add a clear indicator that this is mock data
  const now = new Date();
  const mockPortResults: PortData[] = generateMockPorts(scanType, options);
  
  return {
    target,
    timestamp: now.toLocaleString() + " (SIMULATED DATA)",
    scanType,
    ports: mockPortResults,
    hostInfo: {
      status: 'up',
      latency: Math.floor(Math.random() * 100) + 10,
      macAddress: '00:1A:2B:3C:4D:5E',
      hostnames: ['localhost', target],
      os: 'Linux 5.10.x',
    },
    rawOutput: "This is simulated data and does not represent actual network status.\n\n" + 
               generateMockRawOutput(target, mockPortResults),
  };
};

// Helper functions to generate mock data
function generateMockPorts(scanType: string, options: ScanOptions): PortData[] {
  const ports: PortData[] = [];
  const portRange = parsePortRange(options.portRange);
  
  // Common ports that are typically open
  const commonOpenPorts = [
    { port: 22, service: 'SSH', version: 'OpenSSH 8.2p1' },
    { port: 80, service: 'HTTP', version: 'nginx 1.18.0' },
    { port: 443, service: 'HTTPS', version: 'nginx 1.18.0' },
    { port: 3306, service: 'MySQL', version: '8.0.23' },
    { port: 5432, service: 'PostgreSQL', version: '13.2' }
  ];
  
  // Add some common open ports
  commonOpenPorts.forEach(p => {
    if (portRange.includes(p.port)) {
      ports.push({
        port: p.port,
        service: p.service,
        state: Math.random() > 0.2 ? 'open' : 'filtered',
        protocol: 'tcp',
        version: p.version
      });
    }
  });
  
  // Add some random closed/filtered ports
  const numAdditionalPorts = scanType === 'quick' ? 10 : scanType === 'comprehensive' ? 30 : 20;
  
  for (let i = 0; i < numAdditionalPorts; i++) {
    // Filter out ports that are already in the result
    const existingPorts = ports.map(p => p.port);
    const availablePorts = portRange.filter(p => !existingPorts.includes(p));
    
    if (availablePorts.length === 0) break;
    
    const randomPortIndex = Math.floor(Math.random() * availablePorts.length);
    const port = availablePorts[randomPortIndex];
    
    const state = Math.random() > 0.7 ? 'closed' : Math.random() > 0.5 ? 'filtered' : 'open';
    
    ports.push({
      port,
      service: state === 'open' ? getRandomService() : '',
      state,
      protocol: Math.random() > 0.8 && options.scanUdp ? 'udp' : 'tcp',
      version: state === 'open' ? getRandomVersion() : undefined
    });
  }
  
  // Sort ports by number
  return ports.sort((a, b) => a.port - b.port);
}

function parsePortRange(portRange: string): number[] {
  const parts = portRange.split(',');
  const ports: number[] = [];
  
  parts.forEach(part => {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      for (let i = start; i <= end; i++) {
        ports.push(i);
      }
    } else {
      ports.push(Number(part));
    }
  });
  
  return Array.from(new Set(ports)).filter(p => !isNaN(p) && p > 0 && p < 65536);
}

function getRandomService(): string {
  const services = [
    'HTTP', 'FTP', 'SSH', 'SMTP', 'POP3', 'IMAP', 'DNS', 'RDP', 'VNC', 
    'Telnet', 'SNMP', 'SMB', 'NTP', 'LDAP', 'Redis', 'MongoDB', 'Memcached'
  ];
  return services[Math.floor(Math.random() * services.length)];
}

function getRandomVersion(): string | undefined {
  if (Math.random() > 0.7) return undefined;
  
  const versions = [
    '1.0.0', '2.0.1', '3.2.1', '4.0.0', '5.1.2', '6.0.0-beta', 
    '7.0.0-rc1', '8.0.3', '9.1.0', '10.5.2'
  ];
  return versions[Math.floor(Math.random() * versions.length)];
}

function generateMockRawOutput(target: string, ports: PortData[]): string {
  const openPorts = ports.filter(p => p.state === 'open');
  
  return `
# Nmap 7.92 scan initiated at ${new Date().toLocaleString()}
Nmap scan report for ${target}
Host is up (0.045s latency).
Not shown: ${65535 - ports.length} closed ports
${openPorts.map(p => `${p.port}/${p.protocol} open ${p.service} ${p.version || ''}`).join('\n')}

Nmap done: 1 IP address (1 host up) scanned in ${Math.floor(Math.random() * 10) + 2}.${Math.floor(Math.random() * 100)} seconds
  `;
}
