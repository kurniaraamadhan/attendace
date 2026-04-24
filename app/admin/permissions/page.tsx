"use client";

import React, { useState, useEffect } from "react";
import { ClipboardCheck, Check, X, Eye, Clock, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminPermissions() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/permissions");
      const data = await res.json();
      setList(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchPermissions(); }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/permissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) fetchPermissions();
    } catch (err) { alert("Gagal update"); }
  };

  return (
    <div className="p-8 space-y-8">
      <header>
        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic text-white">Inbox Pengajuan Izin</h2>
        <p className="text-slate-500 text-sm font-medium">Tinjau dan proses permohonan izin/sakit karyawan.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.length > 0 ? list.map((item) => (
          <Card key={item.id} className={`bg-slate-900/40 border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-md transition-all ${item.status === 'PENDING' ? 'ring-1 ring-blue-500/30' : ''}`}>
            <CardHeader className="p-6 pb-0 flex flex-row justify-between items-start">
              <div className="flex flex-col">
                <span className={`text-[9px] font-black px-2 py-1 rounded-md mb-2 w-fit tracking-widest ${item.type === 'SAKIT' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {item.type}
                </span>
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">{item.user.name}</h3>
              </div>
              <div className="text-right">
                 <p className="text-[10px] text-slate-500 font-bold uppercase">{new Date(item.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}</p>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-slate-400 italic line-clamp-3">"{item.reason}"</p>
              
              {item.image && (
                <div 
                  onClick={() => setPreviewImage(item.image)}
                  className="relative h-32 w-full bg-black/20 rounded-2xl overflow-hidden group cursor-pointer border border-white/5"
                >
                  <img src={item.image} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-all" alt="Bukti" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Eye size={20} className="text-white opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-2">
                {item.status === "PENDING" ? (
                  <>
                    <Button 
                      onClick={() => handleUpdateStatus(item.id, "APPROVED")}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6 font-bold uppercase text-[10px] tracking-widest"
                    >
                      Approve
                    </Button>
                    <Button 
                      onClick={() => handleUpdateStatus(item.id, "REJECTED")}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl py-6 font-bold uppercase text-[10px] tracking-widest"
                    >
                      Reject
                    </Button>
                  </>
                ) : (
                  <div className={`w-full py-3 text-center rounded-xl font-black text-[10px] tracking-[0.3em] uppercase ${item.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {item.status}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full py-20 text-center opacity-20 italic">Belum ada pengajuan izin masuk.</div>
        )}
      </div>

      {/* Modal Preview Gambar */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-8" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} className="max-w-full max-h-full rounded-2xl shadow-2xl border border-white/10" alt="Preview Full" />
        </div>
      )}
    </div>
  );
}