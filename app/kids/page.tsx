import { Suspense } from "react";
import { getKidsPageData } from "@/lib/kids/data";
import type { ChildListRecord, ChildStatus, RoomRecord } from "@/lib/kids/types";
import KidsClientPage from "./KidsClientPage";

type KidsPageProps = {
  searchParams: Promise<{ status?: string | string[] }>;
};

async function ProtectedKidsPage({ searchParams }: KidsPageProps) {
  const params = await searchParams;
  const requestedStatus = Array.isArray(params.status)
    ? params.status[0]
    : params.status;
  const status: ChildStatus = requestedStatus === "archived" ? "archived" : "active";
  const { user, rooms, children } = await getKidsPageData(status);
  const displayName = user.fullName?.trim() || user.email || "Usuario";
  const queryError = rooms.error || children.error;

  return (
    <KidsClientPage
      userName={displayName}
      status={status}
      rooms={(rooms.data ?? []) as unknown as Pick<RoomRecord, "id" | "name">[]}
      kids={(children.data ?? []) as unknown as ChildListRecord[]}
      queryError={queryError ? "No se pudieron cargar los niños. Vuelve a intentarlo." : null}
    />
  );
}

export default function KidsPage({ searchParams }: KidsPageProps) {
  return (
    <Suspense fallback={<p role="status">Cargando…</p>}>
      <ProtectedKidsPage searchParams={searchParams} />
    </Suspense>
  );
}
