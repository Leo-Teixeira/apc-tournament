import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";
import { tournament_tournament_category } from "@/generated/prisma";
import { extractParamsFromPath } from "@/app/utils/api-params";

const categoryMap: Record<string, tournament_tournament_category> = {
  apt: tournament_tournament_category.APT,
  ag: tournament_tournament_category.SPECIAUX,
  sitandgo: tournament_tournament_category.SITANDGO,
  superfinale: tournament_tournament_category.SUPERFINALE,
  solipoker: tournament_tournament_category.SOLIPOKER
};

export async function GET(req: NextRequest) {
  try {
    const tournaments = extractParamsFromPath(req, ["tournaments"]);
    const categoryParam = tournaments.tournaments;
    const normalizedCategory = categoryParam?.toLowerCase() ?? "";
    const mappedCategory = categoryMap[normalizedCategory];

    if (!mappedCategory) {
      console.warn(`⚠️ Catégorie invalide reçue : '${categoryParam}'`);
      return NextResponse.json(
        { error: `Invalid category '${categoryParam}'` },
        { status: 400 }
      );
    }

    // Optimisation : Requête unique avec toutes les relations
    const result = await prisma.tournament.findMany({
      where: { tournament_category: mappedCategory },
      include: {
        registration: {
          include: {
            wp_users: {
              select: {
                ID: true,
                pseudo_winamax: true,
                display_name: true,
                user_email: true
              }
            }
          }
        },
        quarter_ranking: {
          include: {
            wp_users: {
              select: {
                ID: true,
                pseudo_winamax: true,
                display_name: true,
                user_email: true
              }
            }
          }
        }
      }
    });

    // Séparer les données
    const tournamentss = result;
    const registrations = result.flatMap(t => t.registration);
    const quarterRanking = result.flatMap(t => t.quarter_ranking);

    const responseData = serializeBigInt({ tournamentss, registrations, quarterRanking });


    console.log(`✅ Données récupérées avec succès pour la catégorie : ${mappedCategory}`);

    return NextResponse.json(responseData, {
    });
  } catch (error: any) {
    console.error("❌ Erreur lors de la récupération des données :", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
