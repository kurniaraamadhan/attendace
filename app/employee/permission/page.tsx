"use client";

import React, { useState, useEffect } from "react";
import { FileText, Camera, Send, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EmployeePermission() {
  const [userData, setUserData] = useState<any>(null);
  const [type, setType] = useState("SAKIT");
  const [reason, setReason] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (session) setUserData(JSON.parse(session));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!reason) return alert("Alasan harus diisi!");
    setLoading(true);
    try {
      const res = await fetch("/api/employee/permission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userData.id, type, reason, image })
      });
      if (res.ok) setSuccess(true);
    } catch (err) { alert("Gagal mengirim"); }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 size={80} className="text-emerald-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Pengajuan Terkirim!</h2>
        <p className="text-slate-500 text-sm mt-2">Mohon tunggu persetujuan dari Admin.</p>
        <Button onClick={() => window.location.href = "/employee/dashboard"} className="mt-8 bg-blue-600 rounded-2xl px-10">Kembali</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-6 pb-32">
      <header className="mb-8 pt-4">
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Request Access</p>
        <h1 className="text-2xl font-black text-white tracking-tighter italic uppercase text-white">Form Izin & Sakit</h1>
      </header>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setType("SAKIT")}
            className={`p-6 rounded-[2rem] border-2 transition-all font-black text-xs tracking-widest ${type === 'SAKIT' ? 'bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-600/20' : 'bg-slate-900/50 border-white/5 text-slate-500'}`}
          >
            SAKIT
          </button>
          <button 
            onClick={() => setType("IZIN")}
            className={`p-6 rounded-[2rem] border-2 transition-all font-black text-xs tracking-widest ${type === 'IZIN' ? 'bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-600/20' : 'bg-slate-900/50 border-white/5 text-slate-500'}`}
          >
            IZIN
          </button>
        </div>

        <Card className="bg-slate-900/40 border-white/5 rounded-[2.5rem] backdrop-blur-md overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Alasan / Keterangan</label>
              <textarea 
                className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-white text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all min-h-[120px]"
                placeholder="Tuliskan alasan anda secara singkat..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Bukti Foto (Opsional)</label>
              <div className="relative">
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center p-8 bg-black/20 border-2 border-dashed border-white/10 rounded-[2rem] cursor-pointer hover:bg-black/40 transition-all">
                  {image ? (
                    <img src={image} className="w-full h-40 object-cover rounded-xl" alt="Preview" />
                  ) : (
                    <>
                      <Camera size={32} className="text-slate-600 mb-2" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Upload Surat / Foto</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-8 rounded-[2rem] text-sm tracking-[0.2em] uppercase shadow-2xl shadow-blue-900/40 transition-all"
            >
              {loading ? "SENDING..." : "KIRIM PENGAJUAN"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}