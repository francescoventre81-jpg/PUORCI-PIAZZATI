import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVerifiedUser } from "@/lib/supabase/auth";

const allowedTypes: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};
const maxSize = 5 * 1024 * 1024;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json({ error: "Accesso richiesto." }, { status: 401 });
  }

  const { id } = await context.params;
  const formData = await request.formData();
  const receipt = formData.get("receipt");
  const croTrn = String(formData.get("cro_trn") ?? "").trim();
  const declaredAt = String(formData.get("declared_at") ?? "").trim();

  if (
    !(receipt instanceof File) ||
    !allowedTypes[receipt.type] ||
    receipt.size <= 0 ||
    receipt.size > maxSize ||
    !declaredAt
  ) {
    return NextResponse.json(
      { error: "Carica PDF, JPG o PNG (massimo 5 MB) e indica la data." },
      { status: 400 },
    );
  }

  try {
    const admin = createAdminClient();
    const { data: registration } = await admin
      .from("registrations")
      .select(
        "id,user_id,payment_method,payment_status,bank_transfer_receipt_path",
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (
      !registration ||
      registration.payment_method !== "instant_bank_transfer" ||
      registration.payment_status === "paid" ||
      registration.bank_transfer_receipt_path
    ) {
      return NextResponse.json(
        { error: "Richiesta non valida per il caricamento." },
        { status: 403 },
      );
    }

    const extension = allowedTypes[receipt.type];
    const path = `${user.id}/${id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await admin.storage
      .from("registration-receipts")
      .upload(path, await receipt.arrayBuffer(), {
        contentType: receipt.type,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { error: updateError } = await admin
      .from("registrations")
      .update({
        bank_transfer_receipt_path: path,
        bank_transfer_cro_trn: croTrn || null,
        bank_transfer_declared_at: declaredAt,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      message:
        "Ricevuta caricata. Il pagamento resta in attesa della verifica amministrativa.",
    });
  } catch {
    return NextResponse.json(
      { error: "Non è stato possibile salvare la ricevuta." },
      { status: 500 },
    );
  }
}
