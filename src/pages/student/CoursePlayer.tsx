import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle, CheckCircle, FileText, HelpCircle, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Course } from '../../types';
import { QuizComponent } from '../../components/quiz/QuizComponent';
import { useNotification } from '../../context/NotificationContext';
import { apiFetch } from '../../lib/api';

const MOCK_QUIZ_DATA = {
  title: "Architecture Patterns Quiz",
  questions: [
    {
      id: "q1",
      text: "Which of the following best describes the Microservices architecture pattern?",
      options: [
        { id: "o1", text: "A single, unified backend application with shared database." },
        { id: "o2", text: "Small, autonomous services that work together." },
        { id: "o3", text: "A strict hierarchical structure of services." },
        { id: "o4", text: "Tight coupling between different domains." }
      ],
      correctOptionId: "o2"
    },
    {
      id: "q2",
      text: "What is a major disadvantage of a monolithic architecture?",
      options: [
        { id: "o1", text: "Scaling specific parts of the application is difficult." },
        { id: "o2", text: "Initial development is too slow." },
        { id: "o3", text: "Debugging is harder than in microservices." },
        { id: "o4", text: "Lack of transaction support." }
      ],
      correctOptionId: "o1"
    }
  ]
};

export function CoursePlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeLessonId, setActiveLessonId] = useState('l1');
  const { showNotification } = useNotification();
  
  const [summary, setSummary] = useState<string[] | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  
  // Mock course curriculum
  const curriculum = [
    {
      id: 'm1',
      title: 'Module 1: Architecture Fundamentals',
      lessons: [
        { id: 'l1', title: 'Introduction to Distributed Systems', type: 'video', duration: '15:20', completed: true },
        { id: 'l2', title: 'Microservices vs Monoliths', type: 'video', duration: '22:15', completed: true },
        { id: 'l3', title: 'Architecture Patterns Quiz', type: 'quiz', duration: '10 Mins', completed: false },
      ]
    },
    {
      id: 'm2',
      title: 'Module 2: Database Design & Scaling',
      lessons: [
        { id: 'l4', title: 'Relational vs NoSQL', type: 'video', duration: '18:40', completed: false },
        { id: 'l5', title: 'Sharding & Replication Strategies', type: 'video', duration: '32:10', completed: false },
        { id: 'l6', title: 'Caching with Redis', type: 'reading', duration: '5 Mins', completed: false },
      ]
    }
  ];

  useEffect(() => {
    // Faking complete course data, but actually fetching it
    apiFetch('/api/courses')
      .then(r => r.json())
      .then((data: Course[]) => setCourse(data.find(c => c.id === id) || null));
  }, [id]);

  useEffect(() => {
    // Reset summary when lesson changes
    setSummary(null);
  }, [activeLessonId]);

  const activeLesson = curriculum.flatMap(m => m.lessons).find(l => l.id === activeLessonId);

  const handleLessonComplete = async () => {
    if (!course) return;
    try {
      // Calculate overall progress
      const currentIdx = curriculum.flatMap(m => m.lessons).findIndex(l => l.id === activeLessonId);
      const totalLessons = curriculum.flatMap(m => m.lessons).length;
      const progress = Math.round(((currentIdx + 1) / totalLessons) * 100);
      
      await apiFetch(`/api/courses/${course.id}/progress`, {
        method: 'POST',
        body: { progress }
      });
      showNotification(`Progress Saved! You've completed ${progress}%`, 'success');
      
      // Update local state temporarily
      setCourse({ ...course, progress });
    } catch (err) {
      showNotification('Failed to update progress', 'error');
    }
  };

  const handleSummarize = async () => {
    if (!course || !activeLesson) return;
    
    setIsSummarizing(true);
    setSummary(null);
    try {
      const res = await apiFetch('/api/gemini/summarize', {
        method: 'POST',
        body: { 
          lessonTitle: activeLesson.title, 
          courseTitle: course.title 
        },
      });
      if (!res.ok) throw new Error('Failed to summarize');
      const data = await res.json();
      setSummary(data.summary);
      showNotification('AI Summary Generated Successfully', 'success');
    } catch (err) {
      showNotification('AI Summarization Failed', 'error');
    } finally {
      setIsSummarizing(false);
    }
  };

  if (!course) return <div className="p-8 text-center font-black text-2xl uppercase tracking-widest animate-pulse">Loading Course...</div>;

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500 pb-12">
       
       {/* Left side: Video Player & Content */}
       <div className="flex-1 flex flex-col space-y-8">
         {/* Top Navigation */}
         <button 
           onClick={() => navigate('/student/courses')}
           className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-widest text-black hover:bg-neo-accent px-4 py-2 border-4 border-transparent hover:border-black transition-all hover:-translate-x-2 w-max neo-shadow-sm active:translate-x-0 active:translate-y-1 active:shadow-none"
         >
           <ArrowLeft className="w-5 h-5" strokeWidth={3} />
           Back to Archive
         </button>

         {activeLesson?.type === 'quiz' ? (
           <QuizComponent 
             title={MOCK_QUIZ_DATA.title} 
             questions={MOCK_QUIZ_DATA.questions} 
             onComplete={(score, total) => {
               const passed = score / total >= 0.7;
               if (passed) {
                 showNotification(`Quiz Passed! [${score}/${total}]`, 'success');
                 handleLessonComplete();
               } else {
                 showNotification(`Quiz Failed [${score}/${total}]`, 'error');
               }
             }} 
           />
         ) : (
           <>
             {/* Video Player Placeholder */}
             <div className="w-full aspect-video bg-black border-4 border-black overflow-hidden relative neo-shadow-lg group shrink-0">
                <img src={course.thumbnail} className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" />

                <div className="absolute inset-0 flex flex-col justify-between p-6">
                    <div className="flex justify-between items-start">
                       <div className="bg-white border-2 border-black px-4 py-2 text-black font-black text-sm uppercase tracking-widest neo-shadow-sm rotate-[-2deg]">
                         {activeLesson?.title}
                       </div>
                       <div className="flex gap-2">
                         <button onClick={handleLessonComplete} className="text-xs font-black text-black bg-[#00FF88] border-2 border-black px-3 py-1 uppercase tracking-widest hover:bg-white transition-colors">
                           Mark Complete
                         </button>
                         <div className="text-xs font-black text-black bg-[#FF3366] border-2 border-black px-3 py-1 uppercase tracking-widest animate-pulse">REC</div>
                       </div>
                    </div>
                    <div className="flex items-center justify-center flex-1">
                       <button className="w-20 h-20 bg-white hover:bg-neo-accent border-4 border-black flex items-center justify-center transition-all hover:scale-110 active:scale-95 group/play neo-shadow-sm rotate-[10deg]">
                         <PlayCircle className="w-10 h-10 ml-1 text-black" strokeWidth={3} />
                       </button>
                    </div>
                    
                    {/* Fake timeline */}
                    <div className="flex items-center gap-4 bg-white/90 p-3 border-2 border-black">
                       <span className="text-black text-xs font-black">00:00:00</span>
                       <div className="flex-1 h-2 bg-gray-300 border border-black relative cursor-pointer">
                          <div className="absolute top-0 left-0 w-[10%] h-full bg-neo-accent border-r-2 border-black"></div>
                       </div>
                       <span className="text-black text-xs font-black">{activeLesson?.duration}</span>
                    </div>
                </div>
              </div>

             <div className="bg-white border-4 border-black p-6 md:p-8 space-y-6 relative group transition-all duration-300 neo-shadow-xl rotate-[1deg]">
               <div className="space-y-4">
                 <h1 className="text-3xl sm:text-5xl font-black text-black uppercase" style={{ WebkitTextStroke: '1px black', color: 'transparent' }}>
                    <span className="text-neo-secondary" style={{ WebkitTextStroke: '0' }}>{activeLesson?.title}</span>
                 </h1>
               </div>

               {/* AI Assistant Banner */}
               <div className="bg-neo-accent border-4 border-black p-6 flex flex-col gap-6 neo-shadow-sm rotate-[-1deg]">
                 <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                   <div className="bg-white border-4 border-black p-3 hover:rotate-[15deg] transition-transform">
                     <MessageSquare className="w-8 h-8 text-black" strokeWidth={3}/>
                   </div>
                   <div className="flex-1">
                     <h4 className="font-black text-black text-xl uppercase underline decoration-4 underline-offset-2 mb-2">AI Assistant</h4>
                     <p className="text-sm font-bold text-black uppercase opacity-80">Use AI to summarize this video or explain concepts.</p>
                   </div>
                   <button 
                     onClick={handleSummarize}
                     disabled={isSummarizing || !!summary}
                     className="whitespace-nowrap px-6 py-3 bg-white text-black border-4 border-black font-black hover:bg-neo-muted active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase text-sm neo-shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                   >
                     {isSummarizing ? (
                       <><Loader2 className="w-5 h-5 animate-spin" strokeWidth={3} /> Summarizing...</>
                     ) : summary ? (
                       <><CheckCircle className="w-5 h-5" strokeWidth={3} /> Summarized</>
                     ) : (
                       <><Sparkles className="w-5 h-5" strokeWidth={3} /> Ask AI</>
                     )}
                   </button>
                 </div>
                 
                 {summary && (
                   <div className="bg-white border-4 border-black p-6 mt-2 neo-shadow-sm animate-in zoom-in-95 duration-300">
                     <h5 className="font-black uppercase tracking-widest text-lg mb-4 underline decoration-2 underline-offset-4 flex items-center gap-2">
                       <Sparkles className="w-5 h-5 text-black" strokeWidth={3} />
                       Key Takeaways
                     </h5>
                     <ul className="space-y-3">
                       {summary.map((point, i) => (
                         <li key={i} className="flex gap-3 text-black font-bold">
                           <span className="shrink-0 w-6 h-6 bg-neo-secondary border-2 border-black flex items-center justify-center font-black text-xs rotate-[-2deg] mt-0.5">{i + 1}</span>
                           <span className="leading-snug">{point}</span>
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}
               </div>
             </div>
           </>
         )}
       </div>


       {/* Right side: Curriculum Sidebar */}
       <div className="w-full lg:w-96 flex flex-col bg-white border-4 border-black shrink-0 neo-shadow-xl h-max overflow-hidden uppercase mt-6 lg:mt-0">
         
         <div className="p-6 border-b-4 border-black bg-neo-secondary">
           <h3 className="font-black text-black text-2xl tracking-tighter mb-4">Curriculum</h3>
           <div className="flex items-center gap-3 text-xs font-bold text-black uppercase tracking-widest mb-3">
             <span className="bg-white border-2 border-black px-2 py-1">2/6 Completed</span>
             <span className="bg-neo-accent border-2 border-black px-2 py-1">33%</span>
           </div>
           <div className="h-4 w-full bg-white border-2 border-black overflow-hidden relative">
             <div className="h-full bg-neo-accent border-r-2 border-black w-1/3"></div>
           </div>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {curriculum.map((module, mIdx) => (
              <div key={module.id} className="space-y-3">
                 <div className="px-4 py-2 bg-black text-white font-black text-sm tracking-widest inline-block rotate-[-2deg]">
                   {module.title}
                 </div>
                 
                 <div className="space-y-2">
                   {module.lessons.map((lesson) => (
                     <div 
                       key={lesson.id} 
                       onClick={() => setActiveLessonId(lesson.id)}
                       className={`flex gap-4 items-start p-4 border-4 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                         lesson.id === activeLessonId 
                          ? 'bg-neo-muted border-black neo-shadow-sm scale-[1.02]' 
                          : 'bg-white border-transparent hover:border-black hover:bg-gray-50'
                       }`}
                     >
                        <div className="mt-1 shrink-0 bg-white border-2 border-black p-1 neo-shadow-sm flex items-center justify-center">
                          {lesson.completed ? (
                            <CheckCircle className="w-6 h-6 text-black" strokeWidth={3} />
                          ) : lesson.type === 'video' ? (
                            <PlayCircle className="w-6 h-6 text-black" strokeWidth={3} />
                          ) : lesson.type === 'quiz' ? (
                            <HelpCircle className="w-6 h-6 text-black" strokeWidth={3} />
                          ) : (
                            <FileText className="w-6 h-6 text-black" strokeWidth={3} />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-black uppercase tracking-wide leading-tight mb-2 ${
                            lesson.id === activeLessonId ? 'text-black underline decoration-2' : 'text-black'
                          }`}>
                            {lesson.title}
                          </p>
                          <p className="text-xs font-bold text-black opacity-60 px-2 py-1 bg-white border border-black inline-block">{lesson.duration}</p>
                        </div>
                     </div>
                   ))}
                 </div>
              </div>
            ))}
         </div>
       </div>

    </div>
  );
}
