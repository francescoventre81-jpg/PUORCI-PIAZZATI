"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { PUBLIC_SITE_URL } from "@/lib/site-url";

export function ReferralShare({ code }: { code: string }) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const referralLink = `${PUBLIC_SITE_URL}/registrati?ref=${encodeURIComponent(code)}`;

  async function copy(value: string, type: "code" | "link") {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(type);
    window.setTimeout(() => setCopied(null), 1800);
  }

  async function share() {
    if (!referralLink) return;

    if (navigator.share) {
      await navigator.share({
        title: "PUORCIPIAZZATI",
        text: `Iscriviti a PUORCIPIAZZATI usando il mio codice ${code}`,
        url: referralLink,
      });
      return;
    }

    await copy(referralLink, "link");
  }

  return (
    <div className="referral-share">
      <strong>{code}</strong>
      <button onClick={() => copy(code, "code")} type="button">
        {copied === "code" ? <Check size={16} /> : <Copy size={16} />}
        {copied === "code" ? "Codice copiato" : "Copia codice"}
      </button>
      <button onClick={share} type="button">
        {copied === "link" ? <Check size={16} /> : <Share2 size={16} />}
        {copied === "link" ? "Link copiato" : "Condividi invito"}
      </button>
    </div>
  );
}
