import { NextResponse, type NextRequest } from "next/server";
import { processAutomaticInjurySync } from "@/lib/background-injury-sync";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }
  try {
    const result = await processAutomaticInjurySync();
    console.info("Injury sync cycle", JSON.stringify(result));
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Aggiornamento non riuscito." },
      { status: 500 },
    );
  }
}
