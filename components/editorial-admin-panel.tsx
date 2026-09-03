"use client";

import { FileImage, Newspaper, Pencil, Plus, Trash2, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ArticleRow = {
  id: string;
  title: string;
  category: string;
  slug: string;
  summary: string;
  body: string;
  fantasy_takeaway?: string | null;
  reliability: string;
  image_path?: string | null;
  sources?: Array<{ label: string; url: string }>;
  status: string;
  published_at?: string | null;
};

type AdviceRow = {
  id: string;
  subject: string;
  category: string;
  matchday: number;
  status: string;
  reason: string;
  match_label?: string | null;
  image_path?: string | null;
};

export function EditorialAdminPanel({
  advice,
  articles,
  databaseReady,
}: {
  advice: AdviceRow[];
  articles: ArticleRow[];
  databaseReady: boolean;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleRow | null>(null);
  const [editingAdvice, setEditingAdvice] = useState<AdviceRow | null>(null);

  async function save(event: FormEvent<HTMLFormElement>, kind: "article" | "advice") {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const image = data.get("image");
      let imagePath: string | null = null;
      if (image instanceof File && image.size) {
        const supabase = createClient();
        const extension = image.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${kind}/${crypto.randomUUID()}.${extension}`;
        const { error } = await supabase.storage
          .from("editorial-images")
          .upload(path, image, { contentType: image.type, upsert: false });
        if (error) throw error;
        imagePath = path;
      }

      const payload = Object.fromEntries(data.entries());
      delete payload.image;
      const editing = kind === "article" ? editingArticle : editingAdvice;
      const response = await fetch("/api/admin/editorial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, imagePath, id: editing?.id, kind, operation: editing ? "update" : "create" }),
      });
      const result = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) throw new Error(result.error ?? "Salvataggio non riuscito.");
      setMessage(result.message ?? "Contenuto salvato.");
      form.reset();
      if (kind === "article") setEditingArticle(null);
      else setEditingAdvice(null);
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Salvataggio non riuscito.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(kind: "article" | "advice", id: string) {
    if (!window.confirm("Vuoi eliminare definitivamente questo contenuto?")) return;
    setBusy(true);
    const response = await fetch("/api/admin/editorial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, kind, operation: "delete" }),
    });
    const result = (await response.json()) as { error?: string; message?: string };
    setMessage(result.message ?? result.error ?? "Operazione completata.");
    setBusy(false);
    if (response.ok) window.location.reload();
  }

  return (
    <section className="admin-section editorial-admin" id="contenuti">
      <header>
        <span>REDAZIONE</span>
        <h2>News e consigli di giornata</h2>
        <p>Pubblica i contenuti del portale senza modificare il codice.</p>
      </header>

      {!databaseReady ? (
        <div className="admin-message">
          Pannello pronto. Per attivarlo devi prima approvare e applicare la migration
          <strong> 008_editorial_content.sql</strong>.
        </div>
      ) : null}
      {message ? <p className="admin-message">{message}</p> : null}

      <div className="editorial-admin-grid">
        <form key={editingArticle?.id ?? "new-article"} onSubmit={(event) => void save(event, "article")}>
          <div className="editorial-form-title"><Newspaper /> <h3>{editingArticle ? "Modifica news" : "Nuova news"}</h3>{editingArticle ? <button aria-label="Annulla modifica" className="editorial-cancel" onClick={() => setEditingArticle(null)} type="button"><X /></button> : null}</div>
          <label>Titolo<input defaultValue={editingArticle?.title} name="title" required minLength={3} /></label>
          <label>Categoria<input defaultValue={editingArticle?.category} name="category" required placeholder="Mercato, Infortuni, Analisi…" /></label>
          <label>Slug<input defaultValue={editingArticle?.slug} name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="titolo-della-news" /></label>
          <label>Sintesi<textarea defaultValue={editingArticle?.summary} name="summary" required minLength={10} rows={3} /></label>
          <label>Testo completo<textarea defaultValue={editingArticle?.body} name="body" required minLength={20} rows={7} /></label>
          <label>Consiglio fantacalcio<textarea defaultValue={editingArticle?.fantasy_takeaway ?? ""} name="fantasyTakeaway" rows={3} /></label>
          <label>Fonti (una per riga: Nome | URL)<textarea defaultValue={formatSources(editingArticle?.sources)} name="sources" rows={3} /></label>
          <label className="editorial-file"><FileImage /> Immagine autorizzata<input accept="image/jpeg,image/png,image/webp" name="image" type="file" /></label>
          <div className="editorial-inline-fields">
            <label>Affidabilità<select name="reliability" defaultValue={editingArticle?.reliability ?? "in_evolution"}><option value="high">Alta</option><option value="medium">Media</option><option value="in_evolution">In evoluzione</option></select></label>
            <label>Stato<select name="status" defaultValue={editingArticle?.status ?? "draft"}><option value="draft">Bozza</option><option value="published">Pubblicata</option></select></label>
          </div>
          <button disabled={busy || !databaseReady} type="submit"><Plus /> {editingArticle ? "Aggiorna news" : "Salva news"}</button>
        </form>

        <form key={editingAdvice?.id ?? "new-advice"} onSubmit={(event) => void save(event, "advice")}>
          <div className="editorial-form-title"><Plus /> <h3>{editingAdvice ? "Modifica consiglio" : "Nuovo consiglio"}</h3>{editingAdvice ? <button aria-label="Annulla modifica" className="editorial-cancel" onClick={() => setEditingAdvice(null)} type="button"><X /></button> : null}</div>
          <div className="editorial-inline-fields">
            <label>Giornata<input max={38} min={1} name="matchday" required type="number" defaultValue={editingAdvice?.matchday ?? 1} /></label>
            <label>Categoria<select name="category" defaultValue={editingAdvice?.category ?? "start"}><option value="start">Da schierare</option><option value="avoid">Da evitare</option><option value="differential">Scommessa</option><option value="top">Top player</option><option value="flop">Flop possibile</option></select></label>
          </div>
          <label>Giocatore o tema<input defaultValue={editingAdvice?.subject} name="subject" required /></label>
          <label>Partita<input defaultValue={editingAdvice?.match_label ?? ""} name="matchLabel" placeholder="Inter - Monza" /></label>
          <label>Motivazione<textarea defaultValue={editingAdvice?.reason} name="reason" required minLength={10} rows={6} /></label>
          <label className="editorial-file"><FileImage /> Immagine autorizzata<input accept="image/jpeg,image/png,image/webp" name="image" type="file" /></label>
          <label>Stato<select name="status" defaultValue={editingAdvice?.status ?? "draft"}><option value="draft">Bozza</option><option value="published">Pubblicato</option></select></label>
          <button disabled={busy || !databaseReady} type="submit"><Plus /> {editingAdvice ? "Aggiorna consiglio" : "Salva consiglio"}</button>
        </form>
      </div>

      {databaseReady ? (
        <div className="editorial-content-lists">
          <ContentList items={articles.map((item) => ({ id: item.id, label: item.title, meta: `${item.category} · ${item.status}` }))} onDelete={(id) => remove("article", id)} onEdit={(id) => setEditingArticle(articles.find((item) => item.id === id) ?? null)} title="News salvate" />
          <ContentList items={advice.map((item) => ({ id: item.id, label: item.subject, meta: `${item.matchday}ª giornata · ${item.status}` }))} onDelete={(id) => remove("advice", id)} onEdit={(id) => setEditingAdvice(advice.find((item) => item.id === id) ?? null)} title="Consigli salvati" />
        </div>
      ) : null}
    </section>
  );
}

function ContentList({ items, onDelete, onEdit, title }: { items: Array<{ id: string; label: string; meta: string }>; onDelete: (id: string) => void; onEdit: (id: string) => void; title: string }) {
  return (
    <div className="editorial-content-list">
      <h3>{title}</h3>
      {items.length ? items.map((item) => (
        <div key={item.id}><span><strong>{item.label}</strong><small>{item.meta}</small></span><div className="editorial-list-actions"><button aria-label={`Modifica ${item.label}`} onClick={() => onEdit(item.id)} type="button"><Pencil /></button><button aria-label={`Elimina ${item.label}`} onClick={() => onDelete(item.id)} type="button"><Trash2 /></button></div></div>
      )) : <p>Nessun contenuto salvato.</p>}
    </div>
  );
}

function formatSources(sources?: Array<{ label: string; url: string }>) {
  return sources?.map(({ label, url }) => `${label} | ${url}`).join("\n") ?? "";
}
