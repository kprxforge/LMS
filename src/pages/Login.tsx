import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Loader2, Shield, User, CheckCircle, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function Login() {
  const [email, setEmail] = useState('student@example.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [role, setRole] = useState<'student' | 'admin' | null>(null);
  const [step, setStep] = useState<'intro' | 'cta' | 'choice' | 'student-choice' | 'registration-form' | 'form'>('intro');
  const [regData, setRegData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    dob: '',
    gender: 'Male',
    country: '',
    state: '',
    city: '',
    education: '',
    college: '',
    interestedCourse: 'Python Full Stack',
    learningMode: 'Online',
    password: '',
    confirmPassword: '',
    terms: false
  });
  const [regLoading, setRegLoading] = useState(false);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (regData.password !== regData.confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }
    if (!regData.terms) {
      showNotification('You must agree to terms', 'error');
      return;
    }
    setRegLoading(true);
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData),
      });
      if (!res.ok) throw new Error('Registration failed');
      
      const data = await res.json();
      
      setTimeout(() => {
        setRegLoading(false);
        showNotification('Your application has been submitted successfully. Your registration is under administrator review. You will receive a confirmation after approval.', 'success');
        
        if (data.user && data.token) {
          login(data.user, data.token);
          setTimeout(() => {
            navigate('/student/dashboard');
          }, 1000);
        } else {
          setStep('choice'); 
        }
      }, 1500);
    } catch (err: any) {
      setRegLoading(false);
      showNotification(err.message, 'error');
    }
  };
  const { login } = useAuth();
  const { showNotification } = useNotification();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Progress through intro step automatically
  useEffect(() => {
    const timer = setTimeout(() => {
      setStep('cta');
    }, 4500); // Wait for intro animations to finish
    return () => clearTimeout(timer);
  }, []);

  const handleRoleSelect = (selectedRole: 'student' | 'admin') => {
    setRole(selectedRole);
    if (selectedRole === 'admin') {
      setEmail('admin@auralms.com');
      setPassword('admin123');
      setStep('form');
    } else {
      setStep('student-choice');
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Invalid credentials');
      }
      
      const data = await res.json();
      
      // Delay for "VERIFYING..." animation
      setTimeout(() => {
        login(data.user, data.token);
        setSuccess(true);
        showNotification(`ACCESS VERIFIED: ${data.user.name}`, 'success');
        
        // Wait for success animation before navigating
        setTimeout(() => {
          if (data.user.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/student/dashboard');
          }
        }, 1500);
      }, 2000);
      
    } catch (err: any) {
      showNotification(err.message || 'Access Denied', 'error');
      setLoading(false);
    }
  };

  const letterContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.8
      }
    }
  };

  const letterItem = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      animate={success ? { scale: 1.1, opacity: 0, filter: 'blur(20px)' } : { scale: 1, opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="min-h-screen bg-transparent flex flex-col items-center justify-start py-12 px-4 sm:px-6 lg:px-8 relative z-10 overflow-y-auto text-[var(--color-foreground)] transition-colors duration-500"
    >
      


      {/* Permanently Visible Branding Section */}
      <div className="flex flex-col items-center justify-center text-center w-full max-w-4xl mb-12">
        <motion.div 
          initial={{ y: -300, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5, duration: 1.2 }}
          className="border-8 border-black p-8 bg-neo-accent neo-shadow-lg rotate-3 mb-10"
        >
           <BookOpen className="w-24 h-24 text-black" strokeWidth={3} />
        </motion.div>
        
        <motion.h1 
          variants={letterContainer}
          initial="hidden"
          animate="show"
          className="text-6xl sm:text-8xl font-black text-[var(--color-foreground)] uppercase tracking-tighter flex justify-center space-x-3 mb-8" 
          style={{ WebkitTextStroke: '2px var(--color-foreground)' }}
        >
          {['A', 'U', 'R', 'A', ' ', 'L', 'M', 'S'].map((char, index) => (
            char === ' ' ? <span key={index}>&nbsp;</span> : <motion.span key={index} variants={letterItem}>{char}</motion.span>
          ))}
        </motion.h1>

        <div className="space-y-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2 }}
            className="text-2xl font-black uppercase tracking-[0.2em] transform rotate-[-1deg] bg-neo-secondary border-2 border-black px-4 py-1 inline-block text-black"
          >
            Transform Learning Into Achievement
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3 }}
            className="text-xl font-bold uppercase tracking-widest opacity-80"
          >
            Your Learning Journey Starts Here
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.5 }}
            className="text-lg font-medium opacity-60 italic"
          >
            Ready to unlock your future?
          </motion.p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'cta' && (
          <motion.div
            key="cta"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2, y: 20 }}
            className="flex flex-col items-center"
          >
            <motion.button
              onClick={() => setStep('choice')}
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                y: [0, -10, 0],
                boxShadow: [
                  '8px 8px 0px 0px #000',
                  '16px 16px 0px 0px #000',
                  '8px 8px 0px 0px #000'
                ]
              }}
              transition={{ 
                y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                boxShadow: { repeat: Infinity, duration: 2, ease: "easeInOut" }
              }}
              className="bg-neo-secondary border-8 border-black px-16 py-8 font-black text-6xl uppercase tracking-tighter text-black neo-shadow hover:bg-neo-accent transition-colors"
            >
              LOGIN NOW
            </motion.button>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 300 }}
              className="h-2 bg-black mt-12 rounded-full"
              transition={{ delay: 0.5, duration: 1.5 }}
            />
          </motion.div>
        )}

        {step === 'choice' && (
          <motion.div
            key="choice"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-5xl mx-auto"
          >
            <motion.h2
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center text-4xl sm:text-5xl font-black uppercase tracking-tighter mb-16 text-black"
            >
              Choose Your Access Path
            </motion.h2>

            <div className="flex flex-col md:flex-row items-center justify-center gap-12 relative">
              <svg className="absolute hidden lg:block w-full h-full pointer-events-none z-0" style={{ filter: 'drop-shadow(4px 4px 0px #000)' }}>
                <motion.path
                  d="M 250, 150 Q 500, 150 750, 150"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray="20 20"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-neo-accent"
                />
              </svg>

              <motion.div
                initial={{ x: -200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                whileHover={{ scale: 1.05, rotate: -2 }}
                onClick={() => handleRoleSelect('student')}
                className="w-full max-w-sm bg-[var(--color-card)] border-8 border-black p-10 cursor-pointer neo-shadow-lg relative z-10 group"
              >
                <div className="bg-neo-secondary border-4 border-black p-4 inline-block mb-6 group-hover:rotate-12 transition-transform">
                  <User className="w-12 h-12 text-black" strokeWidth={3} />
                </div>
                <h3 className="text-4xl font-black uppercase tracking-tighter mb-4 text-black">Student Portal</h3>
                <p className="text-lg font-bold opacity-70 uppercase text-black">Enter the Hall of Knowledge</p>
                <div className="mt-8 flex justify-end">
                   <div className="w-12 h-12 border-4 border-black bg-black flex items-center justify-center text-white transform group-hover:translate-x-2 transition-transform">➜</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                whileHover={{ scale: 1.05, rotate: 2 }}
                onClick={() => handleRoleSelect('admin')}
                className="w-full max-w-sm bg-[var(--color-card)] border-8 border-black p-10 cursor-pointer neo-shadow-lg relative z-10 group"
              >
                <div className="bg-neo-accent border-4 border-black p-4 inline-block mb-6 group-hover:rotate-[-12deg] transition-transform">
                  <Shield className="w-12 h-12 text-black" strokeWidth={3} />
                </div>
                <h3 className="text-4xl font-black uppercase tracking-tighter mb-4 text-black">Admin Portal</h3>
                <p className="text-lg font-bold opacity-70 uppercase text-black">Access System Core</p>
                <div className="mt-8 flex justify-end">
                   <div className="w-12 h-12 border-4 border-black bg-black flex items-center justify-center text-white transform group-hover:translate-x-2 transition-transform">➜</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {step === 'student-choice' && (
          <motion.div
            key="student-choice"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-5xl mx-auto"
          >
            <motion.h2
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center text-4xl sm:text-5xl font-black uppercase tracking-tighter mb-16 text-black"
            >
              Select Student Type
            </motion.h2>

            <div className="flex flex-col md:flex-row items-center justify-center gap-12 relative">
              <motion.div
                initial={{ x: -200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                whileHover={{ scale: 1.05, rotate: -2 }}
                onClick={() => setStep('registration-form')}
                className="w-full max-w-sm bg-[var(--color-card)] border-8 border-black p-10 cursor-pointer neo-shadow-lg relative z-10 group"
              >
                <div className="bg-neo-secondary border-4 border-black p-4 inline-block mb-6 group-hover:rotate-12 transition-transform">
                  <User className="w-12 h-12 text-black" strokeWidth={3} />
                </div>
                <h3 className="text-4xl font-black uppercase tracking-tighter mb-4 text-black">New Student</h3>
                <p className="text-lg font-bold opacity-70 uppercase text-black">Register Your Account</p>
                <div className="mt-8 flex justify-end">
                   <div className="w-12 h-12 border-4 border-black bg-black flex items-center justify-center text-white transform group-hover:translate-x-2 transition-transform">➜</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                whileHover={{ scale: 1.05, rotate: 2 }}
                onClick={() => {
                  setEmail('student@example.com');
                  setPassword('password');
                  setStep('form');
                }}
                className="w-full max-w-sm bg-[var(--color-card)] border-8 border-black p-10 cursor-pointer neo-shadow-lg relative z-10 group"
              >
                <div className="bg-neo-accent border-4 border-black p-4 inline-block mb-6 group-hover:rotate-[-12deg] transition-transform">
                  <CheckCircle className="w-12 h-12 text-black" strokeWidth={3} />
                </div>
                <h3 className="text-4xl font-black uppercase tracking-tighter mb-4 text-black">Existing Student</h3>
                <p className="text-lg font-bold opacity-70 uppercase text-black">Login to Portal</p>
                <div className="mt-8 flex justify-end">
                   <div className="w-12 h-12 border-4 border-black bg-black flex items-center justify-center text-white transform group-hover:translate-x-2 transition-transform">➜</div>
                </div>
              </motion.div>
            </div>
            <button 
              type="button"
              onClick={() => setStep('choice')}
              className="w-full mt-10 text-center font-black uppercase text-sm tracking-widest opacity-60 hover:opacity-100 transition-opacity"
            >
              ← Back to Role Selection
            </button>
          </motion.div>
        )}

        {step === 'registration-form' && (
          <motion.div 
            key="registration-form"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="w-full max-w-4xl mx-auto relative z-20"
          >
            <div className="bg-[var(--color-card)] py-10 px-6 sm:px-12 border-8 border-black neo-shadow-xl transition-all duration-500">
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-black uppercase tracking-tighter text-center mb-10 text-black"
              >
                Student Registration
              </motion.h2>

              <form className="space-y-6" onSubmit={handleRegister}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Column 1 */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-black text-black uppercase tracking-[0.1em] mb-2">Full Name</label>
                      <input required value={regData.fullName} onChange={(e) => setRegData({...regData, fullName: e.target.value})} className="w-full px-4 py-3 bg-[var(--color-card)] border-4 border-black font-bold text-lg focus:bg-neo-secondary text-black" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-black uppercase tracking-[0.1em] mb-2">Email Address</label>
                      <input type="email" required value={regData.email} onChange={(e) => setRegData({...regData, email: e.target.value})} className="w-full px-4 py-3 bg-[var(--color-card)] border-4 border-black font-bold text-lg focus:bg-neo-secondary text-black" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-black uppercase tracking-[0.1em] mb-2">Mobile Number (WhatsApp)</label>
                      <input required value={regData.mobile} onChange={(e) => setRegData({...regData, mobile: e.target.value})} className="w-full px-4 py-3 bg-[var(--color-card)] border-4 border-black font-bold text-lg focus:bg-neo-secondary text-black" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-black uppercase tracking-[0.1em] mb-2">Date of Birth</label>
                      <input type="date" required value={regData.dob} onChange={(e) => setRegData({...regData, dob: e.target.value})} className="w-full px-4 py-3 bg-[var(--color-card)] border-4 border-black font-bold text-lg focus:bg-neo-secondary text-black" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-black uppercase tracking-[0.1em] mb-2">Gender</label>
                      <select value={regData.gender} onChange={(e) => setRegData({...regData, gender: e.target.value})} className="w-full px-4 py-3 bg-[var(--color-card)] border-4 border-black font-bold text-lg focus:bg-neo-secondary text-black">
                        <option>Male</option><option>Female</option><option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-black text-black uppercase tracking-[0.1em] mb-2">Country</label>
                      <input required value={regData.country} onChange={(e) => setRegData({...regData, country: e.target.value})} className="w-full px-4 py-3 bg-[var(--color-card)] border-4 border-black font-bold text-lg focus:bg-neo-secondary text-black" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-black uppercase tracking-[0.1em] mb-2">State & City</label>
                      <div className="flex gap-2">
                        <input required placeholder="State" value={regData.state} onChange={(e) => setRegData({...regData, state: e.target.value})} className="w-1/2 px-4 py-3 bg-[var(--color-card)] border-4 border-black font-bold text-lg focus:bg-neo-secondary text-black" />
                        <input required placeholder="City" value={regData.city} onChange={(e) => setRegData({...regData, city: e.target.value})} className="w-1/2 px-4 py-3 bg-[var(--color-card)] border-4 border-black font-bold text-lg focus:bg-neo-secondary text-black" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Column 2 */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-black text-black uppercase tracking-[0.1em] mb-2">Educational Qualification</label>
                      <input required value={regData.education} onChange={(e) => setRegData({...regData, education: e.target.value})} className="w-full px-4 py-3 bg-[var(--color-card)] border-4 border-black font-bold text-lg focus:bg-neo-secondary text-black" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-black uppercase tracking-[0.1em] mb-2">College / School Name</label>
                      <input required value={regData.college} onChange={(e) => setRegData({...regData, college: e.target.value})} className="w-full px-4 py-3 bg-[var(--color-card)] border-4 border-black font-bold text-lg focus:bg-neo-secondary text-black" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-black uppercase tracking-[0.1em] mb-2">Password</label>
                      <input type="password" required value={regData.password} onChange={(e) => setRegData({...regData, password: e.target.value})} className="w-full px-4 py-3 bg-[var(--color-card)] border-4 border-black font-bold text-lg focus:bg-neo-secondary text-black" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-black uppercase tracking-[0.1em] mb-2">Confirm Password</label>
                      <input type="password" required value={regData.confirmPassword} onChange={(e) => setRegData({...regData, confirmPassword: e.target.value})} className="w-full px-4 py-3 bg-[var(--color-card)] border-4 border-black font-bold text-lg focus:bg-neo-secondary text-black" />
                    </div>
                    <label className="flex items-center cursor-pointer group mt-6">
                      <div className="relative w-6 h-6 bg-white border-4 border-black mr-3 flex items-center justify-center transition-colors group-hover:bg-neo-muted">
                        <input type="checkbox" checked={regData.terms} onChange={(e) => setRegData({...regData, terms: e.target.checked})} className="peer absolute opacity-0 w-full h-full cursor-pointer" />
                        <div className="peer-checked:opacity-100 opacity-0 transition-opacity">
                           <svg width="16" height="12" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                             <path d="M2 6.5L7 11.5L16 2" stroke="black" strokeWidth="4" strokeLinecap="square"/>
                           </svg>
                        </div>
                      </div>
                      <span className="text-xs font-black text-black uppercase">I agree to Terms & Conditions</span>
                    </label>
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    disabled={regLoading}
                    className="w-full flex justify-center items-center py-5 px-4 border-4 border-black text-black bg-neo-accent hover:bg-neo-secondary font-black text-2xl uppercase transition-all neo-shadow hover:-translate-y-1 active:translate-y-0 disabled:opacity-90 relative overflow-hidden"
                  >
                    {regLoading ? 'Submitting...' : 'Register'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setStep('student-choice')}
                    className="w-full mt-4 text-center font-black uppercase text-xs tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                  >
                    ← Back to Options
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {step === 'form' && (
          <motion.div 
            key="form"
            className="sm:mx-auto sm:w-full sm:max-w-md relative z-20"
          >
            <div className="bg-[var(--color-card)] py-10 px-6 sm:px-12 border-8 border-black neo-shadow-xl transition-all duration-500">
              
              <motion.div 
                layoutId="role-icon"
                className={cn(
                  "w-20 h-20 border-4 border-black flex items-center justify-center mb-8 mx-auto rotate-3 neo-shadow-sm",
                  role === 'student' ? 'bg-neo-secondary' : 'bg-neo-accent'
                )}
              >
                {role === 'student' ? <User className="w-10 h-10 text-black" /> : <Shield className="w-10 h-10 text-black" />}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-black uppercase tracking-tighter text-center mb-10 text-black"
              >
                {role === 'student' ? 'Student Intelligence' : 'Central Administration'}
              </motion.h2>

              <form className="space-y-8" onSubmit={handleLogin}>
                <motion.div 
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="group"
                >
                  <label className="block text-sm font-black text-black uppercase tracking-[0.2em] mb-2">Identification</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading || success}
                    className="appearance-none block w-full px-6 py-4 bg-[var(--color-card)] border-4 border-black text-black placeholder:text-black/40 focus:outline-none focus:bg-neo-secondary focus:shadow-[0_0_20px_rgba(255,107,107,0.4)] font-bold text-xl transition-all disabled:opacity-50"
                  />
                </motion.div>

                <motion.div 
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="group relative"
                >
                  <label className="block text-sm font-black text-black uppercase tracking-[0.2em] mb-2">Access Key</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || success}
                    className="appearance-none block w-full px-6 py-4 bg-[var(--color-card)] border-4 border-black text-black placeholder:text-black/40 focus:outline-none focus:bg-neo-secondary focus:shadow-[0_0_20px_rgba(255,107,107,0.4)] font-bold text-xl transition-all disabled:opacity-50"
                  />
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-between"
                >
                  <label className="flex items-center cursor-pointer group">
                    <div className="relative w-7 h-7 bg-white border-4 border-black mr-3 flex items-center justify-center transition-colors group-hover:bg-neo-muted">
                      <input type="checkbox" className="peer absolute opacity-0 w-full h-full cursor-pointer" />
                      <div className="peer-checked:opacity-100 opacity-0 transition-opacity">
                         <svg width="20" height="16" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M2 6.5L7 11.5L16 2" stroke="black" strokeWidth="4" strokeLinecap="square"/>
                         </svg>
                      </div>
                    </div>
                    <span className="text-sm font-black text-black uppercase">Remember Me</span>
                  </label>
                  <a href="#" className="font-bold text-sm text-black underline hover:bg-neo-secondary px-1 uppercase tracking-widest transition-colors">Lost?</a>
                </motion.div>

                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="pt-4"
                >
                  <button
                    disabled={loading || success}
                    className="w-full flex justify-center items-center py-5 px-4 border-4 border-black text-black bg-neo-accent hover:bg-neo-secondary font-black text-2xl uppercase transition-all neo-shadow hover:-translate-y-1 active:translate-y-0 disabled:opacity-90 relative overflow-hidden"
                  >
                    {loading && (
                       <motion.div 
                         className="absolute inset-0 bg-black/10 origin-left"
                         initial={{ scaleX: 0 }}
                         animate={{ scaleX: 1 }}
                         transition={{ duration: 2 }}
                       />
                    )}
                    <AnimatePresence mode='wait'>
                      {success ? (
                        <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center">
                          <CheckCircle className="w-8 h-8 mr-3" /> ACCESS GRANTED
                        </motion.div>
                      ) : loading ? (
                        <motion.div key="loading" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex items-center">
                          <Loader2 className="w-8 h-8 animate-spin mr-3" /> VERIFYING ACCESS...
                        </motion.div>
                      ) : (
                        <motion.span key="auth" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                          Authenticate
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setStep('choice')}
                    className="w-full mt-4 text-center font-black uppercase text-xs tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                  >
                    Change Access Path
                  </button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Ornaments */}
      <AnimatePresence>
        {step === 'form' && (
          <>
            <motion.div 
              initial={{ x: -100, y: -100, opacity: 0, rotate: -15 }}
              animate={{ x: 0, y: 0, opacity: 1, rotate: -5 }}
              exit={{ x: -100, opacity: 0 }}
              className="absolute top-10 left-10 hidden lg:block"
            >
              <div className="bg-neo-secondary border-4 border-black p-4 neo-shadow font-black uppercase text-2xl text-black">
                Education<br/>Revolution!
              </div>
            </motion.div>

            <motion.div 
              initial={{ x: 100, y: 100, opacity: 0, rotate: 15 }}
              animate={{ x: 0, y: 0, opacity: 1, rotate: 3 }}
              exit={{ x: 100, opacity: 0 }}
              className="absolute bottom-20 right-10 hidden lg:block"
            >
              <div className="bg-neo-muted border-4 border-black p-4 neo-shadow font-black uppercase text-xl text-black">
                AURA BASE<br/>Protocol Active
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
