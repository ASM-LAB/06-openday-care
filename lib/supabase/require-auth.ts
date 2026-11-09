import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { createClient } from "./server";

export type KidsStaffContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  email: string | null;
  fullName: string | null;
  daycareId: string;
  role: "staff" | "admin";
};

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

export async function requireKidsStaff(): Promise<KidsStaffContext> {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, full_name, daycare_id, role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error("No se pudo verificar el perfil de acceso a Kids.", {
      cause: profileError,
    });
  }

  if (
    !profile ||
    profile.status !== "active" ||
    (profile.role !== "staff" && profile.role !== "admin")
  ) {
    notFound();
  }

  return {
    supabase,
    userId: user.id,
    email: user.email ?? null,
    fullName: profile.full_name,
    daycareId: profile.daycare_id,
    role: profile.role,
  };
}
