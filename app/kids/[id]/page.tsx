import Link from "next/link";
import { notFound } from "next/navigation";
import ChildStatusForm from "../ChildStatusForm";
import KidsSidebar from "../KidsSidebar";
import { getChildPageData } from "@/lib/kids/data";
import { formatChildDate, getAllergyLabel, getChildAge } from "@/lib/kids/presentation";
import type { ChildWithRoom } from "@/lib/kids/types";
import styles from "../kids.module.css";

type KidProfileProps = {
  params: Promise<{ id: string }>;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

type IconName = "alert" | "arrowLeft";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {name === "alert" ? (
        <>
          <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          <path d="M12 9v4M12 17h.01" />
        </>
      ) : (
        <path d="m15 18-6-6 6-6" />
      )}
    </svg>
  );
}

export const instant = false;

export default async function KidProfile({ params }: KidProfileProps) {
  const { id } = await params;
  if (!isUuid(id)) {
    notFound();
  }

  const { user, child: result } = await getChildPageData(id);
  const displayName = user.fullName?.trim() || user.email || "Usuario";

  if (result.error) {
    return (
      <div className={styles.page}>
        <KidsSidebar displayName={displayName} />
        <main className={styles.main}>
          <div className={styles.content}>
            <Link href="/kids" className={styles.backLink}>
              <Icon name="arrowLeft" size={18} />
              Volver a Kids
            </Link>
            <p className={styles.storageWarning} role="alert">
              No se pudo cargar el perfil del niño. Vuelve a intentarlo.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!result.data) {
    notFound();
  }

  const kid = result.data as unknown as ChildWithRoom;
  const allergies = kid.allergy_tags.map(getAllergyLabel);

  return (
    <div className={styles.page}>
      <KidsSidebar displayName={displayName} />

      <main className={styles.main}>
        <div className={styles.content}>
          <Link href="/kids" className={styles.backLink}>
            <Icon name="arrowLeft" size={18} />
            Volver a Kids
          </Link>

          <div className={styles.profileLayout}>
            <div className={styles.primaryColumn}>
              <header className={styles.profileHeader}>
                <div className={styles.kidAvatar}>
                  {kid.full_name.charAt(0).toLocaleUpperCase("es")}
                </div>
                <div className={styles.kidHeading}>
                  <h1>{kid.full_name}</h1>
                  <p>
                    {getChildAge(kid.birth_date)} · Sala {kid.room.name}
                  </p>
                </div>
                <Link
                  className={styles.editControl}
                  href={`/kids/${kid.id}/editar`}
                >
                  Editar
                </Link>
              </header>

              {(allergies.length > 0 || kid.medical_notes) && (
                <section className={styles.allergyNotice}>
                  <div className={styles.alertIcon}>
                    <Icon name="alert" size={22} />
                  </div>
                  <div>
                    <h2>Alergias y notas</h2>
                    <p>
                      {allergies.length > 0
                        ? allergies.join(", ")
                        : "Sin alergias registradas."}
                      {kid.medical_notes ? ` · ${kid.medical_notes}` : ""}
                    </p>
                  </div>
                </section>
              )}

              <section className={styles.detailsCard} aria-label="Datos del perfil">
                <div className={styles.detailRow}>
                  <span>Fecha de nacimiento</span>
                  <strong>{formatChildDate(kid.birth_date)}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Sala</span>
                  <strong>{kid.room.name}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Fecha de ingreso</span>
                  <strong>{formatChildDate(kid.enrolled_at)}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Alergias</span>
                  <strong>
                    {allergies.length > 0 ? allergies.join(", ") : "Ninguna"}
                  </strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Notas médicas</span>
                  <strong>{kid.medical_notes?.trim() || "Sin notas"}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Consentimiento de fotos</span>
                  <strong>{kid.photo_consent ? "Sí" : "No"}</strong>
                </div>
                <div className={`${styles.detailRow} ${styles.lastDetailRow}`}>
                  <span>Estado</span>
                  <strong>{kid.status === "active" ? "Activo" : "Archivado"}</strong>
                </div>
              </section>
            </div>

            <aside className={styles.secondaryColumn}>
              <section className={styles.parentsCard}>
                <h2>ESTADO DEL REGISTRO</h2>
                <p className={styles.statusDescription}>
                  {kid.status === "active"
                    ? "Este niño aparece en el listado activo."
                    : "Este niño está archivado y no aparece en el listado activo."}
                </p>
                <ChildStatusForm childId={kid.id} currentStatus={kid.status} />
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
