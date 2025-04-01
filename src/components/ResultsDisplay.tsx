
import React from 'react';
import { Server, Info, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

export interface PortData {
  port: number;
  service: string;
  state: 'open' | 'closed' | 'filtered';
  protocol: 'tcp' | 'udp';
  version?: string;
}

export interface ScanResult {
  target: string;
  timestamp: string;
  scanType: string;
  ports: PortData[];
  hostInfo: {
    status: string;
    latency: number;
    macAddress?: string;
    hostnames?: string[];
    os?: string;
  };
  rawOutput: string;
}

interface ResultsDisplayProps {
  result: ScanResult | null;
  isScanning: boolean;
  progress: number;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, isScanning, progress }) => {
  const getStateColor = (state: string) => {
    switch (state) {
      case 'open':
        return 'text-cyber-green';
      case 'closed':
        return 'text-cyber-red';
      case 'filtered':
        return 'text-cyber-yellow';
      default:
        return 'text-gray-400';
    }
  };

  if (isScanning) {
    return (
      <div className="cyber-card p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-20 h-20 rounded-full flex items-center justify-center border-4 border-cyber-blue/30 animate-pulse-glow">
            <div className="absolute inset-0 rounded-full border-4 border-cyber-blue/20"></div>
            <Server size={32} className="text-cyber-blue" />
          </div>
          <h3 className="text-xl font-bold text-cyber-blue">Scanning in progress</h3>
          <p className="text-gray-400 text-sm max-w-md">
            Scanning the target for open ports and services. This might take a few moments...
          </p>
          <div className="w-full max-w-md mt-4">
            <Progress value={progress} className="h-2 bg-cyber-darker" />
            <p className="text-right text-xs text-gray-400 mt-1">{progress}%</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="cyber-card p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-cyber-blue/30">
            <Info size={32} className="text-cyber-blue" />
          </div>
          <h3 className="text-xl font-bold text-white">No Scan Results Yet</h3>
          <p className="text-gray-400 text-sm max-w-md">
            Enter a target IP address or hostname above and click "Scan" to start a network scan.
          </p>
        </div>
      </div>
    );
  }

  const { ports, hostInfo, rawOutput } = result;
  const openPorts = ports.filter(p => p.state === 'open').length;

  return (
    <div className="cyber-card">
      <div className="p-4 border-b border-cyber-blue/30">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Scan Results</h3>
          <div className="bg-cyber-darker px-3 py-1 rounded-full text-xs text-gray-400">
            {result.timestamp}
          </div>
        </div>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-cyber-darker p-3 rounded-md">
            <div className="text-xs text-gray-400 mb-1">Target</div>
            <div className="font-mono text-cyber-blue">{result.target}</div>
          </div>
          <div className="bg-cyber-darker p-3 rounded-md">
            <div className="text-xs text-gray-400 mb-1">Status</div>
            <div className={`font-mono ${hostInfo.status === 'up' ? 'text-cyber-green' : 'text-cyber-red'}`}>
              {hostInfo.status === 'up' ? 'Online' : 'Offline'}
            </div>
          </div>
          <div className="bg-cyber-darker p-3 rounded-md">
            <div className="text-xs text-gray-400 mb-1">Open Ports</div>
            <div className="font-mono text-white">{openPorts} <span className="text-xs text-gray-400">/ {ports.length} scanned</span></div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="ports" className="w-full">
        <TabsList className="grid grid-cols-3 p-0 bg-cyber-darker border-b border-cyber-blue/30">
          <TabsTrigger value="ports" className="py-3 data-[state=active]:bg-cyber-dark data-[state=active]:text-cyber-blue">
            Ports
          </TabsTrigger>
          <TabsTrigger value="details" className="py-3 data-[state=active]:bg-cyber-dark data-[state=active]:text-cyber-blue">
            Host Details
          </TabsTrigger>
          <TabsTrigger value="raw" className="py-3 data-[state=active]:bg-cyber-dark data-[state=active]:text-cyber-blue">
            Raw Output
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="ports" className="p-4">
          {ports.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ports.map((port, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-md ${
                    port.state === 'open' 
                      ? 'port-open' 
                      : port.state === 'closed' 
                        ? 'port-closed' 
                        : 'port-filtered'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-lg font-mono font-bold">{port.port}</div>
                    <div className={`text-xs uppercase font-bold ${getStateColor(port.state)}`}>
                      {port.state}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {port.service || 'Unknown'} {port.version && `(${port.version})`}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {port.protocol.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center p-8">
              <AlertTriangle className="text-cyber-yellow mr-2" size={18} />
              <span className="text-gray-400">No port information available.</span>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="details" className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="terminal-window">
              <div className="text-xs text-gray-400 mb-2">Host Information</div>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-400">Status: </span>
                  <span className={hostInfo.status === 'up' ? 'text-cyber-green' : 'text-cyber-red'}>
                    {hostInfo.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Latency: </span>
                  <span className="terminal-text">{hostInfo.latency}ms</span>
                </div>
                {hostInfo.macAddress && (
                  <div>
                    <span className="text-gray-400">MAC Address: </span>
                    <span className="terminal-text">{hostInfo.macAddress}</span>
                  </div>
                )}
                {hostInfo.os && (
                  <div>
                    <span className="text-gray-400">OS: </span>
                    <span className="terminal-text">{hostInfo.os}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="terminal-window">
              <div className="text-xs text-gray-400 mb-2">Host Names</div>
              {hostInfo.hostnames && hostInfo.hostnames.length > 0 ? (
                <div className="space-y-1">
                  {hostInfo.hostnames.map((hostname, index) => (
                    <div key={index} className="terminal-text">{hostname}</div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">No hostname information available.</div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="raw" className="p-0">
          <div className="terminal-window h-80 overflow-auto rounded-none">
            <pre className="terminal-text whitespace-pre-wrap">
              {rawOutput || 'No raw output available.'}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResultsDisplay;
