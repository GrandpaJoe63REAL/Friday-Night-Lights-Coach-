
import React, { useState, useEffect } from 'react';

const FLAVOR_TEXTS = [
  "Reviewing game film...",
  "Coordinating bus schedules...",
  "Updating academic eligibility reports...",
  "Preparing the pep rally...",
  "Watching local rival game tapes...",
  "Adjusting the offensive playbook...",
  "Cleaning the locker rooms...",
  "Meeting with the Booster Club...",
  "Scouting middle school talent...",
  "Coaching up the scout team..."
];

const LoadingScreen: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % FLAVOR_TEXTS.length);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      {/* Background Thematic Elements */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-black/80" />
      
      {/* Chalk Lines Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white" />
        <div className="absolute top-0 left-1/4 h-full w-0.5 bg-white" />
        <div className="absolute top-0 left-2/4 h-full w-0.5 bg-white" />
        <div className="absolute top-0 left-3/4 h-full w-0.5 bg-white" />
      </div>

      <div className="relative flex flex-col items-center animate-in zoom-in-95 duration-500">
        {/* Animated Football Icon */}
        <div className="w-32 h-32 mb-8 relative">
            <div className="absolute inset-0 bg-blue-600 rounded-full blur-3xl opacity-20 animate-pulse" />
            <div className="relative text-7xl animate-bounce">🏈</div>
        </div>

        <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter mb-2">
            Advancing <span className="text-blue-500">Week</span>
        </h2>
        
        <div className="h-1.5 w-64 bg-slate-900 rounded-full overflow-hidden mb-6 border border-white/5">
            <div className="h-full bg-blue-600 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }} />
        </div>

        <div className="h-6 overflow-hidden">
            <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] animate-in slide-in-from-bottom-2 duration-300 key={messageIndex}">
                {FLAVOR_TEXTS[messageIndex]}
            </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
        }
      `}} />
    </div>
  );
};

export default LoadingScreen;
