"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      className="dashboard-signout"
      disabled={loading}
      onClick={signOut}
      type="button"
    >
      <LogOut size={18} />
      {loading ? "Uscita..." : "Esci"}
    </button>
  );
}
