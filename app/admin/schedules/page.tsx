"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, Wand2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface Shift {
  id: string;
  name: string;
}

interface UserSchedule {
  date: string;
  shift: Shift;
}

interface Employee {
  id: string;
  name: string;
  scheduleType: string | null;
  schedules: UserSchedule[];
}

export default function AdminPlotting() {
  const [employees, setEmployees] = useState<Employee[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startShift, setStartShift] = useState<string>("PAGI");

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/schedules/list");
      const data = await res.json();
      if (Array.isArray(data)) {
        setEmployees(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchSchedules(); 
  }, []);

  const handleGenerate = async () => {
    if (!selectedUser) {
      alert("Pilih karyawan terlebih dahulu");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/schedules/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser,
          startDate: startDate,
          startShiftType: startShift
        })
      });

      if (res.ok) {
        alert("Jadwal 32 hari berhasil di-generate!");
        fetchSchedules();
      } else {
        const err = await res.json();
        alert("Gagal: " + (err.error || "Terjadi kesalahan"));
      }
    } catch (error) {
      alert("Gagal menyambung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-200">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-white tracking-tight">Plotting Jadwal Kerja</h2>
        <p className="text-slate-500 text-sm mt-1">Kelola siklus rolling 2-2-2-2 dan jadwal tetap karyawan.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md h-fit">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-blue-400">
              <Wand2 size={16} /> Auto-Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pilih Karyawan</label>
              <Select onValueChange={(val: string) => setSelectedUser(val)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Pilih Karyawan" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  {employees.map((emp: Employee) => (
                    <SelectItem key={emp.id} value={emp.id} className="focus:bg-blue-600">
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tanggal Mulai Siklus</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Mulai Dari Shift</label>
              <Select onValueChange={(val: string) => setStartShift(val)} defaultValue="PAGI">
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  <SelectItem value="PAGI">Shift Pagi</SelectItem>
                  <SelectItem value="SIANG">Shift Siang</SelectItem>
                  <SelectItem value="MALAM">Shift Malam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-xl mt-4 transition-all"
            >
              {loading ? "Processing..." : "Generate 32 Hari"}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 bg-slate-900/40 border-white/5 backdrop-blur-md overflow-hidden">
          <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Monitoring Jadwal Aktif
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchSchedules} className="text-slate-400 hover:text-white">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] text-slate-500 uppercase tracking-widest">
                    <th className="p-4 pl-6">Nama Karyawan</th>
                    <th className="p-4">Tipe Jadwal</th>
                    <th className="p-4">Shift Hari Ini</th>
                    <th className="p-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length > 0 ? employees.map((emp: Employee) => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const todaySched = emp.schedules?.find((s: any) => s.date.startsWith(todayStr));
                    
                    return (
                      <tr key={emp.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 pl-6 font-bold text-white text-sm">{emp.name}</td>
                        <td className="p-4">
                          <span className="text-[9px] bg-white/5 px-2 py-1 rounded text-slate-400 font-bold border border-white/5 uppercase tracking-tighter">
                            {emp.scheduleType || "UNSET"}
                          </span>
                        </td>
                        <td className="p-4">
                          {todaySched ? (
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                todaySched.shift.name.includes("Pagi") ? "bg-blue-400" : 
                                todaySched.shift.name.includes("Siang") ? "bg-amber-400" : "bg-purple-400"
                              }`} />
                              <span className="text-xs text-slate-200">{todaySched.shift.name}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-rose-500 font-medium italic opacity-70 tracking-tight">Libur / Belum di-plot</span>
                          )}
                        </td>
                        <td className="p-4">
                           <Button variant="ghost" size="sm" className="text-[10px] text-blue-400 hover:bg-blue-400/10 font-bold">Detail</Button>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={4} className="p-10 text-center text-slate-600 text-xs italic">Tidak ada data karyawan</td>
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