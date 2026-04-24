import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1. Cari user di database
    const user = await prisma.user.findUnique({ 
      where: { email } 
    });

    // 2. Validasi (Sederhana, pastikan nanti pakai hashing seperti bcrypt ya!)
    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: "Email atau Password salah" }, 
        { status: 401 }
      );
    }

    // 3. Buat Response
    const response = NextResponse.json({
      success: true,
      user: { 
        id: user.id, 
        name: user.name, 
        role: user.role 
      }
    });

    // 4. Set Cookie di Sisi Server (Agar Middleware Bisa Baca)
    // Menggunakan await cookies() sesuai standar Next.js terbaru
    const cookieStore = await cookies();
    
    cookieStore.set("user_role", user.role, {
      httpOnly: true, // Proteksi dari XSS (Javascript tidak bisa baca ini)
      secure: process.env.NODE_ENV === "production", // Hanya HTTPS di production
      maxAge: 60 * 60 * 24, // 1 Hari
      path: "/",
      sameSite: "lax", // Mendukung redirect antar halaman/mobile
    });

    // Set cookie tambahan untuk identitas (Opsional)
    cookieStore.set("is_logged_in", "true", {
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" }, 
      { status: 500 }
    );
  }
}