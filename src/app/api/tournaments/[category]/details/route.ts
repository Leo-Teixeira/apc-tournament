import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";
import { tournament_tournament_category } from "@/generated/prisma";
import { extractParamsFromPath } from "@/app/utils/api-params";

const categoryMap: Record<string, tournament_tournament_category> = {
  apt: tournament_tournament_category.APT,
  ag: tournament_tournament_category.AG,
  sitandgo: tournament_tournament_category.SitAndGo,
  superfinale: tournament_tournament_category.Superfinale,
  solipoker: tournament_tournament_category.Solipoker
};

export async function GET(req: NextRequest) {
  try {
    const tournaments = extractParamsFromPath(req, ["tournaments"]);
    const categoryParam = tournaments.tournaments;
    const normalizedCategory = categoryParam?.toLowerCase() ?? "";
    const mappedCategory = categoryMap[normalizedCategory];

    console.log("📥 Requête reçue :");
    console.log("→ URL path:", req.nextUrl.pathname);
    console.log("→ Paramètre brut 'category':", categoryParam);
    console.log("→ Catégorie normalisée :", normalizedCategory);
    console.log("→ Catégorie mappée :", mappedCategory);

    if (!mappedCategory) {
      console.warn(`⚠️ Catégorie invalide reçue : '${categoryParam}'`);
      return NextResponse.json(
        { error: `Invalid category '${categoryParam}'` },
        { status: 400 }
      );
    }

    const [tournamentss, registrations, quarterRanking] =
      await prisma.$transaction([
        prisma.tournament.findMany({
          where: { tournament_category: mappedCategory }
        }),
        prisma.registration.findMany({
          where: {
            tournament: { tournament_category: mappedCategory }
          },
          include: {
            tournament: true
          }
        }),
        prisma.quarter_ranking.findMany({
          where: {
            tournament: { tournament_category: mappedCategory }
          },
          include: {
            wp_users: {
              select: {
                ID: true,
                pseudo_winamax: true,
                display_name: true,
                user_email: true
              }
            },
            tournament: true
          }
        })
      ]);

    console.log(
      `✅ Données récupérées avec succès pour la catégorie : ${mappedCategory}`
    );

    return NextResponse.json(
      serializeBigInt({ tournamentss, registrations, quarterRanking })
    );
  } catch (error: any) {
    console.error("❌ Erreur lors de la récupération des données :", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
