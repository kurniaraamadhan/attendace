"use client";

import React, { useState, useEffect } from "react";
import { Users, UserPlus, Trash2, Mail, Lock, User as UserIcon, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/employees");
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: "", email: "", password: "" });
        fetchEmployees();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (err) { alert("Gagal menyambung ke server"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus karyawan ini? Semua data absen terkait mungkin akan hilang.")) return;
    try {
      const res = await fetch(`/api/admin/employees?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchEmployees();
      else alert("Gagal menghapus user");
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-8 space-y-8 relative">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Employee Data</h2>
          <p className="text-slate-500 text-sm font-medium">Kelola akses dan informasi akun karyawan.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex gap-2 py-6 px-6 transition-all shadow-lg shadow-blue-600/20">
          <UserPlus size={20} /> <span className="font-bold uppercase text-xs tracking-widest">Tambah Karyawan</span>
        </Button>
      </header>

      <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">
                <th className="p-6 pl-10">Karyawan</th>
                <th className="p-6">Email</th>
                <th className="p-6 text-center">Password (Raw)</th>
                <th className="p-6 text-center">Tanggal Daftar</th>
                <th className="p-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-300">
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-all">
                  <td className="p-6 pl-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-400/20 font-black">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-white uppercase tracking-tight">{emp.name}</span>
                    </div>
                  </td>
                  <td className="p-6 text-slate-400">{emp.email}</td>
                  <td className="p-6 text-center font-mono opacity-50">{emp.password}</td>
                  <td className="p-6 text-center text-xs opacity-50">
                    {new Date(emp.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="p-6 text-center">
                    <Button onClick={() => handleDelete(emp.id)} variant="ghost" className="text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                      <Trash2 size={18} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-20 text-center animate-pulse text-slate-500 font-black uppercase tracking-widest">Loading Personnel Data...</div>}
        </CardContent>
      </Card>

      {/* Modal Tambah Karyawan */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-[#0f172a] border-white/10 rounded-[3rem] shadow-2xl overflow-hidden">
            <CardHeader className="p-10 pb-4 flex flex-row justify-between items-center bg-white/[0.02]">
              <CardTitle className="text-2xl font-black text-white italic tracking-tighter uppercase">New Employee</CardTitle>
              <Button onClick={() => setShowModal(false)} variant="ghost" className="text-slate-500 text-3xl font-light hover:bg-transparent hover:text-white">×</Button>
            </CardHeader>
            <CardContent className="p-10 pt-4">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nama Lengkap</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input 
                      required 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                      placeholder="Contoh: Budi Setiawan"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input 
                      required type="email"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                      placeholder="budi@kantor.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Set Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input 
                      required 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                      placeholder="Minimal 6 Karakter"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-8 rounded-3xl text-sm tracking-[0.2em] uppercase shadow-xl shadow-blue-900/40">
                  Save Karyawan
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}