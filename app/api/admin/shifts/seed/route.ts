import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const masterShifts = [
      { 
        name: "Pagi Panjang Manajemen", 
        startIn: "07:15", endIn: "07:30", 
        startOut: "16:00", endOut: "17:00", 
        workDays: "1,2,3,4,5" // Senin - Jumat
      },
      { 
        name: "Pagi Panjang Umum", 
        startIn: "07:30", endIn: "07:45", 
        startOut: "14:30", endOut: "16:00", 
        workDays: "1,2,3,4,5,6" // Senin - Sabtu
      },
      { 
        name: "Shift Pagi (2 Hari)", 
        startIn: "06:45", endIn: "07:00", 
        startOut: "14:00", endOut: "15:00",
        workDays: null // Rolling
      },
      { 
        name: "Shift Siang", 
        startIn: "13:30", endIn: "14:00", 
        startOut: "21:00", endOut: "21:30",
        workDays: null // Rolling
      },
      { 
        name: "Shift Malam", 
        startIn: "20:30", endIn: "21:00", 
        startOut: "07:00", endOut: "07:30",
        workDays: null // Rolling (Lintas Hari)
      },
    ];

    // Gunakan upsert agar jika di-refresh tidak duplikat
    for (const shift of masterShifts) {
      await prisma.shift.upsert({
        where: { id: shift.name }, // Kita gunakan nama sebagai ID sementara untuk seed
        update: shift,
        create: { ...shift, id: undefined },
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "5 Master Shift berhasil diatur ke database." 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}