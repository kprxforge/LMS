import { apiFetch } from '../../lib/api'; import { useState, useEffect, useRef } from 'react';
import { Award, Download, Calendar, BookOpen, Loader2 } from 'lucide-react';
import { Certificate } from '../../types';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { motion } from 'motion/react';

export function Certificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const certificateRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    apiFetch('/api/certificates').then(r => r.json()).then(setCertificates);
  }, []);

  const handleDownload = async (certificate: Certificate) => {
    const element = certificateRefs.current[certificate.id];
    if (!element) return;
    
    try {
      setDownloadingId(certificate.id);
      
      const imgData = await toPng(element, { 
        pixelRatio: 2,
        backgroundColor: '#0a0a0f' // dark cyberpunk background
      });

      const width = element.offsetWidth;
      const height = element.offsetHeight;

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [width, height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`${certificate.courseTitle.replace(/\s+/g, '_')}_Certificate.pdf`);
    } catch (e) {
      console.error('Failed to generate PDF', e);
    } finally {
      setDownloadingId(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1, transition: { type: 'spring', bounce: 0.4 } }
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="show" 
      variants={containerVariants}
      className="max-w-6xl mx-auto space-y-12 relative"
    >
      <motion.div variants={itemVariants} className="border-b-8 border-black pb-8 flex items-end justify-between rotate-[-1deg] mt-4">
         <div className="space-y-4">
           <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-black uppercase flex items-center gap-4" style={{ WebkitTextStroke: '2px black', color: 'transparent' }}>
              <Award className="w-12 h-12 text-black fill-neo-accent" strokeWidth={2} style={{ filter: 'drop-shadow(4px 4px 0px #000)' }} />
              <span className="text-neo-accent px-2 bg-neo-secondary" style={{ WebkitTextStroke: '0' }}>Certificates</span>
           </h1>
           <p className="font-bold text-lg uppercase tracking-widest bg-white border-4 border-black inline-block px-4 py-2 neo-shadow-sm rotate-[1deg]">Your Credentials.</p>
         </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {certificates.map((cert, idx) => (
          <motion.div 
            variants={itemVariants}
            key={cert.id} 
            className={cn("bg-white border-4 border-black overflow-hidden transition-colors duration-300 group flex flex-col h-full neo-shadow-lg", idx % 2 === 0 ? "rotate-[1deg]" : "rotate-[-1deg]")}
            whileHover={{ y: -10, boxShadow: '12px 12px 0px 0px #000', rotate: 0 }}
          >
             
             <div className="p-8 flex-1 relative z-10 bg-neo-muted">
                <motion.div 
                  initial={{ rotate: -20, opacity: 0 }} 
                  animate={{ rotate: 0, opacity: 1 }} 
                  transition={{ delay: 0.5 + (idx * 0.2), type: 'spring', bounce: 0.6 }}
                  className="w-16 h-16 bg-gradient-to-br from-[#ffd700] to-[#ffaa00] border-4 border-black text-black flex items-center justify-center mb-6 neo-shadow-sm group-hover:rotate-[15deg] transition-transform"
                >
                   <Award className="w-8 h-8 font-black" strokeWidth={3} />
                </motion.div>
                <h3 className="font-black text-2xl text-black uppercase tracking-tight line-clamp-2 mb-6 group-hover:underline decoration-4 underline-offset-4">{cert.courseTitle}</h3>
                
                <div className="space-y-3 text-sm font-bold text-black uppercase tracking-widest">
                   <div className="flex items-center gap-3">
                     <Calendar className="w-5 h-5 text-black" strokeWidth={3} />
                     Issued: {new Date(cert.issueDate).toLocaleDateString()}
                   </div>
                   <div className="flex items-center gap-3">
                     <BookOpen className="w-5 h-5 text-black" strokeWidth={3} />
                     ID: {cert.courseId.toUpperCase()}
                   </div>
                </div>
             </div>
             
             <div className="p-6 border-t-4 border-black bg-white relative z-10">
               <motion.button 
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => handleDownload(cert)}
                 disabled={downloadingId === cert.id}
                 className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-neo-accent border-4 border-black text-lg font-black text-black transition-colors disabled:opacity-50 uppercase tracking-widest neo-shadow-sm"
               >
                 {downloadingId === cert.id ? <Loader2 className="w-6 h-6 animate-spin" strokeWidth={3} /> : <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}><Download className="w-6 h-6" strokeWidth={3}/></motion.div>}
                 {downloadingId === cert.id ? 'Saving...' : 'Download'}
               </motion.button>
             </div>

             {/* Hidden Certificate Template for PDF Generation */}
             <div 
               className="fixed -top-[10000px] left-0 pointer-events-none"
             >
               <div 
                  ref={(el) => (certificateRefs.current[cert.id] = el)}
                  className="w-[1056px] h-[816px] bg-[#fdf5e6] text-black relative font-sans"
                  style={{
                    boxSizing: 'border-box',
                    border: '16px solid black',
                    padding: '40px',
                    boxShadow: '16px 16px 0px rgba(0, 0, 0, 1)'
                  }}
               >
                  <div className="relative z-10 flex flex-col h-full bg-white border-8 border-black p-16 text-center" style={{ boxShadow: '12px 12px 0px 0px #000' }}>
                     
                     <div className="mx-auto bg-neo-accent border-8 border-black p-6 mb-10 w-max" style={{ boxShadow: '8px 8px 0px 0px #000', transform: 'rotate(-5deg)' }}>
                        <Award className="w-24 h-24 text-black" strokeWidth={2.5} />
                     </div>

                     <h1 className="text-xl font-black uppercase tracking-[0.3em] text-black mb-6 bg-neo-secondary inline-block px-4 py-2 border-4 border-black mx-auto" style={{ transform: 'rotate(2deg)' }}>Certificate of Achievement</h1>
                     
                     <h2 className="text-2xl text-black mb-4 tracking-widest font-bold uppercase mt-8">Presented to</h2>
                     <h3 className="text-7xl font-black text-black mb-12 uppercase tracking-tighter" style={{ WebkitTextStroke: '2px black', color: 'white' }}>{cert.studentName}</h3>
                     
                     <p className="text-2xl text-black mb-6 uppercase border-b-8 border-black pb-2 inline-block font-black">For successfully completing</p>
                     <h4 className="text-5xl font-black text-black mb-16 uppercase tracking-tighter leading-tight max-w-4xl mx-auto">{cert.courseTitle}</h4>

                     <div className="mt-auto flex items-end justify-between font-bold text-black border-t-8 border-black pt-10">
                        <div className="text-left w-64 border-4 border-black bg-neo-muted p-4 rotate-[-2deg]">
                           <div className="text-2xl text-black mb-2 font-black">
                             {new Date(cert.issueDate).toLocaleDateString()}
                           </div>
                           <p className="text-black uppercase tracking-widest text-sm">Date Issued</p>
                        </div>
                        
                        <div className="flex flex-col items-center">
                           <div className="w-24 h-24 bg-neo-accent border-8 border-black flex items-center justify-center mb-4 rotate-[10deg]" style={{ boxShadow: '6px 6px 0px #000' }}>
                             <span className="font-black text-4xl">A.</span>
                           </div>
                           <p className="font-black uppercase tracking-widest text-lg">AURA Base</p>
                        </div>

                        <div className="text-right w-64 border-4 border-black p-4 rotate-[2deg] bg-white">
                           <div className="border-b-4 border-black pb-2 mb-2">
                             <span className="font-serif text-3xl text-black italic">Administrator</span>
                           </div>
                           <p className="text-black uppercase tracking-widest text-sm font-black">Validation Signature</p>
                        </div>
                     </div>
                  </div>
               </div>
             </div>
          </motion.div>
        ))}
        {certificates.length === 0 && (
          <motion.div variants={itemVariants} className="col-span-full py-16 text-center text-black bg-white border-4 border-black border-dashed uppercase tracking-widest font-black text-xl rotate-[-1deg] neo-shadow-sm">
            No Credentials Earned Yet
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Add cn helper
export function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
