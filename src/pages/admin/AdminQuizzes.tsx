import { Plus, Edit2, Trash2, HelpCircle, X, Loader2, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';

export function AdminQuizzes() {
  const [isAddingQuiz, setIsAddingQuiz] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showNotification } = useNotification();
  const [newQuiz, setNewQuiz] = useState({ title: '', course: '', questions: 10 });
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const draft = localStorage.getItem('autosave_newQuiz');
    if (draft) {
      try {
        setNewQuiz(JSON.parse(draft));
      } catch(e) {}
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (newQuiz.title || newQuiz.course) {
        localStorage.setItem('autosave_newQuiz', JSON.stringify(newQuiz));
        setLastSaved(new Date());
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [newQuiz]);

  const handleSaveQuiz = () => {
    if (!newQuiz.title || !newQuiz.course) {
      showNotification('Please fill in required fields.', 'error');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsAddingQuiz(false);
      showNotification('Quiz created successfully!', 'success');
      setNewQuiz({ title: '', course: '', questions: 10 });
      localStorage.removeItem('autosave_newQuiz');
      setLastSaved(null);
    }, 1500);
  };

  const quizzes = [
    { id: 1, title: 'React Performance Best Practices', course: 'React & Node.js Masterclass', questions: 10, attempts: 245 },
    { id: 2, title: 'System Design Patterns', course: 'Advanced Full-Stack System Design', questions: 15, attempts: 89 },
    { id: 3, title: 'Introduction to Generative AI', course: 'AI Integrations for SaaS', questions: 5, attempts: 12 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="border-b-8 border-black pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-black uppercase">
            Manage <span className="bg-[#FF3366] text-white px-4 py-1 border-4 border-black inline-block rotate-[1deg]">Quizzes</span>
          </h1>
        </div>
        <button 
          onClick={() => setIsAddingQuiz(true)}
          className="flex items-center gap-3 font-black text-white text-xl bg-black border-4 border-black px-6 py-4 hover:bg-[#FF3366] hover:-translate-y-1 transition-all neo-shadow-sm active:translate-y-0 active:shadow-none uppercase"
        >
          <Plus className="w-8 h-8" strokeWidth={3} /> Create Quiz
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white border-4 border-black p-8 neo-shadow-lg relative group overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-neo-accent border-4 border-black rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="bg-white border-4 border-black p-3 rotate-[-5deg] group-hover:rotate-0 transition-transform">
                  <HelpCircle className="w-8 h-8 text-black" strokeWidth={3} />
                </div>
                <div className="flex gap-2">
                  <button className="p-2 border-2 border-black hover:bg-neo-secondary bg-white"><Edit2 className="w-5 h-5" strokeWidth={2.5}/></button>
                  <button className="p-2 border-2 border-black hover:bg-[#FF3366] bg-white"><Trash2 className="w-5 h-5" strokeWidth={2.5}/></button>
                </div>
              </div>
              
              <h3 className="font-black text-3xl uppercase tracking-tighter mb-2">{quiz.title}</h3>
              <p className="font-bold text-black border-l-4 border-black pl-3 mb-6">{quiz.course}</p>
              
              <div className="flex gap-4">
                <div className="bg-neo-muted px-4 py-2 border-2 border-black uppercase font-black tracking-widest text-sm text-black">
                  {quiz.questions} Qs
                </div>
                <div className="bg-neo-secondary px-4 py-2 border-2 border-black uppercase font-black tracking-widest text-sm text-center text-black">
                  {quiz.attempts} Attempts
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Modal for Adding Quizzes */}
      <AnimatePresence>
        {isAddingQuiz && (
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
              className="bg-[var(--color-card)] border-8 border-black max-w-2xl w-full neo-shadow-xl relative overflow-hidden"
            >
              <button 
                onClick={() => setIsAddingQuiz(false)}
                className="absolute top-4 right-4 p-2 bg-[var(--color-card)] text-[var(--color-foreground)] border-4 border-black hover:bg-[#FF3366] hover:text-white transition-colors z-10 hover:rotate-90"
              >
                <X className="w-6 h-6" strokeWidth={3} />
              </button>

              <div className="p-8 border-b-8 border-black bg-neo-secondary rotate-[1deg] scale-105 flex justify-between items-center">
                <h2 className="text-4xl font-black text-black uppercase tracking-tighter">Create Quiz</h2>
                {lastSaved && (
                  <span className="text-xs text-black font-black tracking-widest uppercase bg-white border-2 border-black px-2 py-1 rotate-[-2deg] neo-shadow-sm">
                    Draft Saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-black uppercase tracking-widest mb-2">Quiz Title</label>
                  <input 
                    type="text" 
                    value={newQuiz.title}
                    onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                    className="w-full bg-[var(--color-background)] border-4 border-black p-4 text-lg font-bold focus:outline-none focus:bg-neo-secondary focus:text-black transition-colors disabled:opacity-50"
                    placeholder="E.g. React Basics"
                    disabled={isSaving}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black uppercase tracking-widest mb-2">Associated Course</label>
                    <input 
                      type="text" 
                      value={newQuiz.course}
                      onChange={(e) => setNewQuiz({ ...newQuiz, course: e.target.value })}
                      className="w-full bg-[var(--color-background)] border-4 border-black p-4 text-lg font-bold focus:outline-none focus:bg-neo-secondary focus:text-black transition-colors disabled:opacity-50"
                      placeholder="E.g. Web Development 101"
                      disabled={isSaving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black uppercase tracking-widest mb-2">Total Questions</label>
                    <input 
                      type="number"
                      value={newQuiz.questions}
                      onChange={(e) => setNewQuiz({ ...newQuiz, questions: Number(e.target.value) })}
                      min="1"
                      className="w-full bg-[var(--color-background)] border-4 border-black p-4 text-lg font-bold focus:outline-none focus:bg-neo-secondary focus:text-black transition-colors disabled:opacity-50"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <motion.button 
                  whileHover={!isSaving ? { scale: 1.02 } : {}}
                  whileTap={!isSaving ? { scale: 0.98 } : {}}
                  onClick={handleSaveQuiz}
                  disabled={isSaving}
                  className="w-full bg-neo-accent border-4 border-black p-5 flex items-center justify-center gap-3 text-2xl font-black uppercase tracking-widest transition-colors hover:bg-[#00FF88] mt-8 disabled:bg-gray-300 group text-black"
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
