import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Buat User ADMIN
    await prisma.user.upsert({
      where: { email: 'admin@absensi.com' },
      update: {},
      create: {
        email: 'admin@absensi.com',
        name: 'Kurnia Admin',
        password: 'admin123',
        role: 'ADMIN',
        department: 'IT'
      },
    });

    // 2. Buat User EMPLOYEE (Karyawan) untuk Testing
    await prisma.user.upsert({
      where: { email: 'karyawan@absensi.com' },
      update: {},
      create: {
        email: 'karyawan@absensi.com',
        name: 'Budi Setiawan',
        password: 'user123',
        role: 'EMPLOYEE',
        department: 'Operasional'
      },
    });

    // 3. Pastikan Setting Default Ada
    await prisma.systemSetting.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        isSelfieRequired: true,
        officeStartTime: "08:00",
        officeEndTime: "17:00",
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Data Admin & Karyawan Berhasil Dibuat!" 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}