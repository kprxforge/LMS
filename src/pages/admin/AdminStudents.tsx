import { apiFetch } from '../../lib/api'; import { useState, useEffect } from 'react';
import { Search, Filter, Trash2, Edit, ChevronRight, X, ChevronLeft, Target, BookOpen, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';

export function AdminStudents() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    apiFetch('/api/admin/users').then(r => r.json()).then(setUsers);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      setUsers(users.filter(u => u.id !== id));
      showNotification('Student DELETED', 'success');
      if (selectedStudent?.id === id) setSelectedStudent(null);
    } catch (e) {
      console.error(e);
      showNotification('Failed to Delete', 'error');
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
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', bounce: 0.4 } }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 relative overflow-hidden">
      <div className="border-b-8 border-black pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-black uppercase">
            Manage <span className="bg-neo-accent px-4 py-1 border-4 border-black inline-block rotate-[-2deg]">Students</span>
          </h1>
        </div>
        <div className="flex gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="font-black text-black text-lg bg-white border-4 border-black px-6 py-4 hover:bg-neo-secondary transition-all neo-shadow-sm uppercase"
          >
            Export CSV
          </motion.button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-black group-focus-within:text-neo-accent transition-colors" strokeWidth={3} />
          <input 
            type="text" 
            placeholder="Search students..." 
            className="w-full pl-14 pr-4 py-4 bg-white border-4 border-black text-lg font-black text-black placeholder:text-black/40 focus:outline-none focus:bg-neo-secondary focus:neo-shadow-sm transition-all"
          />
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 bg-white border-4 border-black px-6 py-4 font-black uppercase text-lg hover:bg-neo-accent transition-all neo-shadow-sm shrink-0"
        >
          <Filter className="w-6 h-6" strokeWidth={3} /> Filter
        </motion.button>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="bg-white border-4 border-black overflow-hidden neo-shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white uppercase text-sm tracking-widest font-black">
                <th className="p-4 border-b-4 border-black border-r-4">Name</th>
                <th className="p-4 border-b-4 border-black border-r-4">Email</th>
                <th className="p-4 border-b-4 border-black border-r-4">XP</th>
                <th className="p-4 border-b-4 border-black border-r-4">Streak</th>
                <th className="p-4 border-b-4 border-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => u.role === 'student').map((student, i) => (
                <motion.tr 
                  variants={itemVariants}
                  key={student.id} 
                  onClick={() => setSelectedStudent(student)}
                  className="border-b-4 border-black hover:bg-neo-secondary transition-colors font-bold group cursor-pointer"
                >
                  <td className="p-4 flex items-center gap-4 border-r-4 border-black">
                    <img src={student.avatar} alt="avatar" className="w-12 h-12 border-2 border-black object-cover bg-neo-accent" />
                    <span className="group-hover:underline decoration-2 underline-offset-4">{student.name}</span>
                  </td>
                  <td className="p-4 border-r-4 border-black">{student.email}</td>
                  <td className="p-4 font-black text-xl border-r-4 border-black">{student.xp}</td>
                  <td className="p-4 border-r-4 border-black">{student.streak} days</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-3 opacity-50 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); }}
                        className="p-2 bg-white border-2 border-black hover:bg-neo-accent transition-colors hover:rotate-6"
                      >
                        <ChevronRight className="w-5 h-5 text-black" strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(student.id); }}
                        className="p-2 bg-white border-2 border-black hover:bg-[#FF3366] transition-colors hover:-rotate-6"
                      >
                        <Trash2 className="w-5 h-5 text-black" strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Slide-in Profile Panel */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm flex justify-end"
            onClick={() => setSelectedStudent(null)}
          >
            <motion.div 
              initial={{ x: '100%', skewX: 5 }}
              animate={{ x: 0, skewX: 0 }}
              exit={{ x: '100%', skewX: -5 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white border-l-8 border-black h-full flex flex-col p-6 overflow-y-auto neo-shadow-l relative"
            >
               <button 
                 onClick={() => setSelectedStudent(null)}
                 className="absolute top-6 right-6 p-2 bg-neo-accent border-4 border-black hover:bg-neo-secondary transition-colors hover:rotate-90 neo-shadow-sm z-10"
               >
                 <X className="w-6 h-6 text-black" strokeWidth={3} />
               </button>
               
               <div className="flex items-center gap-6 mb-8 mt-4 border-b-4 border-black pb-6">
                 <img src={selectedStudent.avatar} alt="avatar" className="w-24 h-24 border-4 border-black object-cover bg-neo-accent rotate-[2deg] neo-shadow-sm" />
                 <div>
                   <h2 className="text-3xl font-black text-black uppercase tracking-tighter line-clamp-2">{selectedStudent.name}</h2>
                   <p className="font-bold text-black opacity-60 mt-1">{selectedStudent.email}</p>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="bg-neo-secondary p-4 border-4 border-black neo-shadow-sm flex flex-col gap-2 rotate-[-1deg]">
                   <Target className="w-6 h-6 text-black" strokeWidth={3}/>
                   <span className="text-xs font-black uppercase tracking-widest">Total XP</span>
                   <span className="text-3xl font-black">{selectedStudent.xp}</span>
                 </div>
                 <div className="bg-neo-accent p-4 border-4 border-black neo-shadow-sm flex flex-col gap-2 rotate-[1deg]">
                   <Clock className="w-6 h-6 text-black" strokeWidth={3}/>
                   <span className="text-xs font-black uppercase tracking-widest">Streak</span>
                   <span className="text-3xl font-black">{selectedStudent.streak}</span>
                 </div>
               </div>

               <h3 className="text-xl font-black uppercase tracking-widest border-b-4 border-black pb-2 mb-4">Enrolled Courses</h3>
               
               {/* Mock dynamic courses for profile */}
               <div className="space-y-4">
                 {[1, 2, 3].map((_, idx) => (
                   <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.2 + (idx * 0.1) }}
                     key={idx} 
                     className="p-4 border-4 border-black hover:bg-neo-muted transition-colors neo-shadow-sm cursor-pointer"
                   >
                     <div className="flex gap-4 items-center mb-3">
                       <BookOpen className="w-6 h-6 text-black shrink-0" strokeWidth={2}/>
                       <div className="font-black text-black uppercase text-sm truncate">Advanced System Architecture</div>
                     </div>
                     <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-1">
                       <span>Progress</span>
                       <span className="text-neo-accent text-sm">{40 + (idx * 15)}%</span>
                     </div>
                     <div className="h-3 w-full bg-white border-2 border-black relative overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${40 + (idx * 15)}%` }}
                         transition={{ duration: 1, delay: 0.5 }}
                         className="h-full bg-neo-accent border-r-2 border-black" 
                       />
                     </div>
                   </motion.div>
                 ))}
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
