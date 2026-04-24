"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  LogOut, 
  ArrowRight,
  User,
  History
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EmployeeDashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [totalHadir, setTotalHadir] = useState(0); // State baru untuk angka asli
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (!session) {
      window.location.href = "/";
      return;
    }
    const user = JSON.parse(session);
    setUserData(user);

    const fetchData = async () => {
      try {
        // 1. Ambil status hari ini
        const resStatus = await fetch(`/api/attendance/status?userId=${user.id}`);
        const dataStatus = await resStatus.json();
        setTodayStatus(dataStatus);

        // 2. Ambil riwayat & total hadir bulan ini
        const resHistory = await fetch(`/api/attendance/history?userId=${user.id}`);
        const dataHistory = await resHistory.json();
        
        // Ambil angka totalHadirBulanIni dari payload API kita yang baru
        if (dataHistory.totalHadirBulanIni !== undefined) {
          setTotalHadir(dataHistory.totalHadirBulanIni);
        }
      } catch (err) {
        console.error("Gagal ambil data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    window.location.href = "/";
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 text-slate-200">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-64 bg-blue-600/10 blur-[120px] -z-10" />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Selamat Datang, {userData?.name}!</h1>
            <p className="text-slate-500 text-sm">Semoga harimu menyenangkan di kantor.</p>
          </div>
          <Button onClick={handleLogout} variant="ghost" className="text-rose-400 hover:bg-rose-400/10 rounded-xl">
            <LogOut size={20} />
          </Button>
        </header>

        {/* Status Card Hari Ini */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 bg-slate-900/40 border-white/5 backdrop-blur-xl overflow-hidden rounded-[2rem]">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Status Kehadiran</p>
                  <h2 className="text-xl font-bold text-white">Aktivitas Hari Ini</h2>
                </div>
                <div className="bg-blue-600/20 p-2 rounded-xl text-blue-400">
                  <Calendar size={20} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Jam Masuk</p>
                  <p className="text-2xl font-black text-emerald-400">
                    {todayStatus?.checkIn ? new Date(todayStatus.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                  </p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Jam Pulang</p>
                  <p className="text-2xl font-black text-orange-400">
                    {todayStatus?.checkOut ? new Date(todayStatus.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Action Card */}
          <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-none rounded-[2rem] shadow-xl shadow-blue-900/20">
            <CardContent className="p-8 flex flex-col justify-between h-full">
              <div className="space-y-2">
                <h3 className="text-white font-bold text-lg">Siap Bekerja?</h3>
                <p className="text-blue-100/70 text-xs">Pastikan kamu sudah berada di area kantor.</p>
              </div>
              
              <Button 
                onClick={() => window.location.href = "/employee/absensi"}
                className="mt-6 bg-white text-blue-600 hover:bg-slate-100 rounded-2xl py-6 font-bold shadow-lg flex items-center gap-2 group"
              >
                Buka Presensi <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation / Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stat Total Hadir */}
        <div className="flex items-center gap-4 p-6 bg-slate-900/40 border border-white/5 rounded-3xl backdrop-blur-md">
            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl">
            <CheckCircle2 size={24} />
            </div>
            <div>
            <p className="text-2xl font-black text-white">{totalHadir} Hari</p>
            <p className="text-xs text-slate-500 font-medium">Total Hadir Bulan Ini</p>
            </div>
        </div>

        {/* Tombol Riwayat Absensi */}
        <div 
            onClick={() => window.location.href = "/employee/history"} 
            className="flex items-center gap-4 p-6 bg-slate-900/40 border border-white/5 rounded-3xl backdrop-blur-md hover:bg-white/10 cursor-pointer transition-all group"
        >
            <div className="p-4 bg-purple-500/10 text-purple-500 rounded-2xl group-hover:scale-110 transition-transform">
            <History size={24} />
            </div>
            <div className="flex-1">
            <p className="text-sm font-bold text-white">Riwayat Absensi</p>
            <p className="text-xs text-slate-500 font-medium">Lihat detail kehadiran bulanan</p>
            </div>
            <ArrowRight size={18} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>
        </div>
      </div>
    </div>
  );
}