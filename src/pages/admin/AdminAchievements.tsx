import { ExternalLink, Trophy, Flame, Target } from 'lucide-react';

export function AdminAchievements() {
  const achievements = [
    { title: "Top Students by XP", count: "12 Candidates", icon: Trophy, color: "bg-[#FFCC00]" },
    { title: "Learning Streaks > 7 Days", count: "45 Users", icon: Flame, color: "bg-[#FF3366]" },
    { title: "Badge Distribution", count: "1,204 Badges", icon: Target, color: "bg-[#00CCFF]" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="border-b-8 border-black pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-black uppercase">
            Platform <span className="bg-[#00FF88] px-4 py-1 border-4 border-black inline-block rotate-[1deg]">Achievements</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {achievements.map((ach, i) => (
          <div key={i} className={`p-8 border-4 border-black flex flex-col gap-6 relative group transition-all duration-200 hover:-translate-y-2 hover:neo-shadow-xl neo-shadow-lg bg-white`}>
             <div className="flex items-center gap-4">
               <div className={`w-16 h-16 border-4 border-black flex items-center justify-center neo-shadow-sm group-hover:rotate-[15deg] transition-transform ${ach.color}`}>
                 <ach.icon className="w-8 h-8 text-black" strokeWidth={2.5} />
               </div>
             </div>
             <div className="pt-4 border-t-4 border-black border-dashed">
                <p className="text-sm font-black text-black uppercase tracking-widest leading-tight mb-2">{ach.title}</p>
                <p className="text-3xl font-black text-black">{ach.count}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-neo-secondary border-4 border-black p-8 neo-shadow-lg text-center mt-12 flex flex-col items-center">
        <h2 className="font-black text-3xl uppercase tracking-tighter mb-4">Gamification Rules Configurator</h2>
        <p className="font-bold mb-6 max-w-xl">
          Adjust XP multipliers, custom badges, and streak bonuses. Requires elevated root access to modify gamification engine parameters.
        </p>
        <button className="bg-black text-white px-6 py-4 border-4 border-black font-black uppercase text-lg hover:bg-white hover:text-black transition-colors flex items-center gap-2">
          Open Rule Editor <ExternalLink className="w-5 h-5"/>
        </button>
      </div>
    </div>
  );
}
