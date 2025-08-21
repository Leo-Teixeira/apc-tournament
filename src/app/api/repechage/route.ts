import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

export async function POST(req: any) {
  try {
    const body = await req.json();
    const { userId, trimesterNumber, category } = body;

    if (
      typeof userId !== "number" ||
      ![1, 2, 3].includes(trimesterNumber) ||
      typeof category !== "string" ||
      category.trim() === ""
    ) {
      return new Response(JSON.stringify({ error: "Invalid userId, trimesterNumber or category" }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }

    const currentSeason = await prisma.season.findFirst({
      where: { status: "in_progress" },
    });

    if (!currentSeason) {
      return new Response(JSON.stringify({ error: "Current season not found" }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }

    const trimester = await prisma.trimester.findFirst({
      where: {
        number: trimesterNumber,
        season_id: currentSeason.id,
      },
    });

    if (!trimester) {
      return new Response(JSON.stringify({ error: "Trimester not found for current season" }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }

    const user = await prisma.wp_users.findUnique({
      where: { ID: BigInt(userId) },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }

    const repechageEntry = await prisma.repechage.create({
      data: {
        trimester_id: trimester.id,
        user_id: BigInt(userId),
        category: category.trim(),
      },
    });

    return new Response(JSON.stringify(serializeBigInt(repechageEntry)), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });

  } catch (err) {
    console.error("Error creating repechage entry:", err);
    return new Response(JSON.stringify({ error: "Failed to create repechage entry" }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
}
