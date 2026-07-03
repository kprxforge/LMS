import { apiFetch } from '../../lib/api'; import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, BookOpen, X, Loader2, Save } from 'lucide-react';
import { Course } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'motion/react';

export function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showNotification } = useNotification();
  
  const [newCourse, setNewCourse] = useState({ title: '', category: '', level: 'Beginner', duration: '' });

  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    apiFetch('/api/courses').then(r => r.json()).then(setCourses);
    
    // Load autosaved draft
    const draft = localStorage.getItem('autosave_newCourse');
    if (draft) {
      try {
        setNewCourse(JSON.parse(draft));
      } catch(e) {}
    }
  }, []);

  // Autosave periodically whenever newCourse changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (newCourse.title || newCourse.category) {
        localStorage.setItem('autosave_newCourse', JSON.stringify(newCourse));
        setLastSaved(new Date());
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [newCourse]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await apiFetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
      setCourses(courses.filter(c => c.id !== id));
      showNotification('Course deleted successfully.', 'success');
    } catch (e) {
      console.error(e);
      showNotification('Failed to delete course.', 'error');
    }
  };

  const handleSaveCourse = async () => {
    if (!newCourse.title || !newCourse.category) {
      showNotification('Please fill in required fields.', 'error');
      return;
    }
    setIsSaving(true);
    // simulate network delay
    setTimeout(() => {
      setIsSaving(false);
      setIsAddingCourse(false);
      showNotification('Course created successfully!', 'success');
      setNewCourse({ title: '', category: '', level: 'Beginner', duration: '' });
      localStorage.removeItem('autosave_newCourse');
      setLastSaved(null);
    }, 1500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 relative">
      <div className="border-b-8 border-black pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-black uppercase">
            Manage <span className="bg-[#00FF88] px-4 py-1 border-4 border-black inline-block rotate-[2deg]">Courses</span>
          </h1>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddingCourse(true)}
          className="flex items-center gap-3 font-black text-black text-xl bg-neo-accent border-4 border-black px-6 py-4 hover:bg-neo-secondary transition-all neo-shadow-sm uppercase"
        >
          <Plus className="w-8 h-8" strokeWidth={3} /> Add Course
        </motion.button>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="bg-white border-4 border-black overflow-hidden neo-shadow-lg mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white uppercase text-sm tracking-widest font-black">
                <th className="p-4 border-b-4 border-black border-r-4">Course</th>
                <th className="p-4 border-b-4 border-black border-r-4">Category</th>
                <th className="p-4 border-b-4 border-black border-r-4">Average Completion</th>
                <th className="p-4 border-b-4 border-black border-r-4">Status</th>
                <th className="p-4 border-b-4 border-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => {
                const progress = course.progress || Math.floor(Math.random() * 60) + 20; // Mock progress if missing
                return (
                  <motion.tr variants={itemVariants} key={course.id} className="border-b-4 border-black hover:bg-neo-secondary transition-colors font-bold group">
                    <td className="p-4 flex items-center gap-4 border-r-4 border-black">
                      <img src={course.thumbnail} alt="thumbnail" className="w-20 h-14 border-2 border-black object-cover bg-neo-accent" />
                      <div>
                        <div className="font-black text-lg max-w-[200px] truncate" title={course.title}>{course.title}</div>
                        <div className="text-sm opacity-60 uppercase tracking-widest mt-1">{course.level} • {course.duration}</div>
                      </div>
                    </td>
                    <td className="p-4 border-r-4 border-black">{course.category || 'Technology'}</td>
                    <td className="p-4 border-r-4 border-black">
                      <div className="flex flex-col gap-2 w-48">
                         <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                           <span>Progress</span>
                           <span>{progress}%</span>
                         </div>
                         <div className="h-4 w-full bg-white border-2 border-black relative overflow-hidden">
                           <div className="h-full bg-neo-accent border-r-2 border-black" style={{ width: `${progress}%` }}></div>
                         </div>
                      </div>
                    </td>
                    <td className="p-4 border-r-4 border-black">
                      {progress === 100 ? (
                        <span className="bg-[#00FF88] px-3 py-1 border-2 border-black rotate-[-2deg] inline-block font-black uppercase text-xs neo-shadow-sm">Completed</span>
                      ) : progress > 0 ? (
                        <span className="bg-neo-accent px-3 py-1 border-2 border-black rotate-[2deg] inline-block font-black uppercase text-xs neo-shadow-sm">In Progress</span>
                      ) : (
                        <span className="bg-gray-200 px-3 py-1 border-2 border-black inline-block font-black uppercase text-xs neo-shadow-sm">Unstarted</span>
                      )}
                    </td>
                    <td className="p-4 bg-white group-hover:bg-neo-secondary transition-colors">
                      <div className="flex justify-end gap-3 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-white border-2 border-black hover:bg-neo-accent transition-colors hover:rotate-6">
                          <Edit2 className="w-5 h-5 text-black" strokeWidth={2.5} />
                        </button>
                        <button onClick={() => handleDelete(course.id)} className="p-2 bg-white border-2 border-black hover:bg-[#FF3366] transition-colors hover:-rotate-6">
                          <Trash2 className="w-5 h-5 text-black" strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center font-black uppercase text-lg tracking-widest border-b-4 border-black">
                    No Courses Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Floating Modal for Adding Courses */}
      <AnimatePresence>
        {isAddingCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="bg-white border-8 border-black max-w-2xl w-full neo-shadow-xl relative overflow-hidden"
            >
              <button 
                onClick={() => setIsAddingCourse(false)}
                className="absolute top-4 right-4 p-2 bg-white border-4 border-black hover:bg-[#FF3366] hover:text-white transition-colors z-10 hover:rotate-90"
              >
                <X className="w-6 h-6" strokeWidth={3} />
              </button>

              <div className="p-8 border-b-8 border-black bg-neo-secondary rotate-[1deg] scale-105 flex justify-between items-center">
                <h2 className="text-4xl font-black text-black uppercase tracking-tighter">Create Entity</h2>
                {lastSaved && (
                  <span className="text-xs font-black tracking-widest uppercase bg-white border-2 border-black px-2 py-1 rotate-[-2deg] neo-shadow-sm">
                    Draft Saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-black uppercase tracking-widest mb-2">Course Title</label>
                  <input 
                    type="text" 
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    className="w-full bg-white border-4 border-black p-4 text-lg font-bold focus:outline-none focus:bg-neo-muted transition-colors disabled:opacity-50"
                    placeholder="E.g. Advanced AI Integration"
                    disabled={isSaving}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black uppercase tracking-widest mb-2">Category</label>
                    <input 
                      type="text" 
                      value={newCourse.category}
                      onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                      className="w-full bg-white border-4 border-black p-4 text-lg font-bold focus:outline-none focus:bg-neo-muted transition-colors disabled:opacity-50"
                      placeholder="E.g. Technology"
                      disabled={isSaving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black uppercase tracking-widest mb-2">Level</label>
                    <select 
                      value={newCourse.level}
                      onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                      className="w-full bg-white border-4 border-black p-4 text-lg font-bold focus:outline-none focus:bg-neo-muted transition-colors disabled:opacity-50 appearance-none"
                      disabled={isSaving}
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                </div>

                <motion.button 
                  whileHover={!isSaving ? { scale: 1.02 } : {}}
                  whileTap={!isSaving ? { scale: 0.98 } : {}}
                  onClick={handleSaveCourse}
                  disabled={isSaving}
                  className="w-full bg-neo-accent border-4 border-black p-5 flex items-center justify-center gap-3 text-2xl font-black uppercase tracking-widest transition-colors hover:bg-[#00FF88] mt-8 disabled:bg-gray-300 group"
                >
                  {isSaving ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                      <Loader2 className="w-8 h-8" strokeWidth={3} />
                    </motion.div>
                  ) : (
                    <Save className="w-8 h-8 group-hover:scale-110 transition-transform" strokeWidth={3} />
                  )}
                  {isSaving ? 'Initializing Subroutine...' : 'Commit to Database'}
                </motion.button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
