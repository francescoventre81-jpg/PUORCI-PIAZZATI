import { redirect } from "next/navigation";
import { getVerifiedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export async function getAdminUser() {
  const user = await getVerifiedUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_admin", {
    candidate_user_id: user.id,
  });

  return !error && data === true ? user : null;
}

export async function requireAdminPage() {
  const user = await getAdminUser();
  if (!user) redirect("/dashboard");
  return user;
}
