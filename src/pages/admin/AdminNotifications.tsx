import { Bell, Send } from 'lucide-react';

export function AdminNotifications() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="border-b-8 border-black pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-black uppercase">
            Broadcast <span className="bg-[#FFCC00] px-4 py-1 border-4 border-black inline-block rotate-[-2deg]">Alerts</span>
          </h1>
        </div>
      </div>

      <div className="bg-white border-4 border-black p-8 neo-shadow-lg relative">
        <div className="absolute top-4 right-4 bg-neo-accent border-2 border-black p-2 rotate-[10deg]">
          <Bell className="w-8 h-8 text-black" strokeWidth={3} />
        </div>

        <form className="space-y-8 mt-6">
          <div>
            <label className="block text-sm font-black text-black uppercase tracking-widest mb-2">Notification Type</label>
            <select className="w-full px-4 py-3 bg-white border-4 border-black text-lg font-bold text-black focus:outline-none focus:bg-neo-secondary focus:neo-shadow-sm transition-all appearance-none cursor-pointer">
              <option>Course Announcement</option>
              <option>Quiz Reminder</option>
              <option>Student Alert (Global)</option>
              <option>System Maintenance</option>
            </select>
          </div>

          <div>
             <label className="block text-sm font-black text-black uppercase tracking-widest mb-2">Message Content</label>
             <textarea 
               rows={5}
               className="w-full px-4 py-3 bg-white border-4 border-black text-lg font-bold text-black focus:outline-none focus:bg-neo-secondary focus:neo-shadow-sm transition-all resize-none"
               placeholder="Enter broadcast message here..."
             />
          </div>

          <button className="flex items-center justify-center gap-3 w-full bg-black text-white border-4 border-black px-6 py-4 font-black uppercase tracking-widest text-xl hover:bg-neo-accent hover:text-black transition-all neo-shadow-sm active:translate-y-1 active:shadow-none">
            <Send className="w-6 h-6" strokeWidth={3} /> Send Notification
          </button>
        </form>
      </div>
    </div>
  );
}
