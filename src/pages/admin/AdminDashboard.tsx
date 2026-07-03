import { Users, BookOpen, Activity, LayoutDashboard, Settings, ArrowRight } from 'lucide-react';
import { apiFetch } from '../../lib/api'; import { useState, useEffect } from 'react';
import { motion, useAnimation, animate } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  const { showNotification } = useNotification();

  useEffect(() => {
    apiFetch('/api/admin/stats').then(r => r.json()).then(setStats);
    
    // Welcome Notification after delay
    const timer = setTimeout(() => {
      showNotification('CENTRAL DATABASE SYNCHRONIZED', 'success');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!stats) {
    return (
      <div className="max-w-6xl mx-auto space-y-12 animate-pulse">
        <div className="border-b-8 border-black pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-4 w-full sm:w-1/2">
            <div className="h-16 bg-gray-300 w-3/4" />
            <div className="h-10 bg-gray-200 w-1/2 mt-2" />
          </div>
          <div className="w-48 h-16 bg-gray-300 border-4 border-black" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div key={idx} className="p-8 border-4 border-black bg-white neo-shadow-lg flex flex-col gap-6 relative">
              <div className="w-16 h-16 bg-gray-200 border-4 border-black" />
              <div className="pt-4 border-t-4 border-black space-y-2">
                <div className="h-4 bg-gray-200 w-3/4" />
                <div className="h-10 bg-gray-300 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-12">
      <motion.div variants={itemVariants} className="border-b-8 border-black pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-black uppercase" style={{ WebkitTextStroke: '2px black', color: 'transparent' }}>
            <span className="text-neo-accent" style={{ WebkitTextStroke: '0' }}>Admin</span> Overview
          </h1>
          <p className="font-bold text-xl uppercase tracking-widest bg-neo-secondary border-4 border-black inline-block px-4 py-2 neo-shadow-sm rotate-[-1deg]">Platform analytics & metrics.</p>
        </div>
        <div className="font-black text-lg bg-white border-4 border-black px-6 py-4 neo-shadow-sm rotate-[2deg] flex items-center gap-3">
            <div className="w-4 h-4 bg-neo-accent border-2 border-black animate-pulse"></div>
            SYSTEM ACTIVE
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="bg-neo-accent" delay={0.1} />
        <StatCard title="Total Courses" value={stats.totalCourses} icon={BookOpen} color="bg-neo-secondary" delay={0.2} />
        <StatCard title="Pending Registrations" value={stats.pendingRegistrations} icon={Activity} color="bg-white" delay={0.3} />
        <StatCard title="Approved Registrations" value={stats.approvedRegistrations} icon={Users} color="bg-neo-muted" delay={0.4} />
        
        <StatCard title="Today's Registrations" value={stats.todayRegistrations} icon={Activity} color="bg-neo-accent" delay={0.5} />
        <StatCard title="Weekly Registrations" value={stats.weeklyRegistrations} icon={Activity} color="bg-neo-secondary" delay={0.6} />
        <StatCard title="Rejected Requests" value={stats.rejectedRegistrations} icon={LayoutDashboard} color="bg-white" delay={0.7} />
        <StatCard title="Certificates Issued" value={stats.certificatesIssued} icon={Activity} color="bg-neo-muted" delay={0.8} />

        <StatCard title="Pending Course Apps" value={stats.pendingCourseApplications} icon={Activity} color="bg-neo-secondary" delay={0.9} />
        <StatCard title="Approved Course Apps" value={stats.approvedCourseApplications} icon={Users} color="bg-white" delay={1.0} />
        <StatCard title="Rejected Course Apps" value={stats.rejectedCourseApplications} icon={LayoutDashboard} color="bg-neo-muted" delay={1.1} />
        <StatCard title="Today's Course Apps" value={stats.todayCourseApplications} icon={Activity} color="bg-neo-accent" delay={1.2} />
      </div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white border-4 border-black neo-shadow-lg p-8 relative group transition-colors duration-300">
          
          <h2 className="text-3xl font-black text-black mb-8 uppercase tracking-widest border-b-4 border-black pb-4 inline-block bg-neo-secondary px-2 rotate-[-1deg]">
            Commands
          </h2>
          
          <div className="space-y-4">
             <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full text-left p-6 bg-white border-4 border-black hover:bg-neo-secondary transition-all flex items-center justify-between group/btn neo-shadow-sm">
                <span className="font-black text-xl text-black uppercase">Deploy New Content</span>
                <ArrowRight className="w-8 h-8 text-black group-hover/btn:translate-x-2 transition-transform" strokeWidth={3} />
             </motion.button>
             <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full text-left p-6 bg-white border-4 border-black hover:bg-neo-accent transition-all flex items-center justify-between group/btn neo-shadow-sm">
                <span className="font-black text-xl text-black uppercase">Manage Entities</span>
                <ArrowRight className="w-8 h-8 text-black group-hover/btn:translate-x-2 transition-transform" strokeWidth={3} />
             </motion.button>
             <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full text-left p-6 bg-black text-white border-4 border-black hover:bg-neo-muted hover:text-black transition-all flex items-center justify-between group/btn neo-shadow-sm">
                <span className="font-black text-xl uppercase">View System Logs</span>
                <ArrowRight className="w-8 h-8 group-hover/btn:translate-x-2 transition-transform" strokeWidth={3} />
             </motion.button>
          </div>
        </div>
      </motion.div>
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
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', bounce: 0.4 }}
      whileHover={{ y: -10, boxShadow: '8px 8px 0 0 rgba(0,0,0,1)' }}
      className={`p-8 border-4 border-black flex flex-col gap-6 relative group transition-colors duration-200 neo-shadow-lg ${color}`}
    >
       <div className="flex items-center gap-4">
         <motion.div 
           whileHover={{ rotate: 180 }}
           transition={{ duration: 0.3 }}
           className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center neo-shadow-sm group-hover:rotate-[5deg] transition-transform"
         >
           <Icon className="w-8 h-8 text-black" strokeWidth={2.5} />
         </motion.div>
       </div>
       <div className="pt-4 border-t-4 border-black">
          <p className="text-sm font-black text-black uppercase tracking-widest leading-tight mb-2">{title}</p>
          <p className="text-5xl font-black text-black">{displayValue.toLocaleString()}</p>
       </div>
    </motion.div>
  )
}
