
import React, { useState } from 'react';
import { Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

interface ScanFormProps {
  onScan: (target: string, scanType: string, options: ScanOptions) => void;
  isScanning: boolean;
}

export interface ScanOptions {
  portRange: string;
  timeout: number;
  scanTcp: boolean;
  scanUdp: boolean;
}

const ScanForm: React.FC<ScanFormProps> = ({ onScan, isScanning }) => {
  const [target, setTarget] = useState<string>('');
  const [scanType, setScanType] = useState<string>('quick');
  const [options, setOptions] = useState<ScanOptions>({
    portRange: '1-1000',
    timeout: 2,
    scanTcp: true,
    scanUdp: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!target.trim()) {
      toast({
        title: "Error",
        description: "Please enter a target IP address or hostname",
        variant: "destructive"
      });
      return;
    }
    
    onScan(target, scanType, options);
  };

  const handleOptionChange = (key: keyof ScanOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="cyber-card p-4 mb-6">
      <div className="mb-4">
        <label htmlFor="target" className="block text-sm font-medium text-gray-300 mb-2">
          Target IP / Hostname
        </label>
        <input
          id="target"
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="e.g., 192.168.1.1 or example.com"
          className="cyber-input w-full"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-4">
        <div className="w-full sm:w-1/3">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Scan Type
          </label>
          <Select
            value={scanType}
            onValueChange={(value) => setScanType(value)}
          >
            <SelectTrigger className="cyber-input">
              <SelectValue placeholder="Select scan type" />
            </SelectTrigger>
            <SelectContent className="bg-cyber-light border border-cyber-blue/30">
              <SelectItem value="quick">Quick Scan</SelectItem>
              <SelectItem value="comprehensive">Comprehensive Scan</SelectItem>
              <SelectItem value="stealth">Stealth Scan</SelectItem>
              <SelectItem value="custom">Custom Scan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 flex justify-between items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 bg-cyber-darker border-cyber-blue/30 hover:bg-cyber-light"
              >
                <Settings size={16} />
                <span>Advanced Options</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-cyber-light border border-cyber-blue/30">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Port Range
                  </label>
                  <input
                    type="text"
                    value={options.portRange}
                    onChange={(e) => handleOptionChange('portRange', e.target.value)}
                    placeholder="e.g., 1-1000 or 22,80,443"
                    className="cyber-input w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={options.timeout}
                    onChange={(e) => handleOptionChange('timeout', parseInt(e.target.value))}
                    className="cyber-input w-full text-sm"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="scanTcp"
                      checked={options.scanTcp}
                      onChange={(e) => handleOptionChange('scanTcp', e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="scanTcp" className="text-sm text-gray-300">
                      TCP
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="scanUdp"
                      checked={options.scanUdp}
                      onChange={(e) => handleOptionChange('scanUdp', e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="scanUdp" className="text-sm text-gray-300">
                      UDP
                    </label>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            type="submit" 
            className="cyber-button" 
            disabled={isScanning}
          >
            <Search size={16} className="mr-2" />
            {isScanning ? "Scanning..." : "Scan"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ScanForm;
