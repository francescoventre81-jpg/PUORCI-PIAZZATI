import Image from "next/image";
import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link className={`logo ${compact ? "logo-compact" : ""}`} href="/">
      <Image
        alt=""
        aria-hidden="true"
        className="logo-emblem"
        height="52"
        src="/puorcipiazzati-logo.png"
        unoptimized
        width="52"
      />
      <span className="logo-word">
        PUORCI<strong>PIAZZATI</strong>
      </span>
    </Link>
  );
}
