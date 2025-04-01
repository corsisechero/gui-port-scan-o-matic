
import React, { useState, useEffect } from 'react';
import { Network, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const Header = () => {
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  useEffect(() => {
    // Check if the backend is available
    fetch('http://localhost:3001/api/status')
      .then(response => {
        if (response.ok) {
          setIsBackendConnected(true);
        }
      })
      .catch(() => {
        setIsBackendConnected(false);
      });
  }, []);

  return (
    <header className="py-4 px-6 border-b border-cyber-blue/30 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Network size={28} className="text-cyber-blue" />
        <h1 className="text-2xl font-bold text-white">
          Port<span className="text-cyber-blue">Scan-O-Matic</span>
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-xs text-gray-400">A graphical interface for network scanning</div>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 px-3 py-1 bg-cyber-darker rounded-full">
              {isBackendConnected ? (
                <>
                  <Wifi size={14} className="text-cyber-green" />
                  <span className="text-xs text-cyber-green">Backend Connected</span>
                </>
              ) : (
                <>
                  <WifiOff size={14} className="text-cyber-red" />
                  <span className="text-xs text-cyber-red">Backend Disconnected</span>
                </>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {isBackendConnected 
              ? "Connected to local backend service" 
              : "Backend service not detected. Make sure to run the backend server on port 3001"}
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
};

export default Header;
