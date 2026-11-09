import { Suspense } from "react";
import { requireAuth } from "@/lib/supabase/require-auth";
import AddKidClientPage from "./AddKidClientPage";

async function ProtectedAddKidPage() {
  await requireAuth();
  return <AddKidClientPage />;
}

export default function AddKidPage() {
  return (
    <Suspense fallback={<p role="status">Cargando…</p>}>
      <ProtectedAddKidPage />
    </Suspense>
  );
}
