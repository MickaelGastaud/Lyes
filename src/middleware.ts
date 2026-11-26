import { NextResponse, type NextRequest } from "next/server";

/**
 * Protège tout le back-office (/admin) par identifiant et mot de passe.
 * Analogie : un digicode à l'entrée de l'atelier, le showroom (site client) reste ouvert.
 * À remplacer par de vrais comptes utilisateurs avec rôles en V2.
 */
export const config = { matcher: ["/admin/:path*"] };

export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER || "admin";
  const password =
    process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? undefined : "confiauto");

  if (!password) {
    return new NextResponse("Accès administrateur non configuré : définir ADMIN_PASSWORD.", { status: 503 });
  }

  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    const decoded = atob(header.slice(6));
    const sep = decoded.indexOf(":");
    if (decoded.slice(0, sep) === user && decoded.slice(sep + 1) === password) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentification requise.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Back-office", charset="UTF-8"' },
  });
}
