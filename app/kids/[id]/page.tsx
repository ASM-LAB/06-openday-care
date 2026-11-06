import Link from "next/link";
import { notFound } from "next/navigation";
import KidsSidebar from "../KidsSidebar";
import styles from "../kids.module.css";

type IconName = "alert" | "arrowLeft" | "plus" | "sun";

type IconProps = {
  name: IconName;
  size?: number;
};

function Icon({ name, size = 20 }: IconProps) {
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
      {name === "alert" && (
        <>
          <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          <path d="M12 9v4M12 17h.01" />
        </>
      )}
      {name === "arrowLeft" && <path d="m15 18-6-6 6-6" />}
      {name === "plus" && <path d="M12 5v14M5 12h14" />}
      {name === "sun" && (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
      )}
    </svg>
  );
}

export async function generateStaticParams() {
  return [{ id: "mateo-fernandez" }];
}

export const instant = false;

export default async function KidProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (id !== "mateo-fernandez") {
    notFound();
  }

  return (
    <div className={styles.page}>
      <KidsSidebar />

      <main className={styles.main}>
        <div className={styles.content}>
          <Link href="/kids" className={styles.backLink}>
            <Icon name="arrowLeft" size={18} />
            Volver a Kids
          </Link>

          <div className={styles.profileLayout}>
            <div className={styles.primaryColumn}>
              <header className={styles.profileHeader}>
                <div className={styles.kidAvatar}>M</div>
                <div className={styles.kidHeading}>
                  <h1>Mateo Fernández</h1>
                  <p>3 años · Sala Soles</p>
                </div>
                <span className={styles.editControl} aria-disabled="true">
                  Editar
                </span>
              </header>

              <section className={styles.allergyNotice}>
                <div className={styles.alertIcon}>
                  <Icon name="alert" size={22} />
                </div>
                <div>
                  <h2>Alergias y notas</h2>
                  <p>
                    Alergia al maní. Evitar frutos secos. Lleva inhalador en la
                    mochila.
                  </p>
                </div>
              </section>

              <section className={styles.detailsCard} aria-label="Datos del perfil">
                <div className={styles.detailRow}>
                  <span>Fecha de nacimiento</span>
                  <strong>12 mar 2022</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Sala</span>
                  <strong>Soles</strong>
                </div>
                <div className={`${styles.detailRow} ${styles.lastDetailRow}`}>
                  <span>Ingreso</span>
                  <strong>feb 2025</strong>
                </div>
              </section>
            </div>

            <aside className={styles.secondaryColumn}>
              <div className={styles.daySummary} aria-disabled="true">
                <Icon name="sun" size={18} />
                Resumen del día
              </div>

              <section className={styles.parentsCard}>
                <h2>PADRES VINCULADOS</h2>
                <div className={styles.parentsList}>
                  <div className={styles.parentRow}>
                    <div className={`${styles.parentAvatar} ${styles.motherAvatar}`}>
                      L
                    </div>
                    <div className={styles.parentDetails}>
                      <div className={styles.parentName}>Lucía Fernández</div>
                      <div className={styles.parentRole}>Mamá · activa</div>
                    </div>
                    <span className={`${styles.parentStatus} ${styles.activeStatus}`}>
                      ACTIVA
                    </span>
                  </div>
                  <div className={styles.parentRow}>
                    <div className={`${styles.parentAvatar} ${styles.fatherAvatar}`}>
                      D
                    </div>
                    <div className={styles.parentDetails}>
                      <div className={styles.parentName}>Diego Fernández</div>
                      <div className={styles.parentRole}>
                        Papá · invitación enviada
                      </div>
                    </div>
                    <span className={`${styles.parentStatus} ${styles.pendingStatus}`}>
                      PENDIENTE
                    </span>
                  </div>
                  <div className={styles.linkParentControl} aria-disabled="true">
                    <span className={styles.addParentIcon}>
                      <Icon name="plus" size={18} />
                    </span>
                    <span>Vincular otro padre</span>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
