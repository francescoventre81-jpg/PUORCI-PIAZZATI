import { redirect } from "next/navigation";
import { PayPalReturn } from "@/components/paypal-return";
import { getVerifiedUser } from "@/lib/supabase/auth";

export const metadata = {
  title: "Pagamento PayPal",
  description: "Completamento del pagamento PayPal PUORCIPIAZZATI.",
};

export const dynamic = "force-dynamic";

export default async function PayPalReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const user = await getVerifiedUser();
  if (!user) {
    redirect("/accedi?next=/pagamento/paypal");
  }

  const { token } = await searchParams;
  return (
    <section className="payment-return-page">
      <PayPalReturn orderId={token ?? ""} />
    </section>
  );
}
