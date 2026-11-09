import { Suspense } from "react";
import { requireAuth } from "@/lib/supabase/require-auth";
import KidsClientPage from "./KidsClientPage";

async function ProtectedKidsPage() {
  const user = await requireAuth();
  const displayName = user.fullName?.trim() || user.email || "Usuario";
  return <KidsClientPage userName={displayName} />;
}

export default function KidsPage() {
  return (
    <Suspense fallback={<p role="status">Cargando…</p>}>
      <ProtectedKidsPage />
    </Suspense>
  );
}
