import { FileText, Upload, Trash2, Download } from 'lucide-react';
import { apiFetch } from '../../lib/api'; import { useEffect, useState } from 'react';

export function AdminMaterials() {
  const [materials, setMaterials] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/api/materials').then(r => r.json()).then(setMaterials);
  }, []);

  const handleUpload = async () => {
    const title = prompt("Enter material title");
    if (!title) return;
    try {
      const res = await apiFetch('/api/admin/materials', {
        method: 'POST',
        body: { title, type: 'PDF', courseId: 'c1' }
      });
      const data = await res.json();
      setMaterials([...materials, data]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this material?')) return;
    try {
      await apiFetch(`/api/admin/materials/${id}`, { method: 'DELETE' });
      setMaterials(materials.filter(m => m.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="border-b-8 border-black pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-black uppercase">
            Learning <span className="bg-[#FFCC00] px-4 py-1 border-4 border-black inline-block rotate-[-1deg]">Materials</span>
          </h1>
        </div>
        <button onClick={handleUpload} className="flex items-center gap-3 font-black text-black text-xl bg-white border-4 border-black px-6 py-4 hover:bg-neo-accent hover:-translate-y-1 transition-all neo-shadow-sm active:translate-y-0 active:shadow-none uppercase">
          <Upload className="w-8 h-8" strokeWidth={3} /> Upload File
        </button>
      </div>

      <div className="grid gap-6">
        {materials.map((mat) => (
          <div key={mat.id} className="bg-white border-4 border-black p-6 flex flex-col sm:flex-row items-center gap-6 neo-shadow-sm hover:-translate-y-1 hover:neo-shadow-md transition-all group">
            <div className={`w-16 h-16 border-4 border-black flex items-center justify-center shrink-0 rotate-[2deg] ${mat.type.toUpperCase() === 'PDF' ? 'bg-[#FF3366]' : mat.type.toUpperCase() === 'MP4' ? 'bg-[#00FF88]' : 'bg-[#00CCFF]'}`}>
              <FileText className="w-8 h-8 text-black" strokeWidth={3} />
            </div>
            
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h3 className="font-black text-2xl uppercase tracking-tighter truncate">{mat.title}</h3>
              <p className="font-bold text-black/60 uppercase tracking-widest text-sm mt-1">{mat.type} • {new Date(mat.uploadedAt).toLocaleDateString()}</p>
            </div>
            
            <div className="flex items-center gap-4 shrink-0">
              <button className="p-3 bg-white border-4 border-black hover:bg-neo-secondary transition-colors">
                <Download className="w-6 h-6 text-black" strokeWidth={3} />
              </button>
              <button onClick={() => handleDelete(mat.id)} className="p-3 bg-white border-4 border-black hover:bg-[#FF3366] transition-colors">
                <Trash2 className="w-6 h-6 text-black" strokeWidth={3} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
