"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./logo";
import { SiteSearch } from "./site-search";

const portalLinks = [
  { href: "/#probabili-formazioni", label: "Formazioni" },
  { href: "/#confronto-fonti", label: "Confronto fonti" },
  { href: "/#consigli", label: "Consigli" },
  { href: "/#news", label: "News" },
  { href: "/#chi-siamo", label: "Chi siamo" },
];

export function SiteHeader({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const [open, setOpen] = useState(false);
  void isAuthenticated;

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />
        <SiteSearch onSearch={() => setOpen(false)} />
        <nav className={`main-nav ${open ? "is-open" : ""}`}>
          {portalLinks.map((link) => (
            <Link
              data-analytics-event="navigation_click"
              data-analytics-label={link.href}
              href={link.href}
              key={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <button
            aria-expanded={open}
            aria-label={open ? "Chiudi menu" : "Apri menu"}
            className="menu-toggle"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
