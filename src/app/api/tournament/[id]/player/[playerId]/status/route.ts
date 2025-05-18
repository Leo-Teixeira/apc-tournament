import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; playerId: string } }
) {
  try {
    const tournamentId = parseInt(params.id);
    const playerId = parseInt(params.playerId);
    const body = await req.json();
    const { newStatus } = body;

    console.log("📥 Requête reçue pour mise à jour du statut");
    console.log("→ params.id:", params.id);
    console.log("→ params.playerId:", params.playerId);
    console.log("→ tournamentId (parsed):", tournamentId);
    console.log("→ playerId (parsed):", playerId);
    console.log("→ newStatus:", newStatus);
    console.log("→ body complet:", body);

    const validStatuses = ["Confirmed", "Pending", "Cancelled"];
    if (
      isNaN(tournamentId) ||
      isNaN(playerId) ||
      !validStatuses.includes(newStatus)
    ) {
      console.warn("⛔ Données invalides pour la mise à jour");
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    console.log("🔍 Recherche de la ligne d'inscription...");

    const updated = await prisma.registration.updateMany({
      where: {
        id: BigInt(playerId),
        tournament_id: BigInt(tournamentId)
      },
      data: {
        statut: newStatus
      }
    });

    console.log("✅ Résultat de updateMany:", updated);

    if (updated.count === 0) {
      console.warn("❌ Aucune inscription trouvée à mettre à jour");
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    console.log(
      `🎉 Statut mis à jour avec succès pour l'utilisateur ${playerId}`
    );
    return NextResponse.json({
      message: `Status updated to ${newStatus} for player ${playerId}`
    });
  } catch (error) {
    console.error("🔥 Erreur lors de la mise à jour du statut :", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
