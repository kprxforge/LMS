import { apiFetch } from '../../lib/api'; import { useState, useEffect } from 'react';
import { BookOpen, Clock, Target, PlayCircle, ShieldAlert } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { Course, User, Activity } from '../../types';
import { motion, useAnimation, useInView, animate } from 'motion/react';
import { useRef } from 'react';

export function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  const { showNotification } = useNotification();

  useEffect(() => {
    apiFetch('/api/users/me').then(r => r.json()).then(setUser);
    fetch('/api/activities').then(r => r.json()).then(setActivities);
    
    // Welcome Notification after delay
    const timer = setTimeout(() => {
      showNotification('LINK ESTABLISHED - WELCOME BACK', 'success');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } }
  };

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show" 
      className="max-w-6xl mx-auto space-y-12"
    >
      {/* Welcome Banner */}
      <motion.div variants={itemVariants} className="bg-neo-accent border-4 border-black p-8 text-black flex flex-col md:flex-row justify-between items-center neo-shadow-lg relative overflow-hidden group transition-all hover:-translate-y-1 hover:neo-shadow-xl rotate-1">
        
        <div className="space-y-6 relative z-10 w-full md:w-3/4">
          <div className="inline-flex items-center gap-2 bg-white border-4 border-black px-3 py-1 neo-shadow-sm rotate-[-2deg]">
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <ShieldAlert className="w-6 h-6 text-black" strokeWidth={3} />
            </motion.div>
            <span className="uppercase tracking-widest font-black text-sm">System Status: Optimal</span>
          </div>
          <motion.h1 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-5xl md:text-7xl font-black tracking-tighter uppercase" 
            style={{ WebkitTextStroke: '2px black', color: 'transparent' }}
          >
            WHATS UP, <span className="text-white" style={{ WebkitTextStroke: '0' }}>{user?.name?.split(' ')[0] || 'USER'}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="font-bold text-xl uppercase tracking-widest bg-white border-4 border-black inline-block px-4 py-2 neo-shadow-sm rotate-[1deg]"
          >
            <span className="text-neo-accent font-black">[{user?.streak || 0} DAY STREAK]</span> Time to crush your goals!
          </motion.p>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
            <motion.button 
              whileHover={{ scale: 1.05, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 bg-white text-black px-8 py-4 font-black text-xl uppercase transition-colors neo-shadow-sm border-4 border-black flex items-center gap-3 hover:bg-neo-secondary w-max rotate-[-1deg]"
            >
              <PlayCircle className="w-8 h-8" strokeWidth={3} />
              Resume Sequence
            </motion.button>
          </motion.div>
        </div>
        <div className="hidden md:flex relative w-48 h-48 items-center justify-center rotate-12 group-hover:rotate-[24deg] transition-transform duration-500">
           <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}>
             <Target className="w-40 h-40 text-black fill-white" strokeWidth={2} />
           </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard title="Active Modules" value={3} icon={Clock} color="bg-neo-secondary" delay={0.2} />
        <StatCard title="Completed" value={12} icon={BookOpen} color="bg-neo-muted" delay={0.4} />
        <StatCard title="Total XP" value={user?.xp || 0} icon={Target} color="bg-white" delay={0.6} />
      </div>

      {/* Two Column Layout for bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Recommended Course / Up Next - takes 2 cols */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-4 border-b-8 border-black pb-4 rotate-[-1deg]">
            <h2 className="text-4xl font-black text-black tracking-tighter uppercase bg-neo-secondary px-4 border-4 border-black neo-shadow-sm">Priority Queue</h2>
          </div>
          
          <motion.div 
            whileHover={{ y: -10, boxShadow: '10px 10px 0 0 #000' }}
            whileTap={{ scale: 0.98 }}
            className="bg-white p-6 border-4 border-black flex flex-col sm:flex-row gap-6 items-start sm:items-center hover:bg-neo-muted transition-colors group cursor-pointer neo-shadow-lg"
          >
             <div className="w-full sm:w-64 aspect-video bg-black overflow-hidden shrink-0 border-4 border-black relative">
               <img 
                 src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800" 
                 alt="Course placeholder" 
                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 grayscale group-hover:grayscale-0"
               />
               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <PlayCircle className="w-20 h-20 text-neo-secondary fill-black" strokeWidth={2} />
               </div>
             </div>
             
             <div className="flex-1 w-full space-y-4">
               <div>
                 <div className="flex items-center gap-3 mb-3">
                   <span className="text-xs font-black uppercase tracking-widest text-black bg-neo-accent px-3 py-1 border-2 border-black rotate-[-2deg]">Software Eng</span>
                   <span className="text-sm font-bold text-black tracking-widest uppercase">Mod 4 / Les 2</span>
                 </div>
                 <h3 className="text-2xl font-black text-black line-clamp-2 uppercase">Advanced Full-Stack System Design</h3>
               </div>
               
               <div className="space-y-3">
                 <div className="flex justify-between text-sm font-black text-black uppercase tracking-widest">
                   <span>Progress</span>
                   <span className="text-neo-accent text-lg">65%</span>
                 </div>
                 <div className="h-4 w-full bg-white border-2 border-black relative overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     whileInView={{ width: '65%' }}
                     transition={{ duration: 1.5, ease: 'easeOut' }}
                     viewport={{ once: true }}
                     className="h-full bg-neo-accent absolute top-0 left-0 border-r-2 border-black"
                   />
                 </div>
               </div>
             </div>
          </motion.div>
        </motion.div>

        {/* Recent Activity - takes 1 col */}
        <motion.div variants={itemVariants} className="space-y-6">
           <div className="flex items-center justify-between border-b-8 border-black pb-4 rotate-[1deg]">
             <h2 className="text-4xl font-black text-black tracking-tighter uppercase bg-neo-accent px-4 border-4 border-black neo-shadow-sm">Activity</h2>
             <button className="text-sm font-black text-black uppercase tracking-widest hover:underline decoration-4">All</button>
           </div>
           
           <div className="bg-white border-4 border-black neo-shadow-sm">
              <div className="divide-y-4 divide-black">
                {activities.map((activity, idx) => (
                  <motion.div 
                    key={activity.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + (idx * 0.1) }}
                    className="p-5 flex gap-4 hover:bg-neo-secondary transition-colors group cursor-pointer"
                  >
                    <div className="w-12 h-12 border-4 border-black bg-white flex items-center justify-center shrink-0 text-black group-hover:rotate-12 transition-transform neo-shadow-sm">
                      {activity.type === 'quiz' && <Target className="w-6 h-6" strokeWidth={3} />}
                      {activity.type === 'lesson' && <BookOpen className="w-6 h-6" strokeWidth={3} />}
                      {activity.type === 'certificate' && <Target className="w-6 h-6" strokeWidth={3} />}
                    </div>
                    <div>
                      <p className="text-base font-black text-black line-clamp-2 uppercase tracking-wide group-hover:underline decoration-2 underline-offset-2">{activity.title}</p>
                      <p className="text-xs font-bold text-black mt-2 tracking-widest uppercase opacity-60">Date: {activity.date}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
           </div>
        </motion.div>

      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon, color, delay }: { title: string, value: number, icon: any, color: string, delay: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 2,
      delay: delay,
      onUpdate(value) {
        setDisplayValue(Math.round(value));
      }
    });
    return controls.stop;
  }, [value, delay]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', bounce: 0.4 }}
      whileHover={{ y: -10, boxShadow: '8px 8px 0 0 rgba(0,0,0,1)' }}
      className={`p-6 border-4 border-black transition-colors flex items-center gap-6 neo-shadow-lg relative overflow-hidden group ${color} rotate-[-1deg]`}
    >
       <div className={`w-16 h-16 border-4 border-black bg-white flex items-center justify-center relative z-10 neo-shadow-sm group-hover:rotate-[15deg] transition-transform`}>
         <Icon className="w-8 h-8 text-black" strokeWidth={3} />
       </div>
       <div className="relative z-10">
         <p className="text-sm font-black text-black uppercase tracking-widest mb-1">{title}</p>
         <p className="text-5xl font-black text-black tracking-tighter" style={{ WebkitTextStroke: '1px black', color: 'white' }}>
           {displayValue.toLocaleString()}
         </p>
       </div>
    </motion.div>
  )
}
