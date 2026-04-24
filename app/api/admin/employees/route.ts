import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// --- FUNGSI OTOMATIS: GENERATE JADWAL BULAN BERJALAN ---
async function autoGenerateSchedule(userId: string, workType: string) {
  const now = new Date();
  const year = now.getFullYear();
  const monthIdx = now.getMonth() + 1; // Bulan saat ini (1-12)
  const daysInMonth = new Date(year, monthIdx, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    // Gunakan jam 7 pagi agar aman dari pergeseran zona waktu database
    const date = new Date(year, monthIdx - 1, day, 7, 0, 0, 0);
    const dayOfWeek = date.getDay(); // 0: Minggu, 5: Jumat, 6: Sabtu

    let shiftData = null;

    if (workType === "5HK") {
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        shiftData = {
          name: dayOfWeek === 5 ? "PAGI 5HK (JUMAT)" : "PAGI 5HK (NORMAL)",
          startIn: "07:00", endIn: "07:30",
          startOut: dayOfWeek === 5 ? "16:30" : "16:00",
          endOut: dayOfWeek === 5 ? "17:30" : "17:00"
        };
      }
    } else if (workType === "6HK") {
      if (dayOfWeek >= 1 && dayOfWeek <= 6) {
        let jamPulang = "14:00";
        let nama = "PAGI 6HK (NORMAL)";
        if (dayOfWeek === 5) { jamPulang = "11:30"; nama = "PAGI 6HK (JUMAT)"; }
        else if (dayOfWeek === 6) { jamPulang = "13:00"; nama = "PAGI 6HK (SABTU)"; }

        shiftData = {
          name: nama,
          startIn: "07:00", endIn: "07:30",
          startOut: jamPulang,
          endOut: (parseInt(jamPulang.split(':')[0]) + 1) + ":00"
        };
      }
    }

    if (shiftData) {
      // Upsert Shift Master agar ID tersedia
      const shift = await prisma.shift.upsert({
        where: { name: shiftData.name },
        update: {},
        create: shiftData
      });

      // Buat jadwal untuk user tersebut
      await prisma.userSchedule.create({
        data: {
          userId,
          shiftId: shift.id,
          date
        }
      });
    }
  }
}

// GET: Ambil semua daftar karyawan
export async function GET() {
  try {
    const employees = await prisma.user.findMany({
      where: { role: "EMPLOYEE" },
      include: { defaultShift: true },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(employees);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

// POST: Tambah karyawan baru + Auto Schedule
export async function POST(req: Request) {
  try {
    const { name, email, password, workType, defaultShiftId } = await req.json();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar!" }, { status: 400 });
    }

    // 1. Simpan User Baru
    const newUser = await prisma.user.create({
      data: { 
        name, 
        email, 
        password, 
        role: "EMPLOYEE",
        workType: workType || "6HK",
        defaultShiftId: defaultShiftId || null
      }
    });

    // 2. OTOMATISASI: Jalankan generator jadwal untuk user ini
    console.log(`== [AUTO GENERATE] == Creating schedule for ${name}`);
    await autoGenerateSchedule(newUser.id, newUser.workType);

    return NextResponse.json(newUser);
  } catch (error: any) {
    console.error("POST ERROR:", error.message);
    return NextResponse.json({ error: "Gagal menambah karyawan" }, { status: 500 });
  }
}

// DELETE: Hapus karyawan
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID dibutuhkan" }, { status: 400 });

    // PENTING: Hapus dulu jadwalnya sebelum hapus usernya
    await prisma.userSchedule.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus (User mungkin punya data absen)" }, { status: 500 });
  }
}

// PATCH: Update data karyawan
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, name, email, password, workType, defaultShiftId } = body;

    if (!id) return NextResponse.json({ error: "ID Missing" }, { status: 400 });

    const updated = await prisma.user.update({
      where: { id },
      data: { 
        name, 
        email, 
        password, 
        workType: workType, 
        defaultShiftId: defaultShiftId || null 
      }
    });
    
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}