"use client";

import React, { useState, useEffect } from "react";
import { Clock, Plus, Edit2, Trash2, Save, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ShiftManagement() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Variabel disesuaikan dengan skema database (startIn, startOut)
  const [formData, setFormData] = useState({ 
    id: "", 
    name: "", 
    startIn: "",
    endIn: "", // Jika ada field endIn di db, biarkan. Jika tidak, fokus ke startIn/startOut
    startOut: "", 
    endOut: "", 
    tolerance: "10" 
  });

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/shifts");
      const data = await res.json();
      if (Array.isArray(data)) {
        setShifts(data);
      } else {
        setShifts([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData.id ? "PATCH" : "POST";
    try {
      const res = await fetch("/api/admin/shifts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowModal(false);
        // Reset menggunakan key yang benar
        setFormData({ id: "", name: "", startIn: "", endIn: "", startOut: "", endOut: "", tolerance: "10" });
        fetchShifts();
      }
    } catch (err) {
      alert("Gagal menyimpan data");
    }
  };

  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Shift Master</h2>
          <p className="text-slate-500 text-sm font-medium">Konfigurasi jam kerja operasional.</p>
        </div>
        <Button 
          onClick={() => { setFormData({ id: "", name: "", startIn: "", endIn: "", startOut: "", endOut: "", tolerance: "10" }); setShowModal(true); }} 
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6 py-6 font-bold uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus size={18} className="mr-2" /> Tambah Shift
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center animate-pulse">
            <Loader2 className="mx-auto text-blue-500 animate-spin mb-4" size={40} />
            <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Syncing Master Data...</p>
          </div>
        ) : shifts.length > 0 ? (
          shifts.map((shift) => (
            <Card key={shift.id} className="bg-slate-900/40 border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md border-none shadow-2xl">
              <CardHeader className="p-8 pb-0">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-400 border border-blue-400/20">
                    <Clock size={24} />
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => { setFormData(shift); setShowModal(true); }} 
                    className="text-slate-500 hover:text-white hover:bg-white/5 rounded-xl"
                  >
                    <Edit2 size={16} />
                  </Button>
                </div>
                <CardTitle className="mt-4 text-xl font-black text-white uppercase tracking-tight">{shift.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-6">
                <div className="flex justify-between bg-black/20 p-4 rounded-2xl border border-white/5">
                  <div className="text-center flex-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Masuk</p>
                    {/* PERBAIKAN: Menggunakan startIn */}
                    <p className="text-lg font-mono font-bold text-white">{shift.startIn || "--:--"}</p>
                  </div>
                  <div className="w-px bg-white/5 mx-2" />
                  <div className="text-center flex-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Pulang</p>
                    {/* PERBAIKAN: Menggunakan startOut */}
                    <p className="text-lg font-mono font-bold text-white">{shift.startOut || "--:--"}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-bold text-slate-400">Toleransi</span>
                  <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                    {shift.tolerance} Menit
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center italic text-slate-500">Belum ada shift terdaftar.</div>
        )}
      </div>

      {/* Modal Editor */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-[#0f172a] border-white/10 rounded-[3rem] shadow-2xl overflow-hidden border-none text-white">
            <form onSubmit={handleSubmit}>
              <CardHeader className="p-10 pb-4 flex flex-row justify-between items-center">
                <CardTitle className="text-2xl font-black italic tracking-tighter uppercase">
                  {formData.id ? "Edit Shift" : "New Shift"}
                </CardTitle>
                <Button onClick={() => setShowModal(false)} variant="ghost" className="text-slate-500 text-3xl font-light hover:bg-transparent hover:text-white">×</Button>
              </CardHeader>
              <CardContent className="p-10 pt-6 space-y-6 text-white">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nama Shift</label>
                  <input required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Contoh: Pagi Jumat" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Jam Masuk</label>
                    <input required type="time" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none"
                      value={formData.startIn} onChange={(e) => setFormData({...formData, startIn: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Jam Pulang</label>
                    <input required type="time" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none"
                      value={formData.startOut} onChange={(e) => setFormData({...formData, startOut: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Toleransi (Menit)</label>
                  <input required type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none"
                    value={formData.tolerance} onChange={(e) => setFormData({...formData, tolerance: e.target.value})} />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-8 rounded-[2rem] text-sm tracking-[0.2em] uppercase shadow-xl shadow-blue-900/40 transition-all active:scale-95 mt-4">
                  Simpan Konfigurasi
                </Button>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}   