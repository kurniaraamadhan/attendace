import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const setting = await prisma.systemSetting.findFirst();
    
    // Kirim response dengan header no-cache agar browser selalu ambil data terbaru
    return NextResponse.json(setting, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { isSelfieRequired } = await req.json();
    const updated = await prisma.systemSetting.update({
      where: { id: 1 },
      data: { isSelfieRequired }
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Gagal update" }, { status: 500 });
  }
}