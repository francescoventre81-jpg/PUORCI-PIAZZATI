import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnvironment } from "@/lib/supabase/env";
import { processRegistrationEmailAutomation } from "@/lib/registration-email-automation";

function safeNextPath(value: string | null) {
  return value === "/reimposta-password"
    ? "/reimposta-password"
    : "/email-confermata";
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));
  const errorPath =
    next === "/reimposta-password"
      ? "/password-dimenticata?errore=link"
      : "/accedi?errore=conferma";

  if (!code) {
    return NextResponse.redirect(new URL(errorPath, request.url));
  }

  const response = NextResponse.redirect(new URL(next, request.url));
  const { publishableKey, url } = getSupabaseEnvironment();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, options, value }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL(errorPath, request.url));
  }

  if (next === "/email-confermata") {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email_confirmed_at) {
      await processRegistrationEmailAutomation({
        userId: user.id,
        includeReminders: false,
        maxJobs: 1,
      }).catch(() => undefined);
    }
  }

  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
