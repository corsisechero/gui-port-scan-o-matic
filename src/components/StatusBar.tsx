
import React from 'react';
import { Clock, Database } from 'lucide-react';

interface StatusBarProps {
  scanCount: number;
  lastScanTime: string | null;
}

const StatusBar: React.FC<StatusBarProps> = ({ scanCount, lastScanTime }) => {
  return (
    <footer className="mt-auto border-t border-cyber-blue/30 py-2 px-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center text-xs text-gray-400">
          <Database size={14} className="mr-1" />
          <span>Scans completed: {scanCount}</span>
        </div>
        
        <div className="flex items-center text-xs text-gray-400">
          {lastScanTime && (
            <>
              <Clock size={14} className="mr-1" />
              <span>Last scan: {lastScanTime}</span>
            </>
          )}
        </div>
      </div>
    </footer>
  );
};

export default StatusBar;
