
import React from 'react';
import { GameState } from '../types';

interface SettingsViewProps {
  gameState: GameState;
  currentSlot: string;
  lastSaved: number | null;
  onSave: () => void;
  onExport: () => void;
  onImport: (json: string) => void;
  onReset: () => void;
  onSwitchSlot: (slot: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  gameState, 
  currentSlot, 
  lastSaved, 
  onSave, 
  onExport, 
  onImport, 
  onReset,
  onSwitchSlot 
}) => {
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onImport(content);
    };
    reader.readAsText(file);
  };

  const formatDate = (ts: number | null) => {
    if (!ts) return "Never";
    return new Date(ts).toLocaleString();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-20">
      <header className="border-b border-white/10 pb-6">
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tight">Career Hub</h2>
        <p className="text-slate-400 mt-2">Manage your career legacy, save files, and program history.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Save Slots */}
        <section className="glass rounded-[2.5rem] p-8 space-y-6">
          <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>💾</span> Save Management
          </h3>
          <div className="space-y-4">
            {['slot_1', 'slot_2', 'slot_3'].map(slot => {
              const hasData = localStorage.getItem(`hs_football_coach_${slot}`);
              const isActive = currentSlot === slot;
              
              return (
                <div 
                  key={slot} 
                  className={`p-4 rounded-2xl border transition-all ${isActive ? 'bg-blue-600/10 border-blue-500 shadow-lg' : 'bg-slate-900 border-white/5 opacity-60'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-black text-white uppercase text-xs tracking-tighter">{slot.replace('_', ' ')}</span>
                    {isActive && <span className="bg-blue-600 text-[8px] font-black px-1.5 py-0.5 rounded text-white uppercase">Active Slot</span>}
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-[10px] text-slate-500 font-bold">
                      {hasData ? "Career in progress" : "Empty Slot"}
                    </div>
                    {!isActive && hasData && (
                      <button 
                        onClick={() => onSwitchSlot(slot)}
                        className="text-[9px] font-black text-blue-400 hover:text-white uppercase tracking-widest"
                      >
                        Switch Career
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 space-y-4">
            <button 
              onClick={onSave}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 uppercase tracking-widest text-xs"
            >
              Manual Cloud Sync (Save)
            </button>
            <p className="text-center text-[9px] text-slate-500 font-bold uppercase tracking-widest">
              Last Synced: {formatDate(lastSaved)}
            </p>
          </div>
        </section>

        {/* Data Portability */}
        <section className="glass rounded-[2.5rem] p-8 space-y-6 flex flex-col">
          <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>🔌</span> Program Portability
          </h3>
          <p className="text-[11px] text-slate-400 leading-relaxed italic">
            "Moving to a new desk? Take your coaching legacy with you. Export your career as a secure JSON file or import a legacy file from the district."
          </p>

          <div className="space-y-3 mt-auto">
            <button 
              onClick={onExport}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl transition-all border-b-4 border-black/40 uppercase tracking-widest text-xs"
            >
              Export Career Data
            </button>
            
            <label className="w-full block">
              <input 
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={handleFileUpload}
              />
              <div className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-black rounded-2xl border-2 border-dashed border-white/10 cursor-pointer text-center transition-all uppercase tracking-widest text-xs">
                Import Legacy File
              </div>
            </label>

            <div className="pt-4 border-t border-white/5">
              <button 
                onClick={onReset}
                className="w-full py-4 text-rose-500/50 hover:text-rose-400 font-black rounded-2xl transition-all uppercase tracking-[0.2em] text-[10px]"
              >
                Delete Career Forever
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Career History */}
      <section className="glass rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
        <h3 className="text-xl font-black text-white italic uppercase tracking-tight flex items-center gap-2">
          <span className="text-blue-500">🏆</span> Program Hall of Fame
        </h3>
        
        <div className="space-y-4">
          {gameState.history && gameState.history.length > 0 ? (
            gameState.history.slice().reverse().map((entry, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex flex-col items-center justify-center border border-blue-500/20">
                    <div className="text-[10px] font-black text-blue-400 uppercase leading-none mb-1">Year</div>
                    <div className="text-xl font-black text-white">{entry.year}</div>
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">{entry.schoolName}</div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Season Summary</div>
                  </div>
                </div>

                <div className="text-center px-8 border-x border-white/5">
                  <div className="text-xl font-black italic text-emerald-400">{entry.record}</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Final Record</div>
                </div>

                <div className="text-right min-w-[140px]">
                  <div className="text-sm font-black text-amber-500 uppercase italic">{entry.achievement}</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Best Result</div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center opacity-30 flex flex-col items-center">
              <div className="text-6xl mb-4">📜</div>
              <p className="text-xs font-black uppercase tracking-[0.2em]">The history books are still empty.</p>
              <p className="text-[10px] font-medium mt-2">Finish your first season to record your legacy here.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SettingsView;
