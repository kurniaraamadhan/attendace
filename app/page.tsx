"use client";

import React, { useState } from "react";
import { Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Gunakan state biasa (paling aman untuk sinkronisasi input di mobile)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Stop reload halaman
    e.stopPropagation();

    if (!email || !password) {
      setError("Email dan password wajib diisi");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("user_session", JSON.stringify(data.user));
        
        // Gunakan path absolut "/" agar tidak tersesat di mobile
        const destination = data.user.role === "ADMIN" ? "/admin/dashboard" : "/employee/absensi";
        window.location.replace(destination);
      } else {
        setError(data.error || "Email atau Password salah");
      }
    } catch (err) {
      setError("Gagal terhubung ke server. Cek koneksi internet.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent_50%)] pointer-events-none" />

      <Card className="w-full max-w-md border-white/10 bg-slate-900/40 backdrop-blur-md text-white shadow-2xl relative z-50">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Lock className="text-white" size={28} />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Presensi Login</CardTitle>
          <CardDescription className="text-slate-400">Silahkan login untuk masuk ke sistem</CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl mb-6 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 z-10 pointer-events-none" size={18} />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Karyawan"
                  className="pl-10 bg-white/5 border-white/10 text-white h-12 focus:border-blue-500 focus:ring-0 relative z-0" 
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative flex items-center">
                {/* Ikon Gembok */}
                <Lock className="absolute left-3 text-slate-500 z-30 pointer-events-none" size={18} />
                
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  // Tambahkan pr-14 agar teks tidak menabrak tombol mata
                  className="pl-10 pr-14 bg-white/5 border-white/10 text-white h-12 focus:border-blue-500 relative z-10" 
                  required
                />

                {/* TOMBOL MATA: Area klik diperbesar khusus untuk Mobile */}
                <button
                  type="button"
                  // Gunakan onPointerDown agar lebih responsif di layar sentuh dibanding onClick
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowPassword(!showPassword);
                  }}
                  className="absolute right-0 top-0 h-full w-14 flex items-center justify-center z-50 active:scale-90 transition-transform"
                  style={{ touchAction: "manipulation" }} // Mencegah zoom saat klik berkali-kali
                >
                  {showPassword ? (
                    <EyeOff size={22} className="text-slate-400" />
                  ) : (
                    <Eye size={22} className="text-slate-400" />
                  )}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 rounded-xl shadow-lg relative z-10 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Memverifikasi...</span>
                </div>
              ) : (
                "Masuk Ke Sistem"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}