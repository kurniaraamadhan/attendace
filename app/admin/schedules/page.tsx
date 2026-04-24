"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, Wand2, Search, Filter, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";

export default function AdminSchedules() {
  const [employees, setEmployees] = useState<any[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("ALL");
  
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [overrideWorkType, setOverrideWorkType] = useState<string>("FOLLOW_DB"); 
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/schedules/list");
      const data = await res.json();
      if (Array.isArray(data)) setEmployees(data);
    } catch (error) { console.error("Error fetching schedules:", error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSchedules(); }, []);

  const filteredEmployees = employees.filter(emp => {
    const matchName = emp.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDept = filterDept === "ALL" || emp.department === filterDept;
    return matchName && matchDept;
  });

  const departments = Array.from(new Set(employees.map(emp => emp.department))).filter(Boolean);

  const handleGenerate = async () => {
    if (!selectedUser) return alert("Pilih karyawan terlebih dahulu!");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/schedules/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser, month, overrideWorkType })
      });
      if (res.ok) {
        alert("Jadwal berhasil disinkronkan!");
        fetchSchedules();
      } else {
        const err = await res.json();
        alert("Gagal: " + err.error);
      }
    } catch (error) { alert("Gagal menyambung ke server"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-200">
      <header className="mb-10">
        <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">Management Schedules</h2>
        <p className="text-slate-500 text-sm font-medium italic">Otomasi plotting & monitoring jadwal kerja harian.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* PANEL KIRI: GENERATOR */}
        <div className="space-y-6">
          <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md rounded-[2rem] border-none shadow-2xl">
            <CardHeader>
              <CardTitle className="text-[10px] font-black flex items-center gap-2 uppercase tracking-[0.2em] text-blue-400">
                <Wand2 size={16} /> Auto-Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* TARGET PERSONIL - SEKARANG ADA OPSI SEMUA KARYAWAN */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Target Personil</label>
                <Select onValueChange={setSelectedUser}>
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 text-white font-black uppercase text-[10px] tracking-widest">
                    <SelectValue placeholder="PILIH TARGET..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    <SelectItem value="ALL" className="text-blue-400 font-black italic">
                      ✨ SEMUA KARYAWAN
                    </SelectItem>
                    <div className="h-px bg-white/10 my-1" />
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Set Aturan Kerja</label>
                <Select onValueChange={setOverrideWorkType} defaultValue="FOLLOW_DB">
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    <SelectItem value="FOLLOW_DB">Sesuai Profil (DB)</SelectItem>
                    <SelectItem value="5HK">Paksa 5 Hari Kerja</SelectItem>
                    <SelectItem value="6HK">Paksa 6 Hari Kerja</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Pilih Bulan</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="month" 
                    value={month} 
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all" 
                  />
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-7 rounded-2xl shadow-lg shadow-blue-900/20 uppercase tracking-widest text-xs"
              >
                {loading ? <RefreshCw className="animate-spin" /> : "Sync Jadwal"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* PANEL KANAN: MONITORING TABLE */}
        <Card className="lg:col-span-3 bg-slate-900/40 border-white/5 backdrop-blur-md rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
          <CardHeader className="p-8 pb-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-1 gap-4 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  placeholder="Cari nama karyawan..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all" 
                />
              </div>
              <Select onValueChange={setFilterDept} defaultValue="ALL">
                <SelectTrigger className="w-[200px] bg-white/5 border-white/10 rounded-2xl text-white">
                  <Filter size={14} className="mr-2 text-slate-500" />
                  <SelectValue placeholder="Departemen" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  <SelectItem value="ALL">Semua Divisi</SelectItem>
                  {departments.map((dept: any) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" onClick={fetchSchedules} className="text-slate-400 hover:text-white">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-none">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">
                    <th className="p-6 pl-10">Personil</th>
                    <th className="p-6">Departemen</th>
                    <th className="p-6">Tipe Kerja</th>
                    <th className="p-6">Jadwal Hari Ini</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredEmployees.length > 0 ? filteredEmployees.map((emp) => {
                    // MENDAPATKAN TANGGAL HARI INI DI ASIA/JAKARTA (YYYY-MM-DD)
                    const todayStr = new Intl.DateTimeFormat('fr-CA', {
                      timeZone: 'Asia/Jakarta',
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    }).format(new Date()); 

                    const todaySched = emp.schedules?.find((s: any) => {
                      // Ambil 10 karakter pertama dari DB (YYYY-MM-DD)
                      const dbDateStr = s.date.substring(0, 10);
                      return dbDateStr === todayStr;
                    });
                    
                    return (
                      <tr key={emp.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="p-6 pl-10">
                          <p className="font-black text-white uppercase tracking-tighter">{emp.name}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{emp.email}</p>
                        </td>
                        <td className="p-6">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {emp.department || "General"}
                          </span>
                        </td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black border ${emp.workType === '5HK' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                            {emp.workType}
                          </span>
                        </td>
                        <td className="p-6">
                          {todaySched ? (
                            <div className="flex flex-col">
                              <span className="text-xs text-blue-400 font-black uppercase italic tracking-tighter">
                                {todaySched.shift?.name}
                              </span>
                              <span className="text-[10px] text-slate-500 font-bold">
                                {todaySched.shift?.startIn} - {todaySched.shift?.startOut}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <span className="text-[9px] text-rose-500 font-black uppercase tracking-widest opacity-40 italic">
                                Off / Libur
                              </span>
                              <span className="text-[8px] text-slate-700 font-bold">Check: {todayStr}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={4} className="p-20 text-center text-slate-600 text-xs italic">Data tidak ditemukan...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}