import { NextResponse, type NextRequest } from "next/server";
import { processRegistrationEmailAutomation } from "@/lib/registration-email-automation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  try {
    const result = await processRegistrationEmailAutomation();
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json(
      { error: "Controllo email non riuscito." },
      { status: 500 },
    );
  }
}
