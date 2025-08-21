// À mettre dans src/app/api/repechage/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;  // params est passé automatiquement

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const idNum = Number(id);
    if (isNaN(idNum)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const repechageEntry = await prisma.repechage.findUnique({
      where: { id: BigInt(idNum) },
    });

    if (!repechageEntry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.repechage.delete({
      where: { id: BigInt(idNum) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
