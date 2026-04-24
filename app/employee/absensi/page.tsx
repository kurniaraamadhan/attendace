"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { 
  Camera, MapPin, CheckCircle2, AlertCircle, 
  Smartphone, LogOut, Clock, LayoutDashboard, 
  History, User, BellRing 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function EmployeeAbsensi() {
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSelfieRequired, setIsSelfieRequired] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [isMobile, setIsMobile] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  
  const [activeShift, setActiveShift] = useState<any>(null);
  const [isOffDay, setIsOffDay] = useState(false);
  const [attendanceType, setAttendanceType] = useState<"IN" | "OUT">("IN");
  const [hasCheckedOut, setHasCheckedOut] = useState(false);

  const webcamRef = useRef<Webcam>(null);

  const loadInitialData = async (user: any) => {
    try {
      const settingsRes = await fetch("/api/admin/settings");
      const settingsData = await settingsRes.json();
      if (settingsData) setIsSelfieRequired(settingsData.isSelfieRequired);

      const statusRes = await fetch(`/api/attendance/status?userId=${user.id}`);
      const statusData = await statusRes.json();
      
      setActiveShift(statusData.activeShift);
      setIsOffDay(statusData.isOffDay);

      if (statusData.exists) {
        if (statusData.checkOut) {
          setHasCheckedOut(true);
        } else {
          setAttendanceType("OUT");
        }
      }
    } catch (err) {
      console.error("Gagal memuat data status:", err);
    }
  };

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (!session) {
      window.location.href = "/";
      return;
    }
    const user = JSON.parse(session);
    setUserData(user);

    const mobileCheck = /Mobi|Android|iPhone/i.test(navigator.userAgent);
    setIsMobile(mobileCheck);

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    loadInitialData(user);

    return () => clearInterval(timer);
  }, []);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImgSrc(imageSrc);
      setIsCameraOpen(false);
    }
  }, [webcamRef]);

  const handleAbsen = async () => {
    if (isSelfieRequired && !imgSrc) {
      alert("Wajib mengambil foto selfie!");
      return;
    }

    setStatus("loading");
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.id,
          selfieUrl: imgSrc,
          type: attendanceType,
          shiftId: activeShift?.id 
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus("success");
        setImgSrc(null);
        setTimeout(() => {
          if (attendanceType === "IN") {
            setAttendanceType("OUT");
            setStatus("idle");
          } else {
            setHasCheckedOut(true);
            setStatus("idle");
          }
        }, 2000);
      } else {
        alert("Gagal: " + result.error);
        setStatus("idle");
      }
    } catch (err) {
      alert("Kesalahan koneksi.");
      setStatus("idle");
    }
  };

  if (!isMobile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center text-white font-sans">
        <div className="max-w-sm space-y-6">
          <Smartphone size={64} className="mx-auto text-rose-500 mb-4" />
          <h2 className="text-2xl font-black italic tracking-tighter uppercase">Device Restricted</h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest leading-loose">Harap gunakan perangkat Smartphone untuk melakukan presensi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-4 pb-32 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-8 pt-4 px-2">
        <div>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Digital Presence</p>
          <h1 className="text-xl font-black text-white tracking-tight">{userData?.name || "Karyawan"}</h1>
        </div>
        <div className="relative p-2 bg-white/5 rounded-2xl border border-white/10 group active:scale-95 transition-all">
           <BellRing size={20} className="text-blue-400" />
           <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#020617] animate-pulse" />
        </div>
      </div>

      <Card className="w-full max-w-md border-white/10 shadow-2xl rounded-[3rem] overflow-hidden bg-slate-900/40 backdrop-blur-md">
        {/* Time Display - COMPACT & RAMPING */}
<div className={`mt-2 mx-4 rounded-[2.5rem] py-6 text-white text-center bg-gradient-to-br transition-all duration-700 shadow-2xl ${isOffDay ? 'from-slate-800 to-slate-950' : attendanceType === 'IN' ? 'from-blue-600 to-indigo-800' : 'from-orange-500 to-rose-700'}`}>
  <p className="text-[9px] font-black opacity-50 mb-3 uppercase tracking-[0.3em]">
    {currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
  </p>
  
  <div className="flex items-center justify-center gap-2 mb-4">
    {/* Kotak Jam - Lebih Ramping */}
    <div className="bg-white/10 backdrop-blur-md rounded-2xl w-14 h-16 flex items-center justify-center border border-white/10 shadow-lg">
      <h2 className="text-3xl font-black italic tracking-tighter">
        {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit' })}
      </h2>
    </div>

    <span className="text-xl font-black animate-pulse opacity-30">:</span>

    {/* Kotak Menit - Lebih Ramping */}
    <div className="bg-white/10 backdrop-blur-md rounded-2xl w-14 h-16 flex items-center justify-center border border-white/10 shadow-lg">
      <h2 className="text-3xl font-black italic tracking-tighter">
        {currentTime.toLocaleTimeString('id-ID', { minute: '2-digit' })}
      </h2>
    </div>
  </div>
  
  <div className="inline-flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full border border-white/5">
    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
    <span className="text-[7px] font-black tracking-[0.2em] opacity-70 uppercase">LIVE CONNECTION</span>
  </div>
</div>

        <CardContent className="p-8 space-y-6">
          {/* Shift Details */}
          <div className={`p-5 rounded-3xl border transition-all ${isOffDay ? 'bg-rose-500/5 border-rose-500/20' : 'bg-white/5 border-white/10'}`}>
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${isOffDay ? 'bg-rose-500/20' : 'bg-blue-500/20'}`}>
                    <Clock size={20} className={isOffDay ? 'text-rose-500' : 'text-blue-400'} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest">Shift Sekarang</p>
                    <p className="text-sm font-black text-white uppercase tracking-tighter">{isOffDay ? "LIBUR" : activeShift?.name}</p>
                  </div>
                </div>
                {!isOffDay && (
                  <div className="text-right">
                    <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest">Batas Absen</p>
                    <p className="text-sm font-black text-emerald-400">{activeShift?.endIn} WIB</p>
                  </div>
                )}
             </div>
          </div>

          <div className="flex items-center gap-5 p-5 bg-white/5 rounded-3xl border border-white/5">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
               <MapPin size={22} />
            </div>
            <div>
              <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest">Lokasi Presensi</p>
              <p className="text-sm font-black text-slate-200 uppercase tracking-tighter italic">Area Jaringan Kantor</p>
            </div>
          </div>

          {/* Selfie Box */}
          {!hasCheckedOut && isSelfieRequired && !isOffDay && (
            <div className="space-y-4">
              {!imgSrc ? (
                <div className="aspect-square bg-black/20 rounded-[2.5rem] flex flex-col items-center justify-center border-2 border-dashed border-white/10 relative overflow-hidden group transition-all">
                  {isCameraOpen ? (
                    <>
                      <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="absolute inset-0 w-full h-full object-cover" videoConstraints={{ facingMode: "user" }} />
                      <Button onClick={capture} className="absolute bottom-6 bg-white text-blue-600 rounded-2xl px-10 font-black shadow-2xl hover:scale-105 transition-transform">CAPTURE</Button>
                    </>
                  ) : (
                    <Button variant="ghost" onClick={() => setIsCameraOpen(true)} className="flex flex-col h-auto p-12 gap-4 text-slate-600 hover:text-white transition-all">
                      <Camera size={48} strokeWidth={1.5} />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Buka Kamera</span>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-blue-500 shadow-2xl shadow-blue-500/20">
                  <img src={imgSrc} alt="Selfie" className="w-full aspect-square object-cover" />
                  <Button variant="destructive" size="sm" onClick={() => setImgSrc(null)} className="absolute top-5 right-5 rounded-2xl h-12 w-12 p-0 shadow-2xl font-bold text-xl active:scale-90">×</Button>
                </div>
              )}
            </div>
          )}

          {status === "success" ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2.5rem] flex flex-col items-center gap-3 text-emerald-500 animate-in zoom-in-90 duration-500">
              <CheckCircle2 size={56} className="animate-bounce" />
              <p className="font-black text-xs uppercase tracking-[0.3em]">Presensi Berhasil</p>
            </div>
          ) : (
            <Button 
              onClick={handleAbsen}
              disabled={status === "loading" || hasCheckedOut || isOffDay}
              className={`w-full h-20 text-xl font-black rounded-[2rem] shadow-2xl transition-all active:scale-95 ${
                isOffDay ? "bg-slate-800 text-slate-600 border border-white/5" : 
                attendanceType === "IN" ? "bg-blue-600 hover:bg-blue-700 shadow-blue-900/40" : "bg-orange-600 hover:bg-orange-700 shadow-orange-900/40"
              } text-white tracking-[0.2em] uppercase`}
            >
              {isOffDay ? "CLOSED" : status === "loading" ? "SAVING..." : hasCheckedOut ? "COMPLETED" : `ABSEN ${attendanceType}`}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* FLOATING BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-8 w-[92%] max-w-md bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-3 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50">
        
        <Link href="/employee/dashboard" className={`flex flex-col items-center flex-1 transition-all ${pathname.includes('dashboard') ? 'text-blue-500' : 'text-slate-500'}`}>
          <div className={`p-2 rounded-2xl transition-all ${pathname.includes('dashboard') ? 'bg-blue-500/10 scale-110' : ''}`}>
            <LayoutDashboard size={20} />
          </div>
          <span className="text-[8px] font-black mt-1 uppercase tracking-widest">Home</span>
        </Link>

        <Link href="/employee/history" className={`flex flex-col items-center flex-1 transition-all ${pathname.includes('history') ? 'text-blue-500' : 'text-slate-500'}`}>
          <div className={`p-2 rounded-2xl transition-all ${pathname.includes('history') ? 'bg-blue-500/10 scale-110' : ''}`}>
            <History size={20} />
          </div>
          <span className="text-[8px] font-black mt-1 uppercase tracking-widest">History</span>
        </Link>

        {/* Floating Absen Action */}
        <Link href="/employee/absensi" className="relative -mt-16 flex flex-col items-center">
          <div className={`p-5 rounded-full border-[6px] border-[#020617] shadow-2xl transition-all active:scale-90 ${pathname.includes('absensi') ? 'bg-blue-600 text-white shadow-blue-600/40' : 'bg-slate-800 text-slate-400'}`}>
            <Camera size={30} strokeWidth={3} />
          </div>
          <span className={`text-[8px] font-black mt-2 uppercase tracking-widest ${pathname.includes('absensi') ? 'text-blue-500' : 'text-slate-500'}`}>Absen</span>
        </Link>

        <Link href="/employee/permission" className={`flex flex-col items-center flex-1 transition-all ${pathname.includes('permission') ? 'text-blue-500' : 'text-slate-500'}`}>
          <div className={`p-2 rounded-2xl transition-all ${pathname.includes('permission') ? 'bg-blue-500/10 scale-110' : ''}`}>
            <AlertCircle size={20} />
          </div>
          <span className="text-[8px] font-black mt-1 uppercase tracking-widest">Izin</span>
        </Link>

        <Link href="/employee/profile" className={`flex flex-col items-center flex-1 transition-all ${pathname.includes('profile') ? 'text-blue-500' : 'text-slate-500'}`}>
          <div className={`p-2 rounded-2xl transition-all ${pathname.includes('profile') ? 'bg-blue-500/10 scale-110' : ''}`}>
            <User size={20} />
          </div>
          <span className="text-[8px] font-black mt-1 uppercase tracking-widest">Profile</span>
        </Link>

      </div>
    </div>
  );
}