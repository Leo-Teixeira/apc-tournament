import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const token =
    url.searchParams.get("token") || request.cookies.get("admin_token")?.value;

  console.log("🔍 Middleware triggered");
  console.log("Token reçu :", token);

  if (!token) {
    console.warn("❌ Aucun token fourni");
    return NextResponse.redirect(new URL("/error/unauthorized", url));
  }

  try {
    const res = await fetch(
      "https://aqua-bat-544144.hostingersite.com/wp-json/custom/validate-token",
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log("✅ Appel à /validate-token terminé :", res.status);

    if (!res.ok) {
      console.warn("❌ Token invalide ou expiré");
      return NextResponse.redirect(new URL("/error/unauthorized", url));
    }

    const response = NextResponse.next();

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: true,
      path: "/"
      // pas de maxAge → cookie persistant (jusqu'à fermeture du navigateur ou suppression manuelle)
    });

    console.log("✅ Middleware accepté, cookie défini");
    return response;
  } catch (error) {
    console.error("🔥 Erreur dans middleware :", error);
    return NextResponse.redirect(new URL("/error/unauthorized", url));
  }
}

export const config = {
  matcher: ["/((?!unauthorized|_next|favicon.ico).*)"]
}; 
