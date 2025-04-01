
import React, { useState } from 'react';
import Header from '@/components/Header';
import ScanForm, { ScanOptions } from '@/components/ScanForm';
import ResultsDisplay, { ScanResult } from '@/components/ResultsDisplay';
import StatusBar from '@/components/StatusBar';
import { scanTarget } from '@/services/scanService';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);
  const { toast } = useToast();

  const handleScan = async (target: string, scanType: string, options: ScanOptions) => {
    try {
      setIsScanning(true);
      setProgress(0);
      
      const result = await scanTarget(
        target, 
        scanType, 
        options,
        (progressValue) => setProgress(progressValue)
      );
      
      setResult(result);
      setScanCount(prev => prev + 1);
      setLastScanTime(new Date().toLocaleString());
      
      toast({
        title: "Scan Complete",
        description: `Scanned ${target} and found ${result.ports.filter(p => p.state === 'open').length} open ports.`,
      });
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Scan Failed",
        description: "There was an error performing the scan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container px-4 py-6">
        <ScanForm onScan={handleScan} isScanning={isScanning} />
        <ResultsDisplay 
          result={result} 
          isScanning={isScanning} 
          progress={progress}
        />
      </main>
      
      <StatusBar scanCount={scanCount} lastScanTime={lastScanTime} />
    </div>
  );
};

export default Index;
