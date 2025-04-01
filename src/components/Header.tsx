
import React from 'react';
import { Network } from 'lucide-react';

const Header = () => {
  return (
    <header className="py-4 px-6 border-b border-cyber-blue/30 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Network size={28} className="text-cyber-blue" />
        <h1 className="text-2xl font-bold text-white">
          Port<span className="text-cyber-blue">Scan-O-Matic</span>
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-xs text-gray-400">A graphical interface for network scanning</div>
      </div>
    </header>
  );
};

export default Header;
