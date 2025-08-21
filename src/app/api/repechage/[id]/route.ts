import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractParamsFromPath } from "@/app/utils/api-params";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { idStr } = extractParamsFromPath(req, ["id"]);
    if (!idStr) {
      return NextResponse.json({ error: "Missing repechage id" }, { status: 400 });
    }

    const idNum = Number(idStr);
    if (isNaN(idNum)) {
      return NextResponse.json({ error: "Invalid repechage id" }, { status: 400 });
    }

    // Vérifier si l'entrée repechage existe
    const repechageEntry = await prisma.repechage.findUnique({
      where: { id: BigInt(idNum) },
    });

    if (!repechageEntry) {
      return NextResponse.json({ error: "Repechage entry not found" }, { status: 404 });
    }

    // Supprimer l'entrée repechage
    await prisma.repechage.delete({
      where: { id: BigInt(idNum) },
    });

    return NextResponse.json({ success: true, message: "Repechage entry deleted" });
  } catch (error) {
    console.error("Error deleting repechage entry:", error);
    return NextResponse.json({ error: "Failed to delete repechage entry" }, { status: 500 });
  }
}
