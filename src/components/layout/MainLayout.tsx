import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Trophy, Settings, Bell, Search, Menu, X, LogOut, Award, Terminal, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { AuraLearningAssistant } from '../AuraLearningAssistant';

const NAVIGATION = [
  { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { name: 'Courses', href: '/student/courses', icon: BookOpen },
  { name: 'Achievements', href: '/student/achievements', icon: Trophy },
  { name: 'Certificates', href: '/student/certificates', icon: Award },
  { name: 'Settings', href: '/student/settings', icon: Settings },
];

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex bg-transparent min-h-screen text-[var(--color-foreground)] transition-colors duration-500">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 0.2 }}
        className={cn(
          "fixed lg:sticky top-0 h-screen w-64 bg-[var(--color-card)] border-r-4 border-black z-50 transition-transform duration-200 ease-in-out shrink-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-20 shrink-0 items-center justify-between px-6 border-b-4 border-black bg-neo-secondary">
          <div className="flex items-center gap-3">
            <div className="border-2 border-black p-1 bg-[var(--color-card)] neo-shadow-sm rotate-[-2deg]">
              <Terminal className="w-6 h-6 text-black" strokeWidth={2.5} />
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase text-black">AURA Base</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[var(--color-foreground)] hover:bg-[var(--color-card)] border-2 border-transparent hover:border-black p-1">
            <X className="w-6 h-6" strokeWidth={3} />
          </button>
        </div>

        <nav className="p-4 space-y-3 flex-1 overflow-y-auto">
          {NAVIGATION.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-none text-base font-bold tracking-widest uppercase transition-all border-4 border-transparent",
                isActive 
                  ? "bg-neo-accent text-black border-black neo-shadow-sm translate-x-1" 
                  : "text-[var(--color-foreground)] hover:bg-neo-muted hover:text-black hover:border-black hover:neo-shadow-sm"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("w-5 h-5 flex-shrink-0")} strokeWidth={isActive ? 3 : 2} />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t-4 border-black bg-[var(--color-card)]">
           <div className="flex items-center gap-3 mb-4 bg-neo-secondary p-3 border-4 border-black neo-shadow-sm rotate-[1deg]">
             <div className="w-12 h-12 border-2 border-black relative bg-[var(--color-card)] flex items-center justify-center">
               <img 
                 src={user?.avatar || "https://ui-avatars.com/api/?name=User&background=000&color=fff"} 
                 alt="User Avatar" 
                 className="w-full h-full object-cover"
               />
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-base font-black text-black truncate uppercase">{user?.name || "Student"}</p>
               <p className="text-xs font-bold text-black truncate uppercase tracking-widest bg-[var(--color-card)] border-2 border-black inline-block px-1 mt-1">{user?.role || "Student"}</p>
             </div>
           </div>
           
           <button 
             onClick={handleLogout}
             className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-card)] text-[var(--color-foreground)] hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)] border-4 border-black transition-colors uppercase font-black text-sm group"
           >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Disconnect
           </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex-1 flex flex-col min-w-0 relative z-10 transition-colors duration-500"
      >
        {/* Top Header */}
        <header className="h-20 bg-[var(--color-card)] border-b-4 border-black flex items-center justify-between px-4 sm:px-8 shrink-0 relative z-30 transition-colors duration-500">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[var(--color-foreground)] hover:text-black hover:bg-neo-secondary border-4 border-transparent hover:border-black p-2 transition-all neo-shadow-sm"
            >
              <Menu className="w-6 h-6" strokeWidth={3} />
            </button>
            
            {/* Search Bar - hidden on mobile */}
            <div className="hidden sm:flex items-center relative w-96 group">
              <input 
                type="text" 
                placeholder="Search Database..." 
                className="w-full bg-[var(--color-card)] border-4 border-black py-2 pl-4 pr-10 text-base font-bold text-[var(--color-foreground)] placeholder-[var(--color-foreground)]/40 focus:outline-none focus:bg-neo-secondary focus:text-black focus:neo-shadow-sm transition-all"
              />
              <Search className="w-5 h-5 absolute right-3 text-[var(--color-foreground)] group-focus-within:text-black" strokeWidth={3} />
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={toggleTheme}
              className="relative p-2 text-[var(--color-foreground)] bg-[var(--color-card)] border-4 border-black hover:text-black hover:bg-neo-secondary hover:neo-shadow-sm transition-all active:translate-x-1 active:translate-y-1 active:shadow-none overflow-hidden flex items-center justify-center w-12 h-12"
              aria-label="Toggle Theme"
            >
              <AnimatePresence mode="wait">
                {theme === 'light' ? (
                  <motion.div
                    key="sun"
                    initial={{ y: -30, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 30, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-6 h-6" strokeWidth={3} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ y: -30, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 30, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-6 h-6" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
            <button className="relative p-2 text-[var(--color-foreground)] bg-[var(--color-card)] border-4 border-black hover:text-black hover:bg-neo-accent hover:neo-shadow-sm transition-all active:translate-x-1 active:translate-y-1 active:shadow-none">
              <Bell className="w-6 h-6" strokeWidth={2.5} />
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-neo-secondary border-2 border-black rounded-full"></span>
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-neo-muted px-4 py-2 border-4 border-black neo-shadow-sm rotate-[-1deg]">
               <Trophy className="w-5 h-5 text-black" strokeWidth={3} />
               <span className="text-sm font-black text-black uppercase tracking-widest">{user?.xp?.toLocaleString() || 0} XP</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 lg:p-12 relative">
          <Outlet />
        </div>
        <AuraLearningAssistant />
      </motion.main>
    </div>
  );
}
