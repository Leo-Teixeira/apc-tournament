import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, trimesterNumber, category } = body;

    if (
      typeof userId !== "number" ||
      ![1, 2, 3].includes(trimesterNumber) ||
      typeof category !== "string" ||
      category.trim() === ""
    ) {
      return NextResponse.json(
        { error: "Invalid userId, trimesterNumber or category" },
        { status: 400 }
      );
    }

    // Récupérer la saison en cours
    const currentSeason = await prisma.season.findFirst({
      where: { status: "in_progress" },
    });

    if (!currentSeason) {
      return NextResponse.json({ error: "Current season not found" }, { status: 400 });
    }

    // Récupérer le trimestre correspondant dans la saison courante
    const trimester = await prisma.trimester.findFirst({
      where: {
        number: trimesterNumber,
        season_id: currentSeason.id,
      },
    });

    if (!trimester) {
      return NextResponse.json(
        { error: "Trimester not found for current season" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.wp_users.findUnique({
      where: { ID: BigInt(userId) },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    // Créer une entrée repechage avec la catégorie
    const repechageEntry = await prisma.repechage.create({
      data: {
        trimester_id: trimester.id,
        user_id: BigInt(userId),
        category: category.trim(),
      },
    });

    return NextResponse.json(serializeBigInt(repechageEntry));
  } catch (err) {
    console.error("Error creating repechage entry:", err);
    return NextResponse.json({ error: "Failed to create repechage entry" }, { status: 500 });
  }
}