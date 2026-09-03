"use client";

import { Search } from "lucide-react";

export function SiteSearch({ onSearch }: { onSearch?: () => void }) {
  return (
    <form
      action="/cerca"
      className="site-search"
      method="get"
      onSubmit={() => onSearch?.()}
      role="search"
    >
      <Search aria-hidden="true" />
      <input aria-label="Cerca nel sito" name="q" placeholder="Cerca giocatore, squadra o news" required />
      <button aria-label="Avvia ricerca" type="submit">Cerca</button>
    </form>
  );
}
