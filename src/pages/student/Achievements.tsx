import { apiFetch } from '../../lib/api'; import { useState, useEffect } from 'react';
import { Target, Flame, Trophy, Activity, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
}

export function Achievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    apiFetch('/api/achievements').then(r => r.json()).then(setAchievements);
  }, []);

  const getIcon = (name: string) => {
    switch(name) {
      case 'Target': return <Target className="w-8 h-8 text-black" strokeWidth={2.5} />;
      case 'Flame': return <Flame className="w-8 h-8 text-black" strokeWidth={2.5} />;
      case 'Trophy': return <Trophy className="w-8 h-8 text-black" strokeWidth={2.5} />;
      default: return <Star className="w-8 h-8 text-black" strokeWidth={2.5} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b-8 border-black pb-8 relative rotate-[1deg]">
         <div className="space-y-4">
           <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-black uppercase flex items-center gap-4" style={{ WebkitTextStroke: '2px black', color: 'transparent' }}>
             <Trophy className="w-12 h-12 text-neo-secondary fill-neo-secondary" strokeWidth={2} style={{ filter: 'drop-shadow(4px 4px 0px #000)' }} />
             <span className="text-neo-secondary" style={{ WebkitTextStroke: '0' }}>Achievements</span>
           </h1>
           <p className="font-bold text-lg uppercase tracking-widest bg-white border-4 border-black inline-block px-4 py-2 neo-shadow-sm rotate-[-1deg]">Track streaks & badges.</p>
         </div>
         <div className="bg-neo-accent px-6 py-3 border-4 border-black flex items-center gap-3 neo-shadow-sm rotate-[-2deg]">
           <Trophy className="w-6 h-6 text-black" strokeWidth={3} />
           <span className="font-black text-black uppercase text-lg tracking-widest">{user?.xp?.toLocaleString() || 0} XP Total</span>
         </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
        <StatBox title="Streak" value={`${user?.streak || 0} Days`} icon={Flame} color="bg-neo-accent" rotate="-rotate-1" />
        <StatBox title="Badges" value={achievements.filter(a => a.unlockedAt).length.toString()} icon={Target} color="bg-neo-secondary" rotate="rotate-2" />
        <StatBox title="Rank" value="#42" icon={Activity} color="bg-neo-muted" rotate="-rotate-2" />
        <StatBox title="Finished" value="12" icon={Star} color="bg-white" rotate="rotate-1" />
      </div>

      <div className="space-y-8 pt-8">
        <h2 className="text-3xl font-black text-black uppercase tracking-widest border-b-4 border-black pb-4 inline-block bg-neo-secondary px-4 rotate-[-1deg] neo-shadow-sm">
          Trophy Room
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {achievements.map((achievement, idx) => {
            const isUnlocked = !!achievement.unlockedAt;
            return (
              <div 
                key={achievement.id}
                className={cn(
                  "p-6 border-4 flex flex-col items-start gap-6 transition-all duration-300 relative group neo-shadow-sm",
                  isUnlocked 
                    ? "bg-white border-black hover:-translate-y-2 hover:neo-shadow-xl z-10" 
                    : "bg-gray-200 border-gray-400 opacity-80 grayscale hover:grayscale-0",
                  idx % 3 === 0 ? "rotate-[-1deg]" : idx % 2 === 0 ? "rotate-[2deg]" : "rotate-[-2deg]"
                )}
              >
                
                <div className={cn(
                  "w-16 h-16 flex items-center justify-center shrink-0 border-4 neo-shadow-sm group-hover:rotate-[15deg] transition-transform",
                  isUnlocked ? "bg-neo-secondary border-black" : "bg-gray-300 border-gray-500"
                )}>
                  {getIcon(achievement.icon)}
                </div>
                <div className="flex-1 w-full">
                  <h3 className="font-black text-2xl text-black uppercase tracking-tight mb-2 group-hover:underline decoration-4 underline-offset-4">{achievement.title}</h3>
                  <p className="text-sm font-bold text-black uppercase tracking-widest opacity-80 mb-4">{achievement.description}</p>
                  {isUnlocked && (
                    <p className="text-xs font-black text-black bg-neo-accent inline-block px-3 py-1 border-2 border-black uppercase tracking-widest">
                      Unlocked {new Date(achievement.unlockedAt!).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

function StatBox({ title, value, icon: Icon, color, rotate }: { title: string, value: string, icon: any, color: string, rotate: string }) {
  return (
    <div className={cn(`p-6 border-4 border-black text-center relative group transition-all duration-200 hover:-translate-y-2 neo-shadow-lg neo-shadow-sm hover:neo-shadow-xl`, color, rotate)}>
       <div className={`w-14 h-14 mx-auto flex items-center justify-center bg-white border-4 border-black mb-4 neo-shadow-sm group-hover:rotate-12 transition-transform`}>
         <Icon className="w-8 h-8 text-black" strokeWidth={2.5} />
       </div>
       <p className="text-4xl font-black text-black tracking-tighter uppercase mb-2" style={{ WebkitTextStroke: '1px black', color: 'white' }}>{value}</p>
       <p className="text-sm font-black text-black tracking-widest uppercase">{title}</p>
    </div>
  )
}

