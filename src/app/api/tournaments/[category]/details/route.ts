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

// Cache en mémoire pour les données par catégorie
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

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

    // Vérifier le cache
    const cacheKey = `category-${mappedCategory}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
          'X-Cache': 'HIT'
        }
      });
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

    // Mettre en cache
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    console.log(`✅ Données récupérées avec succès pour la catégorie : ${mappedCategory}`);

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        'X-Cache': 'MISS'
      }
    });
  } catch (error: any) {
    console.error("❌ Erreur lors de la récupération des données :", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
