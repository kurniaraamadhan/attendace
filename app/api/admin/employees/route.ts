import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Ambil semua daftar karyawan
export async function GET() {
  try {
    const employees = await prisma.user.findMany({
      where: { role: "EMPLOYEE" },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(employees);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

// POST: Tambah karyawan baru
export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Cek email duplikat
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar!" }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: { name, email, password, role: "EMPLOYEE" }
    });
    return NextResponse.json(newUser);
  } catch (error) {
    return NextResponse.json({ error: "Gagal menambah karyawan" }, { status: 500 });
  }
}

// DELETE: Hapus karyawan
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID dibutuhkan" }, { status: 400 });

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus (User mungkin punya data absen)" }, { status: 500 });
  }
}