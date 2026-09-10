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

    const isLogin = request.nextUrl.pathname === "/admin/login";
    if (!isLogin && !user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    // Missing Supabase env should not break the public site. Admin pages will
    // surface the setup requirement when they are opened.
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
