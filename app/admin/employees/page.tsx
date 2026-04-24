"use client";

import React, { useState, useEffect } from "react";
import { Users, UserPlus, Trash2, Mail, Lock, User as UserIcon, Clock, Briefcase, Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // State form ditambahkan field 'id' untuk keperluan Edit
  const [formData, setFormData] = useState({ 
    id: "", 
    name: "", 
    email: "", 
    password: "", 
    workType: "6HK", 
    defaultShiftId: "" 
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resEmp, resShift] = await Promise.all([
        fetch("/api/admin/employees"),
        fetch("/api/admin/shifts")
      ]);
      const dataEmp = await resEmp.json();
      const dataShift = await resShift.json();
      setEmployees(Array.isArray(dataEmp) ? dataEmp : []);
      setShifts(Array.isArray(dataShift) ? dataShift : []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Ambil nilai terbaru langsung dari Dropdown (DOM)
    const selectElement = document.getElementById("workTypeSelect") as HTMLSelectElement;
    const currentWorkType = selectElement ? selectElement.value : formData.workType;

    // 2. Bungkus ke payload baru
    const payloadData = {
      ...formData,
      workType: (document.getElementById("workTypeSelect") as HTMLSelectElement).value 
    };

    console.log("LOG AKHIR SEBELUM FETCH:", payloadData);

    const method = formData.id ? "PATCH" : "POST";
  
    try {
      const res = await fetch("/api/admin/employees", {
        method: method,
        headers: { "Content-Type": "application/json" },
        // PERBAIKAN DISINI: Harus kirim payloadData, jangan formData!
        body: JSON.stringify(payloadData), 
      });

      if (res.ok) {
        setShowModal(false);
        // Reset form
        setFormData({ id: "", name: "", email: "", password: "", workType: "6HK", defaultShiftId: "" });
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (err) {
      alert("Gagal menyambung ke server");
    }
  };

  const handleEdit = (emp: any) => {
    setFormData({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      password: emp.password, // Raw password untuk kemudahan admin
      workType: emp.workType || "6HK",
      defaultShiftId: emp.defaultShiftId || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus karyawan ini?")) return;
    try {
      const res = await fetch(`/api/admin/employees?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-8 space-y-8 relative">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Employee Data</h2>
          <p className="text-slate-500 text-sm font-medium">Manajemen klasifikasi kerja & akses.</p>
        </div>
        <Button 
          onClick={() => {
            setFormData({ id: "", name: "", email: "", password: "", workType: "6HK", defaultShiftId: "" });
            setShowModal(true);
          }} 
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex gap-2 py-6 px-6 shadow-lg shadow-blue-600/20"
        >
          <UserPlus size={20} /> <span className="font-bold uppercase text-xs tracking-widest">Tambah Karyawan</span>
        </Button>
      </header>

      <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">
                <th className="p-6 pl-10">Karyawan</th>
                <th className="p-6">Email</th>
                <th className="p-6 text-center">Tipe Kerja</th>
                <th className="p-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-300">
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-all">
                  <td className="p-6 pl-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-400/20 font-black uppercase">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white uppercase tracking-tight">{emp.name}</p>
                        <p className="text-[9px] text-slate-500 font-black tracking-widest uppercase italic">
                          {emp.defaultShift?.name || "Shift Belum Diatur"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-slate-400">{emp.email}</td>
                  <td className="p-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black ${emp.workType === '5HK' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                      {emp.workType}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex justify-center gap-2">
                      {/* TOMBOL EDIT DITAMBAHKAN DISINI */}
                      <Button onClick={() => handleEdit(emp)} variant="ghost" className="text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all">
                        <Edit2 size={18} />
                      </Button>
                      <Button onClick={() => handleDelete(emp.id)} variant="ghost" className="text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-20 text-center animate-pulse text-slate-500 font-black uppercase tracking-widest">Loading Personnel Data...</div>}
        </CardContent>
      </Card>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-[#0f172a] border-white/10 rounded-[3rem] shadow-2xl overflow-hidden border-none">
            <CardHeader className="p-10 pb-4 flex flex-row justify-between items-center bg-white/[0.02]">
              <CardTitle className="text-2xl font-black text-white italic tracking-tighter uppercase">
                {formData.id ? "Edit Personnel" : "New Personnel"}
              </CardTitle>
              <Button onClick={() => setShowModal(false)} variant="ghost" className="text-slate-500 text-3xl font-light hover:bg-transparent hover:text-white">×</Button>
            </CardHeader>
            <CardContent className="p-10 pt-4">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nama Lengkap</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                      placeholder="Nama Karyawan" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="workTypeSelect" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                      Tipe Kerja
                    </label>
                    <select 
                      id="workTypeSelect"
                      name="workType"
                      value={formData.workType} 
                      onChange={(e) => {
                        const valueBaru = e.target.value;
                        console.log("USER KLIK DROPDOWN:", valueBaru);
                        setFormData({ ...formData, workType: valueBaru });
                      }}
                      className="w-full bg-[#1e293b] border border-white/10 rounded-2xl py-4 px-5 text-white outline-none focus:ring-2 focus:ring-blue-600 appearance-none cursor-pointer"
                    >
                      <option value="6HK" className="bg-slate-900">6 Hari Kerja (Sen-Sab)</option>
                      <option value="5HK" className="bg-slate-900">5 Hari Kerja (Sen-Jum)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Email Kantor</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input required type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                      placeholder="email@kantor.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                      placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-8 rounded-3xl text-sm tracking-[0.2em] uppercase shadow-xl shadow-blue-900/40 transition-all active:scale-95">
                  {formData.id ? "Update Changes" : "Save Personnel"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}