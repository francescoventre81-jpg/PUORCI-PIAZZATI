import Link from "next/link";
import { BadgeCheck, LayoutDashboard } from "lucide-react";
import { redirect } from "next/navigation";
import { getVerifiedUser } from "@/lib/supabase/auth";

export const metadata = {
  title: "Email confermata",
  description: "Il tuo account PUORCIPIAZZATI è stato confermato.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function EmailConfermataPage() {
  const user = await getVerifiedUser();

  if (!user) {
    redirect("/accedi?errore=conferma");
  }

  return (
    <section className="auth-confirmed-page">
      <div className="auth-confirmed-card">
        <BadgeCheck aria-hidden="true" />
        <span>ACCOUNT ATTIVATO</span>
        <h1>Email confermata</h1>
        <p>
          Il tuo account <strong>{user.email}</strong> è registrato e hai già
          effettuato l&apos;accesso. Non devi inserire nuovamente email e
          password.
        </p>
        <Link className="button button-primary" href="/dashboard" prefetch={false}>
          Vai alla tua area personale
          <LayoutDashboard size={19} />
        </Link>
        <Link className="auth-confirmed-home" href="/" prefetch={false}>
          Torna alla homepage
        </Link>
      </div>
    </section>
  );
}
