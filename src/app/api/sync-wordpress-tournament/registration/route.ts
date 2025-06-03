import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

export async function POST(req: NextRequest) {
  try {
    const {
      wp_post_id,
      user_id,
      statut,
      inscription_date
    }: {
      wp_post_id: number;
      user_id: number;
      statut: "Confirmed" | "Cancelled";
      inscription_date: string;
    } = await req.json();

    const tournament = await prisma.tournament.findFirst({
      where: { wordpress_post_id: wp_post_id }
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournoi non trouvé pour ce post_id WordPress" },
        { status: 404 }
      );
    }

    const existing = await prisma.registration.findFirst({
      where: {
        tournament_id: tournament.id,
        user_id: BigInt(user_id)
      }
    });

    if (existing) {
      const updated = await prisma.registration.update({
        where: { id: existing.id },
        data: { statut }
      });
      return NextResponse.json(serializeBigInt(updated));
    } else {
      const created = await prisma.registration.create({
        data: {
          tournament_id: tournament.id,
          user_id: BigInt(user_id),
          statut,
          inscription_date: new Date(inscription_date)
        }
      });
      return NextResponse.json(serializeBigInt(created));
    }
  } catch (err) {
    console.error("❌ Erreur de sync inscription :", err);
    return NextResponse.json(
      { error: "Erreur interne serveur" },
      { status: 500 }
    );
  }
}
