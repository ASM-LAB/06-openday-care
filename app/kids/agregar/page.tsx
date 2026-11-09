import { Suspense } from "react";
import { getRoomsForStaff } from "@/lib/kids/data";
import KidForm from "../KidForm";

async function ProtectedAddKidPage() {
  const { data: rooms, error } = await getRoomsForStaff();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <KidForm
      mode="create"
      rooms={rooms ?? []}
      today={today}
      initialLoadError={
        error ? "No se pudieron cargar las salas. Vuelve a intentarlo." : undefined
      }
    />
  );
}

export default function AddKidPage() {
  return (
    <Suspense fallback={<p role="status">Cargando…</p>}>
      <ProtectedAddKidPage />
    </Suspense>
  );
}
