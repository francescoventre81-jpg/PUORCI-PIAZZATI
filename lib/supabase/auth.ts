import type { User } from "@supabase/supabase-js";
import { createClient } from "./server";

export async function getVerifiedUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email_confirmed_at) {
    return null;
  }

  return user;
}
