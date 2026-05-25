import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match a tudo exceto:
     *  - _next/static (assets)
     *  - _next/image
     *  - favicon
     *  - imagens estáticas (svg/png/jpg/jpeg/gif/webp/ico)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
