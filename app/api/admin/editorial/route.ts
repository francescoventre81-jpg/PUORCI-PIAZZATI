import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Accesso negato." }, { status: 403 });

  const body = (await request.json()) as Record<string, unknown>;
  const kind = body.kind === "article" ? "article" : body.kind === "advice" ? "advice" : null;
  if (!kind) return NextResponse.json({ error: "Tipo di contenuto non valido." }, { status: 400 });
  const table = kind === "article" ? "editorial_articles" : "editorial_advice";
  const admin = createAdminClient();

  if (body.operation === "delete") {
    const id = String(body.id ?? "");
    if (!id) return NextResponse.json({ error: "Contenuto non valido." }, { status: 400 });
    const { error } = await admin.from(table).delete().eq("id", id);
    return error
      ? NextResponse.json({ error: error.message }, { status: 400 })
      : NextResponse.json({ message: "Contenuto eliminato." });
  }

  const status = body.status === "published" ? "published" : "draft";
  const common = {
    updated_by: user.id,
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
  };
  const image = clean(body.imagePath);
  const imageField = image ? { image_path: image } : {};
  const payload = kind === "article"
    ? {
        ...common,
        ...imageField,
        title: clean(body.title),
        slug: clean(body.slug),
        category: clean(body.category),
        summary: clean(body.summary),
        body: clean(body.body),
        fantasy_takeaway: clean(body.fantasyTakeaway) || null,
        reliability: ["high", "medium", "in_evolution"].includes(clean(body.reliability)) ? clean(body.reliability) : "in_evolution",
        sources: parseSources(clean(body.sources)),
      }
    : {
        ...common,
        ...imageField,
        matchday: Math.min(38, Math.max(1, Number(body.matchday) || 1)),
        category: ["start", "avoid", "differential", "top", "flop"].includes(clean(body.category)) ? clean(body.category) : "start",
        subject: clean(body.subject),
        reason: clean(body.reason),
        match_label: clean(body.matchLabel) || null,
      };

  const id = clean(body.id);
  const operation = body.operation === "update" && id ? "update" : "create";
  const { error } = operation === "update"
    ? await admin.from(table).update(payload).eq("id", id)
    : await admin.from(table).insert({ ...payload, created_by: user.id });
  return error
    ? NextResponse.json({ error: error.message }, { status: 400 })
    : NextResponse.json({ message: operation === "update" ? "Contenuto aggiornato." : kind === "article" ? "News salvata." : "Consiglio salvato." });
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseSources(value: string) {
  return value.split("\n").flatMap((line) => {
    const [label, url] = line.split("|").map((part) => part.trim());
    return label && /^https:\/\//.test(url ?? "") ? [{ label, url }] : [];
  });
}
