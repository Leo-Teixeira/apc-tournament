import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";
import { extractParamsFromPath } from "@/app/utils/api-params";

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

  try {
    const [tournamentData, levels, tables, registrations, rankings, stacks] =
      await Promise.all([
        prisma.tournament.findUnique({
          where: { id: tournamentId },
          include: {
            stack: {
              include: {
                stack_chip: {
                  include: { chip: true }
                }
              }
            }
          }
        }),

        prisma.tournament_level.findMany({
          where: { tournament_id: tournamentId }
        }),

        prisma.tournament_table.findMany({
          where: { tournament_id: tournamentId }
        }),

        prisma.registration.findMany({
          where: { tournament_id: tournamentId },
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
            table_assignment: true
          }
        }),

        prisma.tournament_ranking.findMany({
          where: { tournament_id: tournamentId },
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
        }),

        prisma.stack.findMany({
          include: {
            stack_chip: {
              include: {
                chip: true
              }
            }
          }
        })
      ]);

    if (!tournamentData) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      serializeBigInt({
        tournament: {
          ...tournamentData,
          tournament_level: levels,
          tournament_table: tables,
          registration: registrations,
          tournament_ranking: rankings
        },
        registrations,
        classement: rankings,
        stacks
      })
    );
  } catch (error) {
    console.error("Error fetching tournament details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
