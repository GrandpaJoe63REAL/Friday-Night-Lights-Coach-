
import React, { useState, useEffect, useMemo } from 'react';
import { Staff, School, SeasonPhase } from '../types';
import { generateStaff } from '../engine/generators';

interface StaffViewProps {
  currentStaff: Staff[];
  school: School;
  gameWeek: number;
  phase: SeasonPhase;
  onHire: (newStaff: Staff, cost: number) => void;
  onUpdateStyle: (staffId: string, styleValue: number) => void;
}

const StaffView: React.FC<StaffViewProps> = ({ currentStaff, school, gameWeek, phase, onHire, onUpdateStyle }) => {
  const [activeCandidateRole, setActiveCandidateRole] = useState<Staff['role']>('Offensive Coordinator');
  const [availableCandidates, setAvailableCandidates] = useState<Staff[]>([]);

  // Refresh available candidates whenever the week or phase changes
  useEffect(() => {
    const roles: Staff['role'][] = [
      'Offensive Coordinator', 
      'Defensive Coordinator', 
      'Strength Coach', 
      'Academic Advisor'
    ];
    
    // Generate 3 candidates for each role for the week
    const newPool: Staff[] = [];
    roles.forEach(role => {
      for (let i = 0; i < 3; i++) {
        newPool.push(generateStaff(role));
      }
    });
    setAvailableCandidates(newPool);
  }, [gameWeek, phase]);

  const filteredCandidates = useMemo(() => {
    return availableCandidates.filter(c => c.role === activeCandidateRole);
  }, [availableCandidates, activeCandidateRole]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Offensive Coordinator': return '🎯';
      case 'Defensive Coordinator': return '🛡️';
      case 'Strength Coach': return '💪';
      case 'Academic Advisor': return '🎓';
      default: return '📋';
    }
  };

  const getStyleLabel = (role: string) => {
    switch (role) {
      case 'Offensive Coordinator': return 'Aggressiveness';
      case 'Defensive Coordinator': return 'Aggressiveness';
      case 'Strength Coach': return 'Intensity';
      case 'Academic Advisor': return 'Strictness';
      default: return 'Style';
    }
  };

  const getStyleDescription = (role: string, val: number) => {
    if (role.includes('Coordinator')) {
      if (val < 30) return "Conservative: Low variance, fewer turnovers, safe plays.";
      if (val > 70) return "Aggressive: High variance, many big plays, high risk of turnovers.";
      return "Balanced tactical approach.";
    }
    if (role === 'Strength Coach') {
      if (val < 30) return "Safe: Low injury risk, but slow physical development.";
      if (val > 70) return "Hardcore: Rapid OVR gains, but significantly higher injury frequency.";
      return "Balanced physical training.";
    }
    if (role === 'Academic Advisor') {
      if (val < 30) return "Lenient: High morale, but GPAs may stay low.";
      if (val > 70) return "Strict: Rapid GPA improvements, but causes morale decay.";
      return "Standard academic oversight.";
    }
    return "";
  };

  const handleHireClick = (candidate: Staff) => {
    const cost = candidate.skill * 150;
    if (school.budget < cost) {
      alert("Insufficient budget!");
      return;
    }
    
    const existingStaff = currentStaff.find(s => s.role === candidate.role);
    const message = existingStaff 
      ? `Hire ${candidate.name} ($${cost.toLocaleString()})? This will replace ${existingStaff.name}.`
      : `Hire ${candidate.name} ($${cost.toLocaleString()})?`;

    if (confirm(message)) {
      onHire(candidate, cost);
      // Remove hired candidate from the pool so they can't be hired again or seen
      setAvailableCandidates(prev => prev.filter(c => c.id !== candidate.id));
    }
  };

  const renderStars = (prestige: number) => {
    const stars = Math.ceil(prestige / 20);
    return "⭐".repeat(Math.min(5, stars));
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tight">Staff Headquarters</h2>
          <p className="text-slate-400 mt-1">Configure your coaching staff's philosophy and risk levels.</p>
        </div>
        <div className="glass px-6 py-4 rounded-[2rem] border-l-4 border-emerald-500 bg-slate-900/40 shadow-xl">
          <div className="text-[10px] font-black uppercase text-emerald-500 tracking-widest leading-none mb-1">Budget Available</div>
          <div className="text-3xl font-black text-white">${school.budget.toLocaleString()}</div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {currentStaff.map((member) => (
          <div key={member.id} className="glass rounded-[2.5rem] p-8 border-b-8 border-blue-600 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <span className="text-[10rem]">{getRoleIcon(member.role)}</span>
            </div>

            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center text-3xl font-black text-white border-2 border-slate-700">
                  {getRoleIcon(member.role)}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white italic">{member.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{member.role}</span>
                    <span className="text-xs">{renderStars(member.prestige)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-blue-400 leading-none">{member.skill}</div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Skill Rating</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8 relative z-10">
              <div className="space-y-4">
                <ProfileItem label="Philosophy" value={member.philosophy} />
                <ProfileItem label="Alma Mater" value={member.almaMater} />
              </div>
              <div className="space-y-4">
                <ProfileItem label="Record" value={`${member.careerRecord.wins}W - ${member.careerRecord.losses}L`} />
                <ProfileItem label="Experience" value={`${member.yearsExperience} Years`} />
              </div>
            </div>

            <div className="bg-black/30 p-6 rounded-3xl border border-white/5 relative z-10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-black uppercase text-blue-400 tracking-widest">{getStyleLabel(member.role)}</span>
                <span className="text-lg font-black text-white">{member.styleValue}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="100"
                value={member.styleValue}
                onChange={(e) => onUpdateStyle(member.id, parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-4"
              />
              <p className="text-[11px] text-slate-400 font-medium italic">
                {getStyleDescription(member.role, member.styleValue)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <section className="space-y-6 pt-12">
        <div className="flex items-center gap-6">
          <h3 className="text-xl font-black text-white uppercase italic tracking-widest whitespace-nowrap">Recruitment Agency</h3>
          <div className="h-px w-full bg-white/5" />
          <div className="flex gap-2">
            {['Offensive Coordinator', 'Defensive Coordinator', 'Strength Coach', 'Academic Advisor'].map((role) => (
              <button
                key={role}
                onClick={() => setActiveCandidateRole(role as any)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap border-2 transition-all ${
                  activeCandidateRole === role 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'bg-slate-900/50 border-white/5 text-slate-500'
                }`}
              >
                {role.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[300px]">
          {filteredCandidates.map((candidate) => (
            <div key={candidate.id} className="glass rounded-3xl p-6 border border-white/5 flex flex-col hover:border-blue-500/30 transition-all group animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-xl font-black text-white group-hover:bg-blue-600 transition-colors">
                  {candidate.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-white leading-tight">{candidate.name}</h4>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{candidate.role}</p>
                </div>
              </div>
              
              <div className="flex-1 space-y-4 mb-8">
                <ProfileItem label="Skill" value={candidate.skill.toString()} />
                <ProfileItem label="Prestige" value={renderStars(candidate.prestige)} />
                <p className="text-[10px] text-slate-500 italic leading-relaxed pt-2 border-t border-white/5">
                  "{candidate.philosophy} expert from {candidate.almaMater}."
                </p>
              </div>

              <button 
                onClick={() => handleHireClick(candidate)}
                className="w-full py-4 bg-slate-800 hover:bg-emerald-600 text-white font-black uppercase text-xs rounded-2xl transition-all border-b-4 border-black/40"
              >
                Hire - ${(candidate.skill * 150).toLocaleString()}
              </button>
            </div>
          ))}
          {filteredCandidates.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-40">
              <div className="text-4xl mb-2">🤝</div>
              <p className="text-xs font-black uppercase tracking-widest">No candidates available for this role</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const ProfileItem: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div>
    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{label}</div>
    <div className="text-sm font-bold text-white truncate">{value}</div>
  </div>
);

export default StaffView;
