import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "./server";

export async function requireAuth() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return { ...user, fullName: profile?.full_name ?? null };
}
