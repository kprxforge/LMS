import React, { useState, useEffect, useRef } from 'react';
import { Settings, User, Lock, Save, Image as ImageIcon, Upload, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export function AdminSettings() {
  const { user, updateUser } = useAuth();
  const { showNotification } = useNotification();

  const [displayName, setDisplayName] = useState('Super Admin');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [wallpaper, setWallpaper] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [blur, setBlur] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
    }
  }, [user]);

  useEffect(() => {
    setWallpaper(localStorage.getItem('admin_wallpaper'));
    const storedBrightness = localStorage.getItem('admin_wallpaper_brightness');
    setBrightness(storedBrightness !== null ? Number(storedBrightness) : 100);
    const storedBlur = localStorage.getItem('admin_wallpaper_blur');
    setBlur(storedBlur !== null ? Number(storedBlur) : 0);
    const storedOpacity = localStorage.getItem('admin_wallpaper_opacity');
    setOpacity(storedOpacity !== null ? Number(storedOpacity) : 100);
  }, []);

  const updateWallpaper = (newWallpaper: string | null, newBrightness: number, newBlur: number, newOpacity: number) => {
    if (newWallpaper) localStorage.setItem('admin_wallpaper', newWallpaper);
    else localStorage.removeItem('admin_wallpaper');
    
    localStorage.setItem('admin_wallpaper_brightness', newBrightness.toString());
    localStorage.setItem('admin_wallpaper_blur', newBlur.toString());
    localStorage.setItem('admin_wallpaper_opacity', newOpacity.toString());
    
    window.dispatchEvent(new Event('wallpaper-changed'));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setWallpaper(result);
        updateWallpaper(result, brightness, blur, opacity);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveWallpaper = () => {
    setWallpaper(null);
    updateWallpaper(null, 100, 0, 100);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRestoreDefault = () => {
    setWallpaper(null);
    setBrightness(100);
    setBlur(0);
    setOpacity(100);
    updateWallpaper(null, 100, 0, 100);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setBrightness(val);
    updateWallpaper(wallpaper, val, blur, opacity);
  };

  const handleBlurChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setBlur(val);
    updateWallpaper(wallpaper, brightness, val, opacity);
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setOpacity(val);
    updateWallpaper(wallpaper, brightness, blur, val);
  };

  const handleSave = () => {
    updateUser({ name: displayName });
    setCurrentPassword('');
    setNewPassword('');
    showNotification('SYSTEM CONFIGURATION UPDATED', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="border-b-8 border-black pb-8 flex items-center justify-between rotate-[1deg] mt-4">
        <div>
           <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-black uppercase" style={{ WebkitTextStroke: '2px black', color: 'transparent' }}>
              <span className="text-neo-secondary" style={{ WebkitTextStroke: '0' }}>Admin Settings</span>
           </h1>
           <p className="font-bold text-lg uppercase tracking-widest bg-white border-4 border-black inline-block px-4 py-2 neo-shadow-sm rotate-[-1deg] mt-4">System configuration.</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white border-4 border-black p-6 sm:p-8 space-y-8 relative group transition-colors duration-300 neo-shadow-xl rotate-[1deg]">
          <h2 className="text-3xl font-black text-black uppercase tracking-tight flex items-center gap-4 border-b-4 border-black pb-4">
            <div className="bg-neo-accent p-2 border-2 border-black rotate-[-5deg]">
              <User className="w-8 h-8 text-black" strokeWidth={3} /> 
            </div>
            Admin Profile Info
          </h2>
          
          <div className="space-y-6 pt-6 border-t-4 border-black border-dashed">
            <div>
              <label className="block text-sm font-black text-black uppercase tracking-widest mb-2">Display Name</label>
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-white border-4 border-black text-lg font-bold text-black focus:outline-none focus:bg-neo-accent focus:neo-shadow-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-black uppercase tracking-widest mb-2">Admin Email</label>
              <input 
                type="email" 
                defaultValue="admin@auralms.com"
                className="w-full px-4 py-3 bg-gray-200 border-4 border-black text-lg font-bold text-black cursor-not-allowed"
                disabled
              />
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
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border-4 border-black text-lg font-bold text-black focus:outline-none focus:bg-neo-accent focus:neo-shadow-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-black uppercase tracking-widest mb-2">New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border-4 border-black text-lg font-bold text-black focus:outline-none focus:bg-neo-accent focus:neo-shadow-sm transition-all"
              />
            </div>
          </div>
        </div>
        <div className="bg-white border-4 border-black p-6 sm:p-8 space-y-8 relative group transition-colors duration-300 neo-shadow-xl rotate-[1deg]">
          <h2 className="text-3xl font-black text-black uppercase tracking-tight flex items-center gap-4 border-b-4 border-black pb-4">
            <div className="bg-neo-accent p-2 border-2 border-black rotate-[-5deg]">
              <ImageIcon className="w-8 h-8 text-black" strokeWidth={3}/> 
            </div>
            Background Wallpaper
          </h2>
          
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-3 bg-white text-black border-4 border-black px-6 py-4 font-black uppercase tracking-widest text-sm hover:bg-neo-secondary transition-all neo-shadow-sm hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  <Upload className="w-5 h-5" strokeWidth={3} />
                  Upload Wallpaper
                </button>
                
                <button 
                  onClick={handleRemoveWallpaper}
                  disabled={!wallpaper}
                  className={`w-full flex items-center justify-center gap-3 px-6 py-4 font-black uppercase tracking-widest text-sm border-4 border-black transition-all ${wallpaper ? 'bg-red-400 text-black hover:bg-red-500 neo-shadow-sm hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none' : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-50'}`}
                >
                  <X className="w-5 h-5" strokeWidth={3} />
                  Remove Wallpaper
                </button>
                
                <button 
                  onClick={handleRestoreDefault}
                  className="w-full flex items-center justify-center gap-3 bg-white text-black border-4 border-black px-6 py-4 font-black uppercase tracking-widest text-sm hover:bg-neo-accent transition-all neo-shadow-sm hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  <RefreshCw className="w-5 h-5" strokeWidth={3} />
                  Restore Default
                </button>
              </div>

              <div className="border-4 border-black bg-gray-100 flex items-center justify-center relative overflow-hidden min-h-[200px] neo-shadow-inner">
                {wallpaper ? (
                  <div 
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${wallpaper})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: `brightness(${brightness}%) blur(${blur}px)`,
                      opacity: opacity / 100
                    }}
                  />
                ) : (
                  <div className="text-center font-bold text-gray-400 uppercase tracking-widest flex flex-col items-center">
                    <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                    <span>No Wallpaper</span>
                    <span className="text-xs opacity-70 mt-1">Default background active</span>
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black text-white text-xs font-black uppercase px-2 py-1">Preview</div>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t-4 border-black border-dashed">
              <h3 className="font-black uppercase tracking-widest text-lg">Adjustments</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-black text-black uppercase tracking-widest">Brightness</label>
                  <span className="font-bold border-2 border-black px-2 py-1 bg-white">{brightness}%</span>
                </div>
                <input 
                  type="range" 
                  min="70" max="130" 
                  value={brightness} 
                  onChange={handleBrightnessChange}
                  className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer border-2 border-black outline-none focus:neo-shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-black text-black uppercase tracking-widest">Blur</label>
                  <span className="font-bold border-2 border-black px-2 py-1 bg-white">{blur}px</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="8" 
                  value={blur} 
                  onChange={handleBlurChange}
                  className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer border-2 border-black outline-none focus:neo-shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-black text-black uppercase tracking-widest">Opacity</label>
                  <span className="font-bold border-2 border-black px-2 py-1 bg-white">{opacity}%</span>
                </div>
                <input 
                  type="range" 
                  min="80" max="100" 
                  value={opacity} 
                  onChange={handleOpacityChange}
                  className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer border-2 border-black outline-none focus:neo-shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-8">
        <button 
          onClick={handleSave}
          className="flex items-center gap-3 bg-white text-black border-4 border-black px-8 py-4 font-black uppercase tracking-widest text-lg hover:bg-neo-accent transition-all neo-shadow-lg hover:-translate-y-1 hover:neo-shadow-xl active:translate-x-1 active:translate-y-1 active:shadow-none rotate-[-1deg]"
        >
          <Save className="w-6 h-6" strokeWidth={3}/>
          Save Configuration
        </button>
      </div>
    </div>
  );
}
