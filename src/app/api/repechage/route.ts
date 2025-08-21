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
    console.log("Received body:", body);  // Log de l'entrée

    const { userId, trimesterNumber, category } = body;
    console.log("Parsed inputs:", { userId, trimesterNumber, category });

    const currentSeason = await prisma.season.findFirst({
      where: { status: "in_progress" },
    });
    console.log("Current season:", currentSeason);

    if (!currentSeason) {
      console.log("No current season found");
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
    console.log("Found trimester:", trimester);

    if (!trimester) {
      console.log("No trimester found for current season");
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
    console.log("Found user:", user);

    if (!user) {
      console.log(`User with ID ${userId} not found`);
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
    console.log("Created repechage entry:", repechageEntry);

    return new Response(JSON.stringify(serializeBigInt(repechageEntry)), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });

  } catch (err) {
    console.error("Error during repechage creation:", err);
    return new Response(JSON.stringify({ error: "Failed to create repechage entry" }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
}
