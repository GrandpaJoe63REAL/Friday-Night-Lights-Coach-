
import React, { useState } from 'react';
import { CoachProfile, CoachArchetype } from '../types';

interface CoachCreationProps {
  onComplete: (profile: CoachProfile, teamName: string) => void;
}

const APPEARANCES = [
  { id: 'suit', icon: '👔', label: 'Professional' },
  { id: 'tracksuit', icon: '👟', label: 'Athletic' },
  { id: 'casual', icon: '👕', label: 'Casual' },
  { id: 'cap', icon: '🧢', label: 'The Veteran' },
];

const ARCHETYPES: { id: CoachArchetype; label: string; icon: string; description: string }[] = [
  { 
    id: 'Recruiter', 
    label: 'The Recruiter', 
    icon: '🤝', 
    description: 'Boosts your success rate when stealing athletes from other sports programs.' 
  },
  { 
    id: 'Motivator', 
    label: 'The Motivator', 
    icon: '🔥', 
    description: 'All players start with higher morale, making them progress faster and play better.' 
  },
  { 
    id: 'Tactician', 
    label: 'The Tactician', 
    icon: '🧠', 
    description: 'Crucial game moments and play calls have a significantly higher success probability.' 
  },
];

const CoachCreation: React.FC<CoachCreationProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [teamName, setTeamName] = useState('East High Eagles');
  const [appearance, setAppearance] = useState('suit');
  const [archetype, setArchetype] = useState<CoachArchetype>('Tactician');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !teamName.trim()) {
      alert("Please enter both your name and a team name.");
      return;
    }
    onComplete({ name, appearance, archetype }, teamName);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-950 text-white relative overflow-y-auto">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-950 to-black pointer-events-none" />
      
      <div className="relative max-w-4xl w-full glass p-8 md:p-12 rounded-[3.5rem] shadow-2xl border-t-8 border-blue-600 animate-in fade-in zoom-in-95 duration-700 my-12">
        <div className="text-center mb-10">
          <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-2">Build Your Legacy</h2>
          <p className="text-slate-400 font-medium">Define your coaching style and choose your program.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Section 1: Identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-blue-400 ml-4">Coach Name</label>
              <input 
                type="text" 
                placeholder="Coach Carter"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border-2 border-white/5 rounded-2xl px-6 py-4 text-xl font-bold focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-blue-400 ml-4">High School Name</label>
              <input 
                type="text" 
                placeholder="East High Eagles"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full bg-slate-900 border-2 border-white/5 rounded-2xl px-6 py-4 text-xl font-bold focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 shadow-inner"
              />
            </div>
          </div>

          {/* Section 2: Appearance */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="h-px flex-1 bg-white/5" />
               <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Coach Appearance</h3>
               <div className="h-px flex-1 bg-white/5" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {APPEARANCES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAppearance(item.id)}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 group ${
                    appearance === item.id ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/10' : 'bg-slate-900/50 border-white/5 hover:border-white/20'
                  }`}
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Archetype */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="h-px flex-1 bg-white/5" />
               <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Select Archetype</h3>
               <div className="h-px flex-1 bg-white/5" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ARCHETYPES.map((arc) => (
                <button
                  key={arc.id}
                  type="button"
                  onClick={() => setArchetype(arc.id)}
                  className={`p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col h-full group ${
                    archetype === arc.id ? 'bg-blue-600/10 border-blue-600 shadow-xl' : 'bg-slate-900/40 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="text-3xl mb-4 p-3 bg-slate-800 rounded-2xl w-fit group-hover:bg-blue-600 transition-colors">
                    {arc.icon}
                  </div>
                  <h4 className="text-lg font-black mb-2">{arc.label}</h4>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed flex-1">
                    {arc.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit"
              className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black text-2xl rounded-3xl shadow-2xl shadow-blue-600/30 transition-all transform hover:scale-105 active:scale-95 uppercase tracking-tighter italic"
            >
              Confirm Coach & Start Career
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoachCreation;
