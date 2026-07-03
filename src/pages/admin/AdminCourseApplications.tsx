import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Eye, RefreshCw } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export function AdminCourseApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const { showNotification } = useNotification();

  const loadApplications = () => {
    setLoading(true);
    apiFetch('/api/admin/course-applications')
      .then(res => res.json())
      .then(data => {
        setApplications(data.reverse());
        setLoading(false);
      });
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleApprove = async () => {
    if (!selectedApp) return;
    
    const app = selectedApp;
    
    const msg = `🎉 Welcome to AURA LMS!

Hello ${app.studentName},

Congratulations!

Your application for ${app.courseTitle} has been approved successfully.

You can now log in to AURA LMS and start your learning journey.

We are excited to have you with us and wish you great success.

Thank you,
Team AURA LMS`;

    const encodedMsg = encodeURIComponent(msg);
    window.open(`https://wa.me/${app.whatsapp}?text=${encodedMsg}`, '_blank');
    
    try {
      const res = await apiFetch(`/api/admin/course-applications/${app.id}/approve`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        loadApplications();
        setSelectedApp(null);
        setApproveModalOpen(false);
        showNotification('Application approved successfully.', 'success');
      } else {
        console.error("Critical Error:", data.error || data.message || "Unknown error");
        showNotification(data.error || data.message || 'Error approving', 'error');
      }
    } catch (err: any) {
      console.error("Critical Error Approving:", err);
      showNotification(err.message || 'Error approving', 'error');
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    
    const app = selectedApp;
    
    const msg = `Hello ${app.studentName},

Thank you for applying to AURA LMS.

Unfortunately, your application for ${app.courseTitle} could not be approved at this time.

You are welcome to apply for another course in the future or contact our support team for assistance.

We appreciate your interest and wish you success in your learning journey.
Team AURA LMS`;

    const encodedMsg = encodeURIComponent(msg);
    window.open(`https://wa.me/${app.whatsapp}?text=${encodedMsg}`, '_blank');
    
    try {
      const res = await apiFetch(`/api/admin/course-applications/${app.id}/reject`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        loadApplications();
        setSelectedApp(null);
        setRejectModalOpen(false);
        showNotification('Application rejected successfully.', 'success');
      } else {
        console.error("Critical Error:", data.error || data.message || "Unknown error");
        showNotification(data.error || data.message || 'Error rejecting', 'error');
      }
    } catch (err: any) {
      console.error("Critical Error Rejecting:", err);
      showNotification(err.message || 'Error rejecting', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-neo-secondary border-8 border-black p-6 neo-shadow-lg rotate-[-1deg]">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-black">Course Applications</h1>
        <button onClick={loadApplications} className="bg-black text-white p-3 border-4 border-black hover:bg-neo-accent hover:text-black transition-colors">
          <RefreshCw className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-[var(--color-card)] border-4 border-black p-4 neo-shadow flex justify-between items-center opacity-70">
                  <div className="space-y-2 w-2/3">
                    <div className="h-6 bg-gray-300 w-1/3" />
                    <div className="h-4 bg-gray-200 w-1/2" />
                    <div className="h-6 bg-gray-300 w-24 mt-2" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-10 h-10 border-4 border-black bg-gray-200" />
                    <div className="w-10 h-10 border-4 border-black bg-gray-200" />
                    <div className="w-10 h-10 border-4 border-black bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-[var(--color-card)] border-8 border-black p-8 text-center text-xl font-black">No applications found.</div>
          ) : (
            applications.map(app => (
              <motion.div 
                key={app.id} 
                className="bg-[var(--color-card)] border-4 border-black p-4 neo-shadow flex justify-between items-center"
              >
                <div>
                  <h3 className="text-xl font-black uppercase text-black">{app.studentName}</h3>
                  <p className="text-sm font-bold opacity-70 text-black">{app.courseTitle}</p>
                  <p className="text-xs font-bold mt-2">
                    <span className={`inline-block px-3 py-1 font-black uppercase text-xs tracking-wider border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] ${app.status === 'pending' ? 'bg-yellow-400' : app.status === 'approved' ? 'bg-green-400' : 'bg-red-400'}`}>
                      {app.status}
                    </span>
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => setSelectedApp(app)} className="p-2 border-4 border-black hover:bg-neo-accent text-black bg-white transition-colors">
                    <Eye size={20} />
                  </button>
                  {app.status === 'pending' && (
                    <>
                      <button onClick={() => { setSelectedApp(app); setApproveModalOpen(true); }} className="p-2 border-4 border-black hover:bg-green-400 text-black bg-white transition-colors">
                        <CheckCircle size={20} />
                      </button>
                      <button onClick={() => { setSelectedApp(app); setRejectModalOpen(true); }} className="p-2 border-4 border-black hover:bg-red-400 text-black bg-white transition-colors">
                        <XCircle size={20} />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div>
          {selectedApp ? (
            <div className="bg-[var(--color-card)] border-8 border-black p-6 sticky top-8">
              <h2 className="text-2xl font-black uppercase text-black mb-4 border-b-4 border-black pb-2">Application Details</h2>
              <div className="space-y-4">
                <div><span className="text-xs uppercase font-black opacity-50 block">Name</span><div className="font-bold">{selectedApp.studentName || selectedApp.name}</div></div>
                <div><span className="text-xs uppercase font-black opacity-50 block">WhatsApp</span><div className="font-bold">{selectedApp.whatsapp}</div></div>
                <div><span className="text-xs uppercase font-black opacity-50 block">City</span><div className="font-bold">{selectedApp.city}</div></div>
                <div><span className="text-xs uppercase font-black opacity-50 block">Qualification</span><div className="font-bold">{selectedApp.qualification} at {selectedApp.college}</div></div>
                
                <div className="border-t-4 border-black pt-4 mt-4">
                  <span className="text-xs uppercase font-black opacity-50 block">Applied Course</span>
                  <div className="font-bold bg-neo-muted border-2 border-black p-2 mt-1">{selectedApp.courseTitle}</div>
                </div>
                <div><span className="text-xs uppercase font-black opacity-50 block">Reason for joining</span><div className="font-bold">{selectedApp.reason}</div></div>
                <div><span className="text-xs uppercase font-black opacity-50 block">Preferred Batch</span><div className="font-bold">{selectedApp.batch}</div></div>
                <div><span className="text-xs uppercase font-black opacity-50 block">Learning Mode</span><div className="font-bold">{selectedApp.learningMode}</div></div>
                <div><span className="text-xs uppercase font-black opacity-50 block">Registration Date</span><div className="font-bold">{new Date(selectedApp.date).toLocaleString()}</div></div>
              </div>
              
              {selectedApp.status === 'pending' && (
                <div className="mt-8 flex gap-4">
                  <button onClick={() => setApproveModalOpen(true)} className="flex-1 bg-green-400 border-4 border-black p-3 font-black uppercase text-black hover:bg-green-500 hover:-translate-y-1 transition-transform">
                    Approve
                  </button>
                  <button onClick={() => setRejectModalOpen(true)} className="flex-1 bg-red-400 border-4 border-black p-3 font-black uppercase text-black hover:bg-red-500 hover:-translate-y-1 transition-transform">
                    Reject
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[var(--color-card)] border-8 border-black p-6 text-center text-sm font-black uppercase opacity-50 sticky top-8">
              Select an application to view details
            </div>
          )}
        </div>
      </div>
      
      {approveModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 max-w-md w-full border-8 border-black neo-shadow-2xl"
          >
            <h2 className="text-3xl font-black uppercase tracking-tighter text-black mb-6">Approve Application</h2>
            <p className="text-lg font-bold text-black mb-8">
              Approve this course application?
            </p>
            <div className="flex gap-4">
              <button 
                onClick={handleApprove} 
                className="flex-1 bg-green-400 text-black border-4 border-black p-4 font-black uppercase tracking-widest hover:bg-green-500 transition-colors"
              >
                Yes
              </button>
              <button 
                onClick={() => setApproveModalOpen(false)} 
                className="flex-1 bg-gray-200 text-black border-4 border-black p-4 font-black uppercase tracking-widest hover:bg-gray-300 transition-colors"
              >
                No
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 max-w-md w-full border-8 border-black neo-shadow-2xl"
          >
            <h2 className="text-3xl font-black uppercase tracking-tighter text-black mb-6">Reject Application</h2>
            <p className="text-lg font-bold text-black mb-8">
              Are you sure you want to reject this course application?
            </p>
            <div className="flex gap-4">
              <button 
                onClick={handleReject} 
                className="flex-1 bg-red-400 text-black border-4 border-black p-4 font-black uppercase tracking-widest hover:bg-red-500 transition-colors"
              >
                Confirm Reject
              </button>
              <button 
                onClick={() => setRejectModalOpen(false)} 
                className="flex-1 bg-gray-200 text-black border-4 border-black p-4 font-black uppercase tracking-widest hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
