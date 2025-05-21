import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  let tournamentId: bigint;
  try {
    tournamentId = BigInt(id);
  } catch {
    return NextResponse.json(
      { error: "Invalid tournament ID" },
      { status: 400 }
    );
  }

  try {
    const [tournament, levels, tables, registrations, rankings, stacks] =
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
          where: { tournament_id: BigInt(id) },
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

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      serializeBigInt({
        tournament: {
          ...tournament,
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
