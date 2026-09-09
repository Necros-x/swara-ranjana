"use client";

import React, { useState } from 'react';
import { Button } from '@/admin-site/components/ui/Button';
import { Camera, Flashlight, Search, CheckCircle2, AlertTriangle, XCircle, RotateCcw } from 'lucide-react';
import { mockTickets } from '@/admin-site/data/mock-data';
import { motion, AnimatePresence } from 'motion/react';

type ScanState = 'IDLE' | 'VALID' | 'USED' | 'INVALID';

export default function Scanner() {
  const [scanState, setScanState] = useState<ScanState>('IDLE');
  const [scannedTicket, setScannedTicket] = useState<any>(null);

  const simulateScan = (status: 'VALID' | 'USED' | 'INVALID') => {
    if (status === 'VALID') {
      setScannedTicket(mockTickets.find(t => t.status === 'VALID'));
    } else if (status === 'USED') {
      setScannedTicket(mockTickets.find(t => t.status === 'USED'));
    } else {
      setScannedTicket(null);
    }
    setScanState(status);
  };

  const resetScanner = () => {
    setScanState('IDLE');
    setScannedTicket(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-md mx-auto -m-4 sm:-m-6 lg:-m-8 bg-[#0E1721] overflow-hidden relative">
      
      {/* Scanner UI */}
      <AnimatePresence mode="wait">
        {scanState === 'IDLE' && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-between p-6 z-10"
          >
            <div className="text-center mt-4">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#FEFFFF]/10 flex items-center justify-center backdrop-blur-sm border border-[#FEFFFF]/20">
                <span className="text-[#FEFFFF] font-serif font-bold italic text-xl">S</span>
              </div>
              <div className="text-[#FEFFFF] font-serif tracking-widest text-sm uppercase">Swara Ranjana 2026</div>
            </div>

            <div className="w-full aspect-square max-w-[280px] relative">
              {/* Fake camera feed background */}
              <div className="absolute inset-0 bg-[#31465A]/20 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}></div>
              </div>
              
              {/* Scan Frame */}
              <div className="absolute inset-0 border-2 border-dashed border-[#2271B1]/50 rounded-2xl">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#2271B1] rounded-tl-2xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#2271B1] rounded-tr-2xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#2271B1] rounded-bl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#2271B1] rounded-br-2xl"></div>
              </div>

              {/* Scanning line animation */}
              <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                className="absolute left-0 right-0 h-0.5 bg-[#2271B1] shadow-[0_0_8px_2px_rgba(34,113,177,0.5)] z-20"
              />
            </div>

            <div className="text-[#C2CBD2] text-sm text-center">
              Align ticket QR inside the frame
            </div>

            <div className="w-full flex justify-between items-center px-4 mt-8">
              <button className="p-4 rounded-full bg-[#31465A]/30 text-[#FEFFFF] hover:bg-[#31465A]/50 transition-colors">
                <Flashlight className="w-6 h-6" />
              </button>
              
              <button className="p-4 rounded-full bg-[#31465A]/30 text-[#FEFFFF] hover:bg-[#31465A]/50 transition-colors">
                <Camera className="w-6 h-6" />
              </button>
            </div>

            <Button variant="outline" className="w-full mt-6 bg-[#FEFFFF]/5 border-[#C2CBD2]/30 text-[#FEFFFF] hover:bg-[#FEFFFF]/10 h-12">
              <Search className="w-4 h-4 mr-2" />
              Manual Ticket Lookup
            </Button>
            
            {/* Demo controls hidden in production */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
              <button onClick={() => simulateScan('VALID')} className="text-xs bg-green-500 px-2 py-1 rounded">Valid</button>
              <button onClick={() => simulateScan('USED')} className="text-xs bg-yellow-500 px-2 py-1 rounded">Used</button>
              <button onClick={() => simulateScan('INVALID')} className="text-xs bg-red-500 px-2 py-1 rounded">Invalid</button>
            </div>
          </motion.div>
        )}

        {/* Valid State */}
        {scanState === 'VALID' && scannedTicket && (
          <motion.div 
            key="valid"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-green-500 z-50 flex flex-col p-6"
          >
            <div className="flex-1 flex flex-col items-center justify-center text-center text-white">
              <CheckCircle2 className="w-32 h-32 mb-6" />
              <h1 className="text-4xl font-bold mb-8 uppercase tracking-wider">Valid Ticket</h1>
              
              <div className="bg-white/10 rounded-2xl p-6 w-full backdrop-blur-sm border border-white/20">
                <div className="text-xl font-medium mb-1">{scannedTicket.customerName}</div>
                <div className="font-mono text-sm opacity-80 mb-4">{scannedTicket.ticketNumber}</div>
                
                <div className="inline-block px-4 py-2 bg-white text-green-700 rounded-lg font-bold text-xl uppercase tracking-wider mb-2">
                  {scannedTicket.ticketCategoryName}
                </div>
                <div className="opacity-90 font-serif text-lg mt-4">Swara Ranjana 2026</div>
              </div>

              <div className="text-2xl font-bold mt-8 bg-black/20 py-3 px-8 rounded-full border border-white/20">
                ADMIT CUSTOMER
              </div>
            </div>
            
            <Button 
              size="lg"
              className="w-full bg-white text-green-700 hover:bg-green-50 text-lg h-14 font-bold uppercase tracking-wider"
              onClick={resetScanner}
            >
              Scan Next Ticket
            </Button>
          </motion.div>
        )}

        {/* Used State */}
        {scanState === 'USED' && scannedTicket && (
          <motion.div 
            key="used"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-yellow-500 z-50 flex flex-col p-6"
          >
            <div className="flex-1 flex flex-col items-center justify-center text-center text-black">
              <AlertTriangle className="w-32 h-32 mb-6" />
              <h1 className="text-4xl font-bold mb-8 uppercase tracking-wider">Already Used</h1>
              
              <div className="bg-black/10 rounded-2xl p-6 w-full backdrop-blur-sm border border-black/10">
                <div className="text-xl font-medium mb-1">{scannedTicket.customerName}</div>
                <div className="font-mono text-sm opacity-80 mb-4">{scannedTicket.ticketNumber}</div>
                
                <div className="inline-block px-4 py-2 bg-black text-yellow-500 rounded-lg font-bold text-lg uppercase tracking-wider mb-6">
                  {scannedTicket.ticketCategoryName}
                </div>
                
                <div className="bg-white/40 rounded-lg p-4 text-left">
                  <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">First Used</div>
                  <div className="font-medium">28 AUG 2026 • 6:42 PM</div>
                  <div className="text-xs opacity-60 mt-1">Scanned by: Gate Staff 02</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button 
                size="lg"
                variant="outline"
                className="flex-1 border-black/20 text-black hover:bg-black/10 h-14 font-bold"
              >
                View Details
              </Button>
              <Button 
                size="lg"
                className="flex-[2] bg-black text-yellow-500 hover:bg-black/90 h-14 font-bold uppercase tracking-wider"
                onClick={resetScanner}
              >
                Scan Next
              </Button>
            </div>
          </motion.div>
        )}

        {/* Invalid State */}
        {scanState === 'INVALID' && (
          <motion.div 
            key="invalid"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-red-600 z-50 flex flex-col p-6"
          >
            <div className="flex-1 flex flex-col items-center justify-center text-center text-white">
              <XCircle className="w-32 h-32 mb-6" />
              <h1 className="text-4xl font-bold mb-4 uppercase tracking-wider">Invalid Ticket</h1>
              
              <div className="bg-black/20 rounded-2xl p-6 w-full backdrop-blur-sm border border-white/10 mt-4">
                <div className="text-xl font-medium mb-2">Unknown QR Code</div>
                <div className="text-sm opacity-80">This QR code is not recognized by the system.</div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button 
                size="lg"
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10 h-14 font-bold"
              >
                <Search className="w-5 h-5 mr-2" />
                Manual
              </Button>
              <Button 
                size="lg"
                className="flex-[2] bg-white text-red-700 hover:bg-red-50 h-14 font-bold uppercase tracking-wider"
                onClick={resetScanner}
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Try Again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
