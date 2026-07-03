import { apiFetch } from '../../lib/api'; import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Save, User, Mail, Lock, Bell, Palette } from 'lucide-react';

export function Settings() {
  const { user, updateUser } = useAuth();
  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    notifications: true,
    theme: 'dark' // Default changed to dark for cyberpunk
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 600));
      updateUser({
        name: formData.name,
      });
      showNotification('SYSTEM CONFIGURATION UPDATED', 'success');
    } catch (e) {
      showNotification('FAIL: CONFIG_UPDATE_ERROR', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 pb-12">
      <div className="border-b-8 border-black pb-8 flex items-center justify-between rotate-[1deg] mt-4">
        <div>
           <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-black uppercase" style={{ WebkitTextStroke: '2px black', color: 'transparent' }}>
              <span className="text-neo-secondary" style={{ WebkitTextStroke: '0' }}>Settings</span>
           </h1>
           <p className="font-bold text-lg uppercase tracking-widest bg-white border-4 border-black inline-block px-4 py-2 neo-shadow-sm rotate-[-1deg] mt-4">User Configuration.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Settings */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white border-4 border-black p-6 sm:p-8 space-y-8 relative group transition-colors duration-300 neo-shadow-xl rotate-[1deg]">
            
            <h2 className="text-3xl font-black text-black uppercase tracking-tight flex items-center gap-4 border-b-4 border-black pb-4">
              <div className="bg-neo-accent p-2 border-2 border-black rotate-[-5deg]">
                <User className="w-8 h-8 text-black" strokeWidth={3} /> 
              </div>
              Profile Info
            </h2>
            
            <div className="flex items-center gap-6">
               <div className="relative">
                 <img src={user?.avatar} alt="Avatar" className="w-24 h-24 border-4 border-black relative z-10 neo-shadow-sm bg-neo-muted object-cover rotate-[-2deg]" />
               </div>
               <button className="px-6 py-3 text-sm font-black text-black uppercase tracking-widest border-4 border-black bg-white hover:bg-neo-secondary hover:-translate-y-1 transition-all neo-shadow-sm active:translate-y-0 active:shadow-none">
                 Upload Avatar
               </button>
            </div>

            <div className="space-y-6 pt-6 border-t-4 border-black border-dashed">
              <div>
                <label className="block text-sm font-black text-black uppercase tracking-widest mb-2">Full Name</label>
                <div className="relative">
                  <User className="w-6 h-6 text-black absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={3}/>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-14 pr-4 py-3 bg-white border-4 border-black text-lg font-bold text-black focus:outline-none focus:bg-neo-accent focus:neo-shadow-sm transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-black uppercase tracking-widest mb-2">Email Address</label>
                <div className="relative opacity-60">
                  <Mail className="w-6 h-6 text-black absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={3}/>
                  <input 
                    type="email" 
                    value={formData.email}
                    disabled
                    className="w-full pl-14 pr-4 py-3 bg-gray-200 border-4 border-black text-lg font-bold text-black cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border-4 border-black p-6 sm:p-8 space-y-8 relative group transition-colors duration-300 neo-shadow-xl rotate-[-1deg]">
            
            <h2 className="text-3xl font-black text-black uppercase tracking-tight flex items-center gap-4 border-b-4 border-black pb-4">
              <div className="bg-neo-secondary p-2 border-2 border-black rotate-[5deg]">
                <Lock className="w-8 h-8 text-black" strokeWidth={3}/> 
              </div>
              Security
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-black text-black uppercase tracking-widest mb-2">Current Password</label>
                <input 
                  type="password" 
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-white border-4 border-black text-lg font-bold text-black focus:outline-none focus:bg-neo-accent focus:neo-shadow-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-black uppercase tracking-widest mb-2">New Password</label>
                <input 
                  type="password" 
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-white border-4 border-black text-lg font-bold text-black focus:outline-none focus:bg-neo-accent focus:neo-shadow-sm transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-8">
          <div className="bg-white border-4 border-black p-6 sm:p-8 space-y-8 relative group transition-colors duration-300 neo-shadow-xl rotate-[1deg]">
             
             <h2 className="text-2xl font-black text-black uppercase tracking-tight flex items-center gap-4 border-b-4 border-black pb-4">
              <div className="bg-neo-muted p-2 border-2 border-black rotate-[-2deg]">
                <Bell className="w-6 h-6 text-black" strokeWidth={3}/> 
              </div>
              Preferences
            </h2>
            
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                 <p className="text-sm font-black uppercase tracking-widest text-black">Notifications</p>
                 <p className="text-xs font-bold uppercase text-black opacity-80 border-l-4 border-black pl-2">Email &amp; push alerts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only" checked={formData.notifications} onChange={(e) => setFormData({...formData, notifications: e.target.checked})} />
                <div className={`w-14 h-8 border-4 border-black flex items-center transition-colors ${formData.notifications ? 'bg-neo-accent' : 'bg-gray-300'}`}>
                   <div className={`w-6 h-6 border-2 border-black bg-white transition-transform ${formData.notifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </label>
            </div>

            <div className="pt-6 border-t-4 border-black border-dashed">
               <h3 className="text-sm font-black uppercase tracking-widest text-black mb-4 flex items-center gap-3">
                 <Palette className="w-5 h-5" strokeWidth={3}/> UI Theme
               </h3>
               <div className="grid grid-cols-2 gap-4">
                 <button 
                  onClick={() => setFormData({...formData, theme: 'light'})}
                  className={`px-4 py-3 text-sm font-black uppercase tracking-widest border-4 border-black transition-colors ${formData.theme === 'light' ? 'bg-black text-white neo-shadow-sm' : 'bg-white text-black hover:bg-neo-secondary'}`}
                 >
                   Light
                 </button>
                 <button 
                  onClick={() => setFormData({...formData, theme: 'dark'})}
                  className={`px-4 py-3 text-sm font-black uppercase tracking-widest border-4 border-black transition-colors ${formData.theme === 'dark' ? 'bg-black text-white neo-shadow-sm' : 'bg-white text-black hover:bg-neo-secondary'}`}
                 >
                   Dark
                 </button>
               </div>
            </div>
          </div>
        </div>

      </div>

      <div className="flex justify-end pt-8">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-3 bg-white text-black border-4 border-black px-8 py-4 font-black uppercase tracking-widest text-lg hover:bg-neo-accent transition-all neo-shadow-lg hover:-translate-y-1 hover:neo-shadow-xl disabled:opacity-50 active:translate-x-1 active:translate-y-1 active:shadow-none rotate-[-1deg]"
        >
          <Save className="w-6 h-6" strokeWidth={3}/>
          {loading ? 'Saving...' : 'Save Config'}
        </button>
      </div>

    </div>
  );
}
