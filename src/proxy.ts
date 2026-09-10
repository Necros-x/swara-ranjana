import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  try {
    const { url, publicKey } = getSupabasePublicEnv();
    const supabase = createServerClient<Database>(url, publicKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const isAdmin = pathname.startsWith("/admin");
    const isAccount = pathname.startsWith("/account");
    const isAdminLogin = pathname === "/admin/login";
    const isAccountLogin = pathname === "/account/login";

    if (!user && isAdmin && !isAdminLogin) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!user && isAccount && !isAccountLogin) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/account/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    // Missing Supabase env should not break the public site. Admin pages will
    // surface the setup requirement when they are opened.
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
