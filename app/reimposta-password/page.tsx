import { redirect } from "next/navigation";
import { PublicPageHero } from "@/components/public-page-hero";
import { UpdatePasswordForm } from "@/components/update-password-form";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Reimposta password",
  description: "Scegli una nuova password per PUORCIPIAZZATI.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function ReimpostaPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/password-dimenticata?errore=link");
  }

  return (
    <>
      <PublicPageHero
        description="Completa il recupero scegliendo una nuova password sicura."
        eyebrow="Recupero account"
        number="07"
        title="NUOVA PASSWORD"
      />
      <section className="public-section login-section">
        <div className="container login-container">
          <UpdatePasswordForm />
        </div>
      </section>
    </>
  );
}
