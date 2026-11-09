import { notFound } from "next/navigation";
import Link from "next/link";
import { getChildForStaff, getRoomsForStaff } from "@/lib/kids/data";
import type { AllergyTag } from "@/lib/kids/types";
import KidForm from "../../KidForm";
import styles from "../../kids.module.css";

type EditKidPageProps = {
  params: Promise<{ id: string }>;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export const instant = false;

export default async function EditKidPage({ params }: EditKidPageProps) {
  const { id } = await params;
  if (!isUuid(id)) {
    notFound();
  }

  const { data: child, error: childError } = await getChildForStaff(id);
  if (childError) {
    return (
      <main className={styles.page}>
        <div className={styles.content}>
          <p className={styles.storageWarning} role="alert">
            No se pudo cargar el niño para editarlo. Vuelve a intentarlo.
          </p>
          <Link href={`/kids/${id}`} className={styles.backLink}>
            Volver al perfil
          </Link>
        </div>
      </main>
    );
  }
  if (!child) {
    notFound();
  }

  const { data: rooms, error: roomsError } = await getRoomsForStaff();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <KidForm
      mode="edit"
      childId={child.id}
      rooms={rooms ?? []}
      today={today}
      initialLoadError={
        roomsError
          ? "No se pudieron cargar las salas. Vuelve a intentarlo."
          : undefined
      }
      initialValues={{
        fullName: child.full_name,
        birthDate: child.birth_date,
        roomId: child.room_id,
        enrolledAt: child.enrolled_at,
        allergyTags: child.allergy_tags as AllergyTag[],
        medicalNotes: child.medical_notes ?? "",
        photoConsent: child.photo_consent,
      }}
    />
  );
}
