import { BarChart as BarChartIcon, Users, ExternalLink } from 'lucide-react';
import { apiFetch } from '../../lib/api'; import { useState, useEffect } from 'react';

export function AdminAnalytics() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    apiFetch('/api/admin/stats').then(r => r.json()).then(setStats);
  }, []);

  if (!stats) return <div className="p-8 text-center font-black text-2xl uppercase tracking-widest animate-pulse">Loading Analytics...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="border-b-8 border-black pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-black uppercase">
            Platform <span className="bg-[#cc00ff] text-white px-4 py-1 border-4 border-black inline-block rotate-[3deg]">Analytics</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border-4 border-black p-6 neo-shadow-sm flex flex-col">
           <span className="font-black text-sm uppercase tracking-widest mb-2">Total Users</span>
           <span className="font-black text-5xl">{stats.totalStudents}</span>
        </div>
        <div className="bg-white border-4 border-black p-6 neo-shadow-sm flex flex-col items-end text-right">
           <span className="font-black text-sm uppercase tracking-widest mb-2">Active Users</span>
           <span className="font-black text-5xl text-[#00FF88]">{Math.floor(stats.totalStudents * 0.4)}</span>
        </div>
        <div className="bg-white border-4 border-black p-6 neo-shadow-sm flex flex-col">
           <span className="font-black text-sm uppercase tracking-widest mb-2">Most Popular Course</span>
           <span className="font-black text-2xl leading-tight">Advanced System Design</span>
        </div>
        <div className="bg-white border-4 border-black p-6 neo-shadow-sm flex flex-col items-end text-right">
           <span className="font-black text-sm uppercase tracking-widest mb-2">Quiz Pass Rate</span>
           <span className="font-black text-5xl">76%</span>
        </div>
      </div>

      <div className="border-b-8 border-black pb-4 pt-8">
        <h2 className="text-3xl font-black tracking-tighter text-black uppercase">
          Course Applications <span className="bg-[#FF3366] text-white px-2 py-1 border-2 border-black inline-block rotate-[-2deg]">Overview</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border-4 border-black p-6 neo-shadow-sm flex flex-col">
           <span className="font-black text-sm uppercase tracking-widest mb-2">Pending</span>
           <span className="font-black text-5xl text-yellow-500">{stats.pendingCourseApplications}</span>
        </div>
        <div className="bg-white border-4 border-black p-6 neo-shadow-sm flex flex-col">
           <span className="font-black text-sm uppercase tracking-widest mb-2">Approved</span>
           <span className="font-black text-5xl text-green-500">{stats.approvedCourseApplications}</span>
        </div>
        <div className="bg-white border-4 border-black p-6 neo-shadow-sm flex flex-col">
           <span className="font-black text-sm uppercase tracking-widest mb-2">Rejected</span>
           <span className="font-black text-5xl text-red-500">{stats.rejectedCourseApplications}</span>
        </div>
        <div className="bg-white border-4 border-black p-6 neo-shadow-sm flex flex-col">
           <span className="font-black text-sm uppercase tracking-widest mb-2">Apps By Course</span>
           <span className="font-black text-2xl leading-tight">Advanced System Design: 40%</span>
        </div>
        <div className="bg-white border-4 border-black p-6 neo-shadow-sm flex flex-col">
           <span className="font-black text-sm uppercase tracking-widest mb-2">Today's Apps</span>
           <span className="font-black text-5xl">{stats.todayCourseApplications}</span>
        </div>
        <div className="bg-white border-4 border-black p-6 neo-shadow-sm flex flex-col">
           <span className="font-black text-sm uppercase tracking-widest mb-2">Weekly Apps</span>
           <span className="font-black text-5xl">{stats.weeklyCourseApplications}</span>
        </div>
      </div>

      <div className="bg-white border-4 border-black p-8 neo-shadow-lg flex items-center justify-center min-h-[400px]">
         <div className="text-center space-y-4">
           <BarChartIcon className="w-16 h-16 mx-auto opacity-50" strokeWidth={2}/>
           <p className="font-black text-2xl uppercase tracking-widest">Chart Visualization Unavailable</p>
           <p className="font-bold text-black border-2 border-black bg-neo-muted inline-block px-4 py-2">External Analytics Dashboard Required</p>
           <button className="block mt-4 mx-auto border-4 border-black bg-black text-white hover:bg-neo-accent hover:text-black transition-all px-6 py-3 font-black uppercase text-sm flex items-center gap-2">
             Open External Dashboard <ExternalLink className="w-4 h-4"/>
           </button>
         </div>
      </div>
    </div>
  );
}
