import { apiFetch } from '../../lib/api'; import { useState, useEffect, FormEvent } from 'react';
import { Course } from '../../types';
import { Search, Filter, Clock, Star, PlayCircle, BookOpen, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'motion/react';

export function CourseCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrollStep, setEnrollStep] = useState(1);
  const [enrollForm, setEnrollForm] = useState({ 
    name: '', email: '', whatsapp: '', college: '', 
    qualification: '', city: '', reason: '', 
    batch: 'Morning', learningMode: 'Online' 
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch('/api/courses')
      .then(r => r.json())
      .then(data => {
        setCourses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCourseClick = (course: Course) => {
    if (course.progress !== undefined) {
      navigate(`/student/courses/${course.id}`);
    } else if ((course as any).applicationStatus === 'pending') {
      // Do nothing
      return;
    } else {
      setSelectedCourse(course);
      setEnrollModalOpen(true);
      setEnrollStep(1);
    }
  };

  const submitEnrollment = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    
    setEnrollStep(2); // Loading State
    
    try {
      await apiFetch(`/api/course-applications`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          ...enrollForm
        })
      });
      
      setTimeout(() => {
        setEnrollStep(3); // Success State
        showNotification('Your application has been submitted successfully.', 'success');
        
        setTimeout(() => {
          setEnrollModalOpen(false);
          // Don't navigate to the course because it's pending approval
        }, 2000);
      }, 1500);
      
    } catch {
      showNotification('Application failed', 'error');
      setEnrollModalOpen(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b-8 border-black pb-8 relative rotate-[-1deg] mt-4"
      >
         <div className="space-y-4">
           <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-black uppercase" style={{ WebkitTextStroke: '2px black', color: 'transparent' }}>
             <span className="bg-neo-secondary px-2 text-black" style={{ WebkitTextStroke: '0' }}>Course</span> Archive
           </h1>
           <p className="font-bold text-lg uppercase tracking-widest bg-white border-4 border-black inline-block px-4 py-2 neo-shadow-sm">Find new skills to acquire.</p>
         </div>

         <div className="flex gap-4 w-full sm:w-auto">
           <div className="relative flex-1 sm:w-64">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-white border-4 border-black py-3 pl-12 pr-4 text-base font-bold tracking-widest uppercase text-black focus:outline-none focus:bg-neo-accent focus:neo-shadow-sm transition-all"
              />
              <Search className="w-6 h-6 text-black absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={3} />
           </div>
           <motion.button 
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="flex items-center gap-2 px-6 py-3 bg-white border-4 border-black text-sm tracking-widest font-black text-black hover:bg-neo-muted neo-shadow-sm transition-all uppercase"
           >
             <Filter className="w-5 h-5" strokeWidth={3} />
             Filter
           </motion.button>
         </div>
      </motion.div>

      {/* Grid of Courses */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <CourseCardSkeleton key={idx} />
          ))
        ) : (
          <AnimatePresence>
            {courses.map(course => (
              <motion.div key={course.id} variants={itemVariants} layoutId={`course-${course.id}`}>
                <CourseCard course={course} onClick={() => handleCourseClick(course)} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Enrollment Modal */}
      <AnimatePresence>
        {enrollModalOpen && selectedCourse && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white border-8 border-black p-8 max-w-md w-full neo-shadow-xl relative rotate-[1deg]"
            >
              <button 
                onClick={() => setEnrollModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-neo-muted border-4 border-black hover:bg-[#FF3366] transition-colors group"
                disabled={enrollStep === 2 || enrollStep === 3}
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform" strokeWidth={3} />
              </button>

              <div className="rotate-[-1deg]">
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-6 bg-neo-secondary inline-block px-4 py-1 border-4 border-black">
                  Course Application
                </h2>

                {enrollStep === 1 && (
                  <form onSubmit={submitEnrollment} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 scrollbar-hide">
                    <div className="bg-neo-muted border-4 border-black p-4 space-y-2">
                      <div className="text-sm font-black uppercase tracking-widest opacity-70">Selected Course</div>
                      <div className="font-black text-xl truncate">{selectedCourse.title}</div>
                      <div className="text-sm font-bold opacity-80">Instructor: {selectedCourse.instructorName}</div>
                      <div className="flex gap-4 text-xs font-bold mt-2">
                        <span>Duration: {selectedCourse.duration}</span>
                        <span>Level: {selectedCourse.level}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-black uppercase tracking-widest mb-1">Full Name</label>
                        <input required value={enrollForm.name} onChange={e => setEnrollForm({...enrollForm, name: e.target.value})} className="w-full p-3 bg-white border-4 border-black font-bold focus:outline-none focus:bg-neo-accent transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-black uppercase tracking-widest mb-1">Email</label>
                        <input type="email" required value={enrollForm.email} onChange={e => setEnrollForm({...enrollForm, email: e.target.value})} className="w-full p-3 bg-white border-4 border-black font-bold focus:outline-none focus:bg-neo-accent transition-colors" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-black uppercase tracking-widest mb-1">WhatsApp Number</label>
                        <input required value={enrollForm.whatsapp} onChange={e => setEnrollForm({...enrollForm, whatsapp: e.target.value})} className="w-full p-3 bg-white border-4 border-black font-bold focus:outline-none focus:bg-neo-accent transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-black uppercase tracking-widest mb-1">City</label>
                        <input required value={enrollForm.city} onChange={e => setEnrollForm({...enrollForm, city: e.target.value})} className="w-full p-3 bg-white border-4 border-black font-bold focus:outline-none focus:bg-neo-accent transition-colors" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-black uppercase tracking-widest mb-1">College/Company</label>
                        <input required value={enrollForm.college} onChange={e => setEnrollForm({...enrollForm, college: e.target.value})} className="w-full p-3 bg-white border-4 border-black font-bold focus:outline-none focus:bg-neo-accent transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-black uppercase tracking-widest mb-1">Qualification</label>
                        <input required value={enrollForm.qualification} onChange={e => setEnrollForm({...enrollForm, qualification: e.target.value})} className="w-full p-3 bg-white border-4 border-black font-bold focus:outline-none focus:bg-neo-accent transition-colors" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-black uppercase tracking-widest mb-1">Preferred Batch</label>
                        <select required value={enrollForm.batch} onChange={e => setEnrollForm({...enrollForm, batch: e.target.value})} className="w-full p-3 bg-white border-4 border-black font-bold focus:outline-none focus:bg-neo-accent transition-colors">
                          <option value="Morning">Morning</option>
                          <option value="Afternoon">Afternoon</option>
                          <option value="Evening">Evening</option>
                          <option value="Weekend">Weekend</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-black uppercase tracking-widest mb-1">Learning Mode</label>
                        <select required value={enrollForm.learningMode} onChange={e => setEnrollForm({...enrollForm, learningMode: e.target.value})} className="w-full p-3 bg-white border-4 border-black font-bold focus:outline-none focus:bg-neo-accent transition-colors">
                          <option value="Online">Online</option>
                          <option value="Offline">Offline</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-black uppercase tracking-widest mb-1">Why do you want to join this course?</label>
                      <textarea required value={enrollForm.reason} onChange={e => setEnrollForm({...enrollForm, reason: e.target.value})} rows={2} className="w-full p-3 bg-white border-4 border-black font-bold focus:outline-none focus:bg-neo-accent transition-colors" />
                    </div>
                    
                    <motion.button 
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full mt-4 bg-[#00FF88] text-black border-4 border-black py-4 font-black uppercase text-xl neo-shadow-sm hover:bg-neo-secondary transition-colors"
                    >
                      Submit Application
                    </motion.button>
                  </form>
                )}

                {enrollStep === 2 && (
                  <div className="py-12 flex flex-col items-center justify-center space-y-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    >
                      <Loader2 className="w-16 h-16 text-black" strokeWidth={3} />
                    </motion.div>
                    <p className="font-black text-xl uppercase tracking-widest animate-pulse">Processing...</p>
                  </div>
                )}

                {enrollStep === 3 && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-12 flex flex-col items-center justify-center space-y-6"
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.6 }}
                      className="w-24 h-24 bg-neo-accent border-8 border-black rounded-full flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-12 h-12 text-black" strokeWidth={4} />
                    </motion.div>
                    <p className="font-black text-2xl uppercase tracking-tighter text-center">Enrollment Successful!</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function CourseCard({ course, onClick }: { course: Course, onClick: () => void, key?: string | number }) {
  return (
    <motion.div 
      whileHover={{ y: -10, boxShadow: '8px 8px 0 0 rgba(0,0,0,1)', borderColor: '#FF3366' }}
      whileTap={{ scale: 0.98, y: 0, boxShadow: '0px 0px 0 0 rgba(0,0,0,1)' }}
      onClick={onClick}
      className="bg-white group border-4 border-black overflow-hidden bg-neo-secondary cursor-pointer flex flex-col h-full neo-shadow-lg transition-colors duration-300"
    >
      <div className="relative aspect-video overflow-hidden border-b-4 border-black bg-black">
        <img 
          src={course.thumbnail} 
          alt={course.title} 
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
            <PlayCircle className="w-16 h-16 text-neo-secondary fill-black" strokeWidth={2} />
        </div>
        <span className="absolute top-4 left-4 bg-white border-4 border-black px-3 py-1 text-xs font-black text-black tracking-widest uppercase neo-shadow-sm rotate-[-3deg]">
          {course.category}
        </span>
      </div>
      
      <div className="p-6 flex-1 flex flex-col relative bg-white transition-colors group-hover:bg-neo-muted">
        <div className="flex items-center gap-4 text-xs text-black font-bold mb-4 tracking-widest uppercase opacity-80">
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4"/>{course.duration}</span>
          <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" />{course.level}</span>
        </div>
        
        <h3 className="font-black text-2xl text-black mb-4 group-hover:underline decoration-4 underline-offset-4 line-clamp-2 uppercase">
          {course.title}
        </h3>
        
        <div className="mt-auto pt-6 flex items-center justify-between border-t-4 border-black border-dashed mb-4">
           <div className="flex items-center gap-3 text-black">
             <motion.div 
               whileHover={{ rotate: 360 }}
               transition={{ duration: 0.5 }}
               className="w-10 h-10 border-4 border-black bg-neo-secondary flex items-center justify-center text-black text-lg font-black rotate-3"
             >
               {course.instructorName.charAt(0)}
             </motion.div>
             <span className="text-sm font-black uppercase tracking-widest">{course.instructorName}</span>
           </div>
           
           {course.progress !== undefined && course.progress > 0 && (
             <span className="text-xs font-black text-black bg-neo-accent px-3 py-1.5 border-2 border-black uppercase tracking-widest neo-shadow-sm rotate-[3deg]">
               {course.progress}%
             </span>
           )}
        </div>
        
        {course.progress !== undefined ? (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="w-full mt-2 py-3 bg-neo-accent text-black border-4 border-black font-black uppercase tracking-widest neo-shadow-sm hover:bg-neo-secondary transition-colors rotate-[1deg]"
          >
            Continue Learning
          </button>
        ) : (course as any).applicationStatus === 'pending' ? (
          <button 
            disabled
            onClick={(e) => e.stopPropagation()}
            className="w-full mt-2 py-3 bg-yellow-400 text-black border-4 border-black font-black uppercase tracking-widest neo-shadow-sm rotate-[1deg] opacity-80 cursor-not-allowed"
          >
            Application Pending
          </button>
        ) : (course as any).applicationStatus === 'rejected' ? (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="w-full mt-2 py-3 bg-red-400 text-black border-4 border-black font-black uppercase tracking-widest neo-shadow-sm hover:bg-red-500 transition-colors rotate-[1deg]"
          >
            Apply Again
          </button>
        ) : (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="w-full mt-2 py-3 bg-[#FF3366] text-white border-4 border-black font-black uppercase tracking-widest neo-shadow-sm hover:bg-black hover:text-white transition-colors rotate-[-1deg]"
          >
            Apply Now
          </button>
        )}
      </div>
    </motion.div>
  )
}

function CourseCardSkeleton() {
  return (
    <div className="bg-white border-4 border-black overflow-hidden flex flex-col h-full neo-shadow-lg animate-pulse bg-neo-secondary/20">
      <div className="relative aspect-video overflow-hidden border-b-4 border-black bg-gray-200 flex items-center justify-center">
        <div className="w-16 h-16 bg-gray-300 rounded-full" />
        <span className="absolute top-4 left-4 bg-gray-300 border-4 border-black px-8 py-2 w-24 h-6 rotate-[-3deg]" />
      </div>
      
      <div className="p-6 flex-1 flex flex-col relative bg-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-4 bg-gray-200" />
          <div className="w-16 h-4 bg-gray-200" />
        </div>
        
        <div className="w-3/4 h-6 bg-gray-300 mb-2" />
        <div className="w-1/2 h-6 bg-gray-300 mb-4" />
        
        <div className="mt-auto pt-6 flex items-center justify-between border-t-4 border-black border-dashed mb-4">
          <div className="flex items-center gap-3 w-1/2">
            <div className="w-10 h-10 border-4 border-black bg-gray-200 rounded-none rotate-3 shrink-0" />
            <div className="w-20 h-4 bg-gray-200" />
          </div>
        </div>
        
        <div className="w-full h-12 bg-gray-200 border-4 border-black rotate-[1deg]" />
      </div>
    </div>
  );
}
