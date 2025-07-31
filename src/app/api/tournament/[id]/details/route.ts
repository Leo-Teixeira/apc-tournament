import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";
import { extractParamsFromPath } from "@/app/utils/api-params";

// Cache en mémoire pour les données statiques
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(req: NextRequest) {
  const { tournament } = extractParamsFromPath(req, ["tournament"]);

  if (!tournament) {
    return NextResponse.json(
      { error: "Missing tournament ID" },
      { status: 400 }
    );
  }

  let tournamentId: bigint;
  try {
    tournamentId = BigInt(tournament);
  } catch {
    return NextResponse.json(
      { error: "Invalid tournament ID" },
      { status: 400 }
    );
  }

  // Vérifier le cache
  const cacheKey = `tournament-${tournamentId}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache': 'HIT'
      }
    });
  }

  try {
    // Optimisation : Requête unique avec toutes les relations
    const tournamentData = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        stack: {
          include: {
            stack_chip: {
              include: {
                chip: true
              }
            }
          }
        },
        tournament_level: true,
        tournament_table: true,
        registration: {
          include: {
            wp_users: {
              select: {
                ID: true,
                pseudo_winamax: true,
                photo_url: true,
                display_name: true,
                user_status: true,
                user_url: true,
                user_email: true,
                user_nicename: true,
                user_login: true
              }
            },
            table_assignment: {
              include: {
                tournament_table: true,
                registration: {
                  include: {
                    wp_users: {
                      select: {
                        ID: true,
                        pseudo_winamax: true,
                        photo_url: true,
                        display_name: true
                      }
                    }
                  }
                }
              }
            },
            tournament_ranking: true
          }
        },
        tournament_ranking: {
          orderBy: { ranking_position: "asc" },
          include: {
            registration: {
              include: {
                wp_users: {
                  select: {
                    ID: true,
                    pseudo_winamax: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!tournamentData) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    // Récupérer les stacks séparément car ils sont statiques
    const stacks = await prisma.stack.findMany({
      include: {
        stack_chip: {
          include: {
            chip: true
          }
        }
      }
    });

    const result = {
      tournament: {
        ...tournamentData,
        tournament_level: tournamentData.tournament_level,
        tournament_table: tournamentData.tournament_table,
        registration: tournamentData.registration,
        tournament_ranking: tournamentData.tournament_ranking
      },
      registrations: tournamentData.registration,
      classement: tournamentData.tournament_ranking,
      stacks
    };

    // Mettre en cache
    cache.set(cacheKey, {
      data: serializeBigInt(result),
      timestamp: Date.now()
    });

    return NextResponse.json(
      serializeBigInt(result),
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Cache': 'MISS'
        }
      }
    );
  } catch (error) {
    console.error("Error fetching tournament details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
