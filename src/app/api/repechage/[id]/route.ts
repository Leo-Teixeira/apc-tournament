import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const idNum = Number(id);
  if (isNaN(idNum)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
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
