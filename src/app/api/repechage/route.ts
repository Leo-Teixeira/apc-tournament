import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

function defaultHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
    "X-PNonce": crypto.randomUUID(),
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Access-Control-Allow-Credentials": "true",
  };
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      ...defaultHeaders(),
      "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,X-WP-Nonce" // ajoutez autres headers si besoin
    }
  });
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received body:", body);

    const { userId, trimesterNumber, category } = body;

    const currentSeason = await prisma.season.findFirst({
      where: { status: "in_progress" },
    });

    if (!currentSeason) {
      return new Response(JSON.stringify({ error: "Current season not found" }), {
        status: 400,
        headers: { ...defaultHeaders() }
      });
    }

    const user = await prisma.wp_users.findUnique({
      where: { ID: BigInt(userId) },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 400,
        headers: { ...defaultHeaders() }
      });
    }

    const repechageEntry = await prisma.repechage.create({
      data: {
        trimester_id: trimesterNumber,
        user_id: BigInt(userId),
        category: category.trim(),
      },
    });

    return new Response(JSON.stringify(serializeBigInt(repechageEntry)), {
      status: 200,
      headers: { ...defaultHeaders() }
    });

  } catch (err) {
    console.error("Error during repechage creation:", err);
    return new Response(JSON.stringify({ error: "Failed to create repechage entry" }), {
      status: 500,
      headers: { ...defaultHeaders() }
    });
  }
}
