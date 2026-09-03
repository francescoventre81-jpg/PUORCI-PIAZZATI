import { NextResponse, type NextRequest } from "next/server";
import { processAutomaticStatisticsSync } from "@/lib/background-statistics-sync";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }
  try {
    return NextResponse.json({ ok: true, ...(await processAutomaticStatisticsSync()) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Aggiornamento non riuscito." }, { status: 500 });
  }
}
