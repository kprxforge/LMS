import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Settings, LogOut, Code, Menu, X, Terminal, FileText, HelpCircle, Award, BarChart, Bell, Trophy, Sun, Moon, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { AuraAdminAssistant } from '../AuraAdminAssistant';

const ADMIN_NAVIGATION = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Registrations', href: '/admin/registrations', icon: UserCheck },
  { name: 'Course Apps', href: '/admin/course-applications', icon: BookOpen },
  { name: 'Students', href: '/admin/students', icon: Users },
  { name: 'Courses', href: '/admin/courses', icon: BookOpen },
  { name: 'Learning Materials', href: '/admin/materials', icon: FileText },
  { name: 'Quizzes', href: '/admin/quizzes', icon: HelpCircle },
  { name: 'Certificates', href: '/admin/certificates', icon: Award },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Achievements', href: '/admin/achievements', icon: Trophy },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminLayout() {
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
        <div className="flex h-20 shrink-0 items-center justify-between px-6 border-b-4 border-black bg-neo-accent">
          <div className="flex items-center gap-3">
            <div className="border-2 border-black p-1.5 bg-[var(--color-card)] neo-shadow-sm rotate-3">
              <Code className="w-6 h-6 text-black" strokeWidth={3} />
            </div>
            <span className="font-black text-2xl tracking-tighter text-black uppercase">Root Access</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[var(--color-foreground)] hover:bg-[var(--color-card)] border-2 border-transparent hover:border-black p-1">
            <X className="w-6 h-6" strokeWidth={3} />
          </button>
        </div>

        <nav className="p-4 space-y-3 flex-1 overflow-y-auto">
          {ADMIN_NAVIGATION.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 text-base font-bold tracking-widest transition-all uppercase border-4 border-transparent",
                isActive 
                  ? "bg-neo-secondary text-black border-black neo-shadow-sm translate-x-1" 
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
           <div className="flex items-center gap-3 mb-4 p-3 border-4 border-black bg-neo-accent rotate-[-1deg] neo-shadow-sm">
             <div className="w-12 h-12 border-2 border-black bg-[var(--color-card)] flex items-center justify-center font-bold text-black uppercase overflow-hidden">
               {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover"/> : <Terminal className="w-6 h-6" />}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-base font-black text-black truncate uppercase">{user?.name || "SYSADMIN"}</p>
               <p className="text-xs text-black border-2 border-black bg-[var(--color-card)] inline-block px-1 mt-1 truncate uppercase tracking-widest font-bold">Privilege: Elevated</p>
             </div>
           </div>
           
           <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-black tracking-widest text-[var(--color-foreground)] bg-[var(--color-card)] border-4 border-black hover:bg-black hover:text-[var(--color-card)] transition-colors uppercase group">
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Terminate Session
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
        <header className="h-20 bg-[var(--color-card)] border-b-4 border-black flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-30 transition-colors duration-500">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[var(--color-foreground)] bg-[var(--color-card)] border-4 border-black p-2 neo-shadow-sm hover:bg-neo-secondary"
            >
              <Menu className="w-6 h-6" strokeWidth={3} />
            </button>
            <span className="hidden lg:flex ml-2 font-black tracking-tighter uppercase text-xl text-[var(--color-foreground)]">System Administration</span>
          </div>

          <div className="flex items-center gap-4">
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
            <button className="hidden sm:flex relative p-2 text-[var(--color-foreground)] bg-[var(--color-card)] border-4 border-black hover:text-black hover:bg-neo-accent hover:neo-shadow-sm transition-all active:translate-x-1 active:translate-y-1 active:shadow-none">
              <Bell className="w-6 h-6" strokeWidth={2.5} />
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-neo-secondary border-2 border-black rounded-full"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-8 lg:p-12">
          <Outlet />
        </div>
        <AuraAdminAssistant />
      </motion.main>
    </div>
  );
}
