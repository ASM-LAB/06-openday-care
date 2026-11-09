import { Suspense } from "react";
import { requireAuth } from "@/lib/supabase/require-auth";
import FeedClient from "./FeedClient";

async function ProtectedFeed() {
  const user = await requireAuth();
  const displayName = user.fullName?.trim() || user.email || "Usuario";
  return <FeedClient userName={displayName} />;
}

export default function Home() {
  return (
    <Suspense fallback={<p role="status">Cargando…</p>}>
      <ProtectedFeed />
    </Suspense>
  );
}
