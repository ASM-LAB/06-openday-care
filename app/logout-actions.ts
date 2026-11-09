"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type LogoutActionState = { error?: string } | null;

const LOGOUT_ERROR_MESSAGE =
  "No se pudo cerrar la sesión. Intentá nuevamente.";

export async function signOut(
  _previousState: LogoutActionState,
): Promise<LogoutActionState> {
  void _previousState;

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });

    if (error) {
      return { error: LOGOUT_ERROR_MESSAGE };
    }
  } catch {
    return { error: LOGOUT_ERROR_MESSAGE };
  }

  redirect("/login");
}
