import { Award, Download, Plus } from 'lucide-react';
import { apiFetch } from '../../lib/api'; import { useState, useEffect } from 'react';

export function AdminCertificates() {
  const [certificates, setCertificates] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/api/certificates').then(r => r.json()).then(setCertificates);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="border-b-8 border-black pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-black uppercase">
            Issued <span className="bg-[#00CCFF] px-4 py-1 border-4 border-black inline-block rotate-[-2deg]">Certificates</span>
          </h1>
        </div>
        <button className="flex items-center gap-3 font-black text-black text-xl bg-neo-accent border-4 border-black px-6 py-4 hover:bg-neo-secondary hover:-translate-y-1 transition-all neo-shadow-sm active:translate-y-0 active:shadow-none uppercase">
          <Plus className="w-8 h-8" strokeWidth={3} /> Generate Manual
        </button>
      </div>

      <div className="bg-white border-4 border-black overflow-hidden neo-shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neo-secondary text-black uppercase text-sm tracking-widest font-black">
                <th className="p-4 border-b-4 border-black border-r-4">ID</th>
                <th className="p-4 border-b-4 border-black border-r-4">Student Name</th>
                <th className="p-4 border-b-4 border-black border-r-4">Course</th>
                <th className="p-4 border-b-4 border-black border-r-4">Issue Date</th>
                <th className="p-4 border-b-4 border-black text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert) => (
                <tr key={cert.id} className="border-b-4 border-black hover:bg-neo-muted transition-colors font-bold">
                  <td className="p-4 border-r-4 border-black">{cert.id.toUpperCase()}</td>
                  <td className="p-4 border-r-4 border-black flex items-center gap-2">
                    <Award className="w-5 h-5 text-black" strokeWidth={3}/> {cert.studentName}
                  </td>
                  <td className="p-4 border-r-4 border-black max-w-xs truncate">{cert.courseTitle}</td>
                  <td className="p-4 border-r-4 border-black">{cert.issueDate}</td>
                  <td className="p-4 text-center">
                    <button className="p-2 bg-white border-2 border-black hover:bg-neo-accent inline-flex">
                      <Download className="w-5 h-5 text-black" strokeWidth={2.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
