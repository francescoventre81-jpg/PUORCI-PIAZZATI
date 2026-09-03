import { NextResponse, type NextRequest } from "next/server";
import { processBackgroundLineupImport } from "@/lib/background-lineup-import";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }
  try {
    const result = await processBackgroundLineupImport();
    console.info("Lineups import cycle", JSON.stringify(result));
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Importazione non riuscita." },
      { status: 500 },
    );
  }
}
