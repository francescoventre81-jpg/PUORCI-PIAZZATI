import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import {
  getBackgroundLineupImportState,
  startBackgroundLineupImport,
} from "@/lib/background-lineup-import";

export async function GET() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Accesso negato." }, { status: 403 });

  return NextResponse.json({
    state: await getBackgroundLineupImportState(),
  });
}

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Accesso negato." }, { status: 403 });

  try {
    const body = (await request.json()) as { action?: "start" };
    if (body.action !== "start") {
      return NextResponse.json(
        { error: "Richiesta di importazione non valida." },
        { status: 400 },
      );
    }
    const state = await startBackgroundLineupImport(user.id);
    return NextResponse.json({
      message: "Importazione automatica avviata.",
      state,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Importazione API-Football non riuscita.",
      },
      { status: 502 },
    );
  }
}
