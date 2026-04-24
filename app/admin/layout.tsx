"use client";

import React from "react";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  FileBarChart, 
  ClipboardCheck, 
  Settings, 
  LogOut,
  ChevronRight,
  Clock
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const handleLogout = () => {
    document.cookie = "user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("user_session");
    window.location.href = "/";
  };

  const menuItems = [
    { 
      group: "Utama",
      items: [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Plotting Jadwal", href: "/admin/schedules", icon: CalendarDays },
      ]
    },
    {
      group: "Manajemen",
      items: [
        { name: "Data Karyawan", href: "/admin/employees", icon: Users },
        { name: "Shift Master", href: "/admin/shifts", icon: Clock },
        { name: "Pengajuan Izin", href: "/admin/permissions", icon: ClipboardCheck },
      ]
    },
    {
      group: "Laporan",
      items: [
        { name: "Rekap Bulanan", href: "/admin/reports", icon: FileBarChart },
        { name: "Pengaturan", href: "/admin/settings", icon: Settings },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/30 border-r border-white/5 flex flex-col justify-between hidden md:flex backdrop-blur-xl sticky top-0 h-screen z-50">
        <div className="p-6">
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <LayoutDashboard size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tighter text-white italic">AbsensiPro</h1>
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Administrator</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-8">
            {menuItems.map((group, idx) => (
              <div key={idx} className="space-y-3">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-4">
                  {group.group}
                </p>
                <nav className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link 
                        key={item.href}
                        href={item.href}
                        className={`group flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 ${
                          isActive 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon size={18} className={isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400"} />
                          <span className="text-sm font-bold tracking-tight">{item.name}</span>
                        </div>
                        {isActive && <ChevronRight size={14} className="animate-pulse" />}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* User Profile / Logout */}
        <div className="p-6 border-t border-white/5 bg-black/20">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-4 rounded-2xl text-rose-400 font-black text-xs uppercase tracking-widest hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
          >
            <LogOut size={18} /> Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}