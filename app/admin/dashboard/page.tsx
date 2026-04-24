"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, UserCheck, UserX, Clock, 
  Camera, LayoutDashboard, Circle, CalendarDays
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function AdminDashboard() {
  const [isSelfieRequired, setIsSelfieRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 
  const [data, setData] = useState<any>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const resDash = await fetch("/api/admin/dashboard");
      const dashData = await resDash.json();
      setData(dashData);

      const resSettings = await fetch('/api/admin/settings');
      const dataSettings = await resSettings.json();
      if (dataSettings) {
        setIsSelfieRequired(dataSettings.isSelfieRequired);
      }
    } catch (err) {
      console.error("Gagal sinkronisasi:", err);
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSelfie = async (checked: boolean) => {
    if (isLoading) return; 
    setIsSelfieRequired(checked);
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSelfieRequired: checked })
      });
    } catch (err) {
      alert("Gagal update database");
      setIsSelfieRequired(!checked);
    }
  };

  const formatTime = (date: string | null) => {
    if (!date) return "--:--";
    return new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const calculateDuration = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return "Active";
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const diffMs = end - start;
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.round(((diffMs % 3600000) / 60000));
    return `${diffHrs}j ${diffMins}m`;
  };

  const statsCards = [
    { title: "Total Karyawan", value: data?.stats?.totalKaryawan || 0, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { title: "Hadir Hari Ini", value: data?.stats?.hadirHariIni || 0, icon: UserCheck, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { title: "Terlambat", value: data?.stats?.terlambat || 0, icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
    { title: "Izin/Sakit", value: data?.stats?.izinSakit || 0, icon: UserX, color: "text-rose-400", bg: "bg-rose-400/10" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 relative overflow-y-auto">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard Utama</h2>
          <p className="text-slate-500 text-sm mt-1">Monitoring kehadiran secara real-time.</p>
        </div>
        <div className="bg-slate-900/50 border border-white/5 p-2 rounded-2xl px-4 flex items-center gap-3 backdrop-blur-md">
          <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
          <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
            {isLoading ? 'Syncing...' : 'Live System'}
          </span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statsCards.map((stat, i) => (
          <Card key={i} className="bg-slate-900/40 border-white/5 backdrop-blur-md border-none shadow-xl">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.title}</p>
                <h3 className="text-3xl font-black text-white">{stat.value}</h3>
              </div>
              <div className={`p-4 ${stat.bg} rounded-2xl ${stat.color} border border-white/5`}>
                <stat.icon size={24} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Aktivitas Hari Ini - VERSI LENGKAP */}
        <Card className="lg:col-span-2 bg-slate-900/40 border-white/5 backdrop-blur-md overflow-hidden border-none shadow-2xl">
          <CardHeader className="border-b border-white/5 bg-white/[0.02]">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Circle size={8} className="fill-blue-500 text-blue-500" /> Aktivitas Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500 border-b border-white/5 text-[10px] uppercase tracking-[0.2em] font-black">
                    <th className="p-5 pl-8">Karyawan / Shift</th>
                    <th className="p-5 text-center">Masuk</th>
                    <th className="p-5 text-center">Pulang</th>
                    <th className="p-5 text-center">Durasi</th>
                    <th className="p-5 text-center">Status</th>
                    <th className="p-5 text-center">Selfie</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {data?.recentActivity?.length > 0 ? (
                    data.recentActivity.map((item: any) => (
                      <tr key={item.id} className="border-b border-white/5 text-slate-300 hover:bg-white/[0.03] transition-all">
                        <td className="p-5 pl-8">
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-base">{item.name}</span>
                            <span className="text-[10px] text-blue-400 font-black uppercase tracking-tighter mt-1">
                              {item.shiftName}
                            </span>
                          </div>
                        </td>
                        <td className="p-5 text-center font-mono font-bold text-blue-400 bg-blue-400/5">
                          {formatTime(item.checkIn)}
                        </td>
                        <td className="p-5 text-center font-mono font-bold text-orange-400">
                          {formatTime(item.checkOut)}
                        </td>
                        <td className="p-5 text-center font-black text-slate-500 text-xs">
                          {calculateDuration(item.checkIn, item.checkOut)}
                        </td>
                        <td className="p-5 text-center">
                          <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.status === 'LATE' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-5 text-center">
                          <div className="flex items-center justify-center -space-x-2">
                            {item.selfieIn && (
                              <div className="group relative">
                                <img src={item.selfieIn} className="w-10 h-10 rounded-full object-cover border-2 border-slate-900 shadow-xl cursor-pointer hover:scale-110 transition-transform" alt="In" />
                                <span className="absolute -top-1 -right-1 bg-blue-600 text-[6px] px-1 rounded-full text-white font-bold">IN</span>
                              </div>
                            )}
                            {item.selfieOut && (
                              <div className="group relative">
                                <img src={item.selfieOut} className="w-10 h-10 rounded-full object-cover border-2 border-slate-900 shadow-xl cursor-pointer hover:scale-110 transition-transform" alt="Out" />
                                <span className="absolute -top-1 -right-1 bg-orange-600 text-[6px] px-1 rounded-full text-white font-bold">OUT</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-20">
                           <LayoutDashboard size={48} />
                           <p className="italic font-medium">Belum ada aktivitas terekam hari ini.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <Card className="border-none bg-gradient-to-br from-blue-600 to-blue-800 shadow-2xl shadow-blue-900/20">
            <CardContent className="p-7">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md text-white">
                  <Camera size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Mode Selfie</h3>
                  <p className="text-blue-100/70 text-xs tracking-tight uppercase font-black">Strict Verification</p>
                </div>
              </div>
              <div className="bg-black/20 p-5 rounded-3xl border border-white/10 flex items-center justify-between">
                <span className="text-xs font-black text-white uppercase tracking-widest">{isSelfieRequired ? 'AKTIF' : 'NON-AKTIF'}</span>
                <Switch checked={isSelfieRequired} onCheckedChange={handleToggleSelfie} className="data-[state=checked]:bg-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md border-none shadow-xl">
            <CardHeader><CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Infrastruktur</CardTitle></CardHeader>
            <CardContent>
              <div className="p-5 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase text-slate-500 font-black mb-1 tracking-widest">Database</p>
                  <p className="text-sm font-bold text-blue-400">LARAGON MYSQL</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> 
                  <span className="text-[9px] font-black text-emerald-500 uppercase">ONLINE</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}