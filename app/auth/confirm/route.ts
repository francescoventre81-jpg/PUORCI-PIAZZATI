import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnvironment } from "@/lib/supabase/env";
import { processRegistrationEmailAutomation } from "@/lib/registration-email-automation";

const allowedOtpTypes = new Set<EmailOtpType>([
  "email",
  "signup",
  "recovery",
  "invite",
  "magiclink",
  "email_change",
]);

function getDestination(type: EmailOtpType) {
  return type === "recovery"
    ? {
        error: "/password-dimenticata?errore=link",
        success: "/reimposta-password",
      }
    : {
        error: "/accedi?errore=conferma",
        success: "/email-confermata",
      };
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const requestedType = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const type =
    requestedType && allowedOtpTypes.has(requestedType)
      ? requestedType
      : null;

  if (!tokenHash || !type) {
    return NextResponse.redirect(
      new URL("/accedi?errore=conferma", request.url),
    );
  }

  const destination = getDestination(type);
  const response = NextResponse.redirect(
    new URL(destination.success, request.url),
  );
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
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    return NextResponse.redirect(
      new URL(destination.error, request.url),
    );
  }

  if (type !== "recovery") {
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
