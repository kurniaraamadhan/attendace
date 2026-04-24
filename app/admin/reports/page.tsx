"use client";

import React, { useState, useEffect } from "react";
// PERBAIKAN 1: Import dibersihkan dari duplikasi
import { 
  FileBarChart, 
  Download, 
  AlertCircle, 
  UserCheck, 
  TrendingUp 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MonthlyReport() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [details, setDetails] = useState<any[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?month=${month}`);
      const result = await res.json();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async (user: any) => {
    setSelectedUser(user);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/reports?month=${month}&userId=${user.id}`);
      const result = await res.json();
      setDetails(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month]);

  return (
    <div className="p-8 space-y-8 relative">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Laporan Bulanan Kehadiran Karyawan</h2>
          <p className="text-slate-500 text-sm font-medium">Rekapitulasi performa kehadiran karyawan.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
          <input 
            type="month" 
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-transparent text-white text-sm font-bold p-2 outline-none"
          />
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex gap-2 transition-all">
            <Download size={16} /> <span className="text-xs font-bold uppercase">Export</span>
          </Button>
        </div>
      </div>

      {/* Insight Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-emerald-500/10 border-none shadow-xl">
          <CardContent className="p-6 flex items-center gap-4 text-emerald-400">
            <UserCheck size={32} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Tepat Waktu</p>
              <p className="text-lg font-bold text-white">
                {data.length > 0 ? [...data].sort((a,b) => b.totalOntime - a.totalOntime)[0]?.name : "-"}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-rose-500/10 border-none shadow-xl">
          <CardContent className="p-6 flex items-center gap-4 text-rose-400">
            <AlertCircle size={32} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Sering Terlambat</p>
              <p className="text-lg font-bold text-white">
                {data.length > 0 ? [...data].sort((a,b) => b.totalLate - a.totalLate)[0]?.name : "-"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/10 border-none shadow-xl">
          <CardContent className="p-6 flex items-center gap-4 text-blue-400">
            <TrendingUp size={32} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Rata-rata Kehadiran</p>
              <p className="text-lg font-bold text-white">
                {data.length > 0 ? Math.round(data.reduce((a, b) => a + b.performance, 0) / data.length) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md overflow-hidden rounded-[2rem] border-none shadow-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">
                  <th className="p-6 pl-10">Nama Karyawan</th>
                  <th className="p-6 text-center">Total Kehadiran</th>
                  <th className="p-6 text-center">Tepat Waktu</th>
                  <th className="p-6 text-center">Terlambat</th>
                  <th className="p-6 text-center">Performa Kehadiran</th>
                  <th className="p-6 text-center">Izin/Sakit</th>
                  <th className="p-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {!loading && data.map((row) => (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-6 pl-10 font-bold text-white uppercase tracking-tight">{row.name}</td>
                    <td className="p-6 text-center font-mono text-slate-400">{row.totalHadir} Hari</td>
                    <td className="p-6 text-center font-bold text-emerald-500">{row.totalOntime}</td>
                    <td className="p-6 text-center font-bold text-rose-500">{row.totalLate}</td>
                    <td className="p-6 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`text-[10px] font-black ${row.performance > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {row.performance}%
                        </span>
                        <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className={`h-full transition-all duration-1000 ${row.performance > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                            style={{ width: `${row.performance}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className={`font-bold ${row.totalIzin > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                        {row.totalIzin || 0} Hari
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      {/* PERBAIKAN 2: Menggunakan row, bukan user */}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => fetchDetails(row)}
                        className="text-blue-400 hover:text-white hover:bg-blue-600 font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl border border-blue-400/20 transition-all"
                      >
                        Audit Log
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {loading && <div className="p-20 text-center animate-pulse text-slate-500 font-bold tracking-widest uppercase">Syncing Report...</div>}
        </CardContent>
      </Card>

      {/* Modal Audit Log */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl bg-[#0f172a] border-white/10 max-h-[85vh] overflow-hidden flex flex-col rounded-[2.5rem] shadow-2xl">
            <CardHeader className="border-b border-white/5 p-8 flex flex-row justify-between items-center bg-white/[0.02]">
              <div>
                <CardTitle className="text-2xl font-black text-white italic tracking-tighter uppercase">
                  AUDIT LOG: {selectedUser.name}
                </CardTitle>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Periode {month}</p>
              </div>
              <Button onClick={() => setSelectedUser(null)} variant="ghost" className="text-slate-400 hover:text-white text-3xl font-light hover:bg-transparent">×</Button>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-[#0f172a] z-10 border-b border-white/5">
                  <tr className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                    <th className="p-5 pl-10">Tanggal</th>
                    <th className="p-5">Shift</th>
                    <th className="p-5 text-center">Jam Masuk</th>
                    <th className="p-5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                    {loadingDetail ? (
                        <tr><td colSpan={4} className="p-20 text-center animate-pulse font-bold text-slate-600">Loading...</td></tr>
                    ) : details.length > 0 ? details.map((log: any) => {
                        // Fungsi pengaman untuk parsing tanggal
                        const dateObj = log.checkIn ? new Date(log.checkIn) : null;
                        const isValid = dateObj && !isNaN(dateObj.getTime());

                        return (
                        <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="p-5 pl-10 font-bold text-white">
                            {isValid 
                                ? dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) 
                                : "Data Kosong"}
                            </td>
                            <td className="p-5 uppercase text-[10px] font-black text-blue-400">
                            {log.shift?.name || "N/A"}
                            </td>
                            <td className="p-5 text-center font-mono font-bold text-white shadow-sm">
                                {isValid 
                                ? dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) 
                                : "--:--"}
                            </td>
                            <td className="p-5 text-center text-[9px] font-black uppercase">
                            <span className={log.status === 'LATE' ? 'text-rose-500' : 'text-emerald-500'}>
                                {log.status || "UNKNOWN"}
                            </span>
                            </td>
                        </tr>
                        );
                    }) : (
                        <tr><td colSpan={4} className="p-20 text-center text-slate-600 italic">No data found.</td></tr>
                    )}
                    </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}