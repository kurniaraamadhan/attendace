import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const attendances = await prisma.attendance.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            // Jika kolom department belum kamu buat di schema, 
            // hapus baris di bawah ini agar tidak error.
            // department: true, 
          }
        }
      }
    });

    // Jika data kosong, kembalikan array kosong dengan status 200
    return NextResponse.json(attendances || []);
    
  } catch (error: any) {
    console.error("RECENT_ATTENDANCE_ERROR:", error);
    // Tambahkan pesan error agar kamu mudah debug di terminal
    return NextResponse.json({ 
      success: false, 
      message: "Gagal mengambil data terbaru",
      error: error.message 
    }, { status: 500 });
  }
}