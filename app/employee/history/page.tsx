"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Clock, History as HistoryIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AttendanceHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (!session) {
      window.location.href = "/";
      return;
    }
    const user = JSON.parse(session);

    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/attendance/history?userId=${user.id}`);
        const data = await res.json();
        
        // Memastikan mengambil array history dari object response
        if (data && data.history) {
          setHistory(data.history);
        } else if (Array.isArray(data)) {
          setHistory(data);
        }
      } catch (err) {
        console.error("Gagal mengambil riwayat:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatTime = (date: string) => {
    if (!date) return "--:--";
    return new Date(date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", { 
      day: "numeric", 
      month: "short", 
      year: "numeric" 
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pt-4">
        <Button 
          variant="ghost" 
          onClick={() => window.location.href = "/dashboard"} 
          className="text-white p-0 hover:bg-transparent"
        >
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-xl font-bold text-white tracking-tight">Riwayat Kehadiran</h1>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 text-sm font-medium">Memuat riwayat...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="mx-auto w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border border-white/5">
            <Calendar size={32} className="text-slate-700" />
          </div>
          <p className="text-slate-500 text-sm">Belum ada catatan absensi.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item: any) => (
            <Card key={item.id} className="bg-slate-900/40 border-white/5 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${item.status === 'LATE' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-400'}`}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{formatDate(item.createdAt)}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-black tracking-tighter">
                        IN: {formatTime(item.checkIn)}
                      </span>
                      {item.checkOut && (
                        <span className="text-[10px] bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full font-black tracking-tighter">
                          OUT: {formatTime(item.checkOut)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${item.status === 'LATE' ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {item.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}