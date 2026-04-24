import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Mengambil semua daftar izin untuk Admin
export async function GET() {
  try {
    const permissions = await prisma.permission.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(permissions);
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

// PATCH: Menyetujui atau Menolak Izin
export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();

    const updated = await prisma.permission.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Gagal update status" }, { status: 500 });
  }
}