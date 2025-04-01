
import React, { useState, useEffect } from 'react';
import { Network, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';

const Header = () => {
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [attemptedConnection, setAttemptedConnection] = useState<boolean>(false);

  const checkBackendConnection = () => {
    fetch('http://localhost:3001/api/status')
      .then(response => {
        if (response.ok) {
          setIsBackendConnected(true);
          if (!isBackendConnected && attemptedConnection) {
            toast({
              title: "Backend Connected",
              description: "Successfully connected to the backend server. Real network scanning is now available.",
              variant: "default"
            });
          }
        } else {
          setIsBackendConnected(false);
          if (isBackendConnected) {
            toast({
              title: "Backend Disconnected",
              description: "Lost connection to the backend server. Only mock scanning will be available.",
              variant: "destructive"
            });
          }
        }
      })
      .catch(() => {
        setIsBackendConnected(false);
        if (isBackendConnected) {
          toast({
            title: "Backend Disconnected",
            description: "Lost connection to the backend server. Only mock scanning will be available.",
            variant: "destructive"
          });
        }
      })
      .finally(() => {
        setAttemptedConnection(true);
      });
  };

  useEffect(() => {
    // Check backend connection on component mount
    checkBackendConnection();
    
    // Set up periodic checking
    const interval = setInterval(checkBackendConnection, 10000);
    
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [isBackendConnected]);

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
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              isBackendConnected 
                ? "bg-cyber-green/20 border border-cyber-green/40" 
                : "bg-cyber-red/20 border border-cyber-red/40"
            }`}>
              {isBackendConnected ? (
                <>
                  <Wifi size={14} className="text-cyber-green" />
                  <span className="text-xs text-cyber-green font-medium">Backend Connected</span>
                </>
              ) : (
                <>
                  <WifiOff size={14} className="text-cyber-red" />
                  <span className="text-xs text-cyber-red font-medium">Backend Disconnected</span>
                </>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {isBackendConnected 
              ? "Connected to local backend service on port 3001. Real network scanning is available." 
              : "Backend service not detected. Make sure to run the backend server on port 3001 for real network scanning."}
          </TooltipContent>
        </Tooltip>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full text-cyber-blue hover:text-white hover:bg-cyber-blue/20"
          onClick={checkBackendConnection}
          title="Refresh backend connection status"
        >
          <AlertTriangle size={16} />
        </Button>
      </div>
    </header>
  );
};

export default Header;
