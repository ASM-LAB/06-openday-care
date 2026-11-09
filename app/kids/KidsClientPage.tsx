"use client";

import Link from "next/link";
import ChildStatusForm from "./ChildStatusForm";
import KidsSidebar from "./KidsSidebar";
import { getAllergyLabel, getChildAge } from "@/lib/kids/presentation";
import type { ChildListRecord, ChildStatus, RoomRecord } from "@/lib/kids/types";
import styles from "./kids.module.css";

type KidsClientPageProps = {
  userName: string;
  status: ChildStatus;
  rooms: Pick<RoomRecord, "id" | "name">[];
  kids: ChildListRecord[];
  queryError: string | null;
};

const avatarColors = [
  { background: "#B9DEC4", color: "#3E8B62" },
  { background: "#A9D9E8", color: "#1F7A93" },
  { background: "#F4B8CC", color: "#C44A7A" },
  { background: "#C9B6E8", color: "#7B5FC0" },
];

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function KidCard({
  kid,
  index,
  status,
}: {
  kid: ChildListRecord;
  index: number;
  status: ChildStatus;
}) {
  const color = avatarColors[index % avatarColors.length];
  const firstAllergy = kid.allergy_tags[0];

  return (
    <article className={styles.kidCard}>
      <Link className={styles.kidCardLink} href={`/kids/${kid.id}`}>
        <span
          className={styles.kidListAvatar}
          style={{ backgroundColor: color.background, color: color.color }}
        >
          {kid.full_name.charAt(0).toLocaleUpperCase("es")}
        </span>
        <span className={styles.kidDetails}>
          <span className={styles.kidName}>{kid.full_name}</span>
          <span className={styles.kidSubtext}>
            {getChildAge(kid.birth_date)} · Sala {kid.room.name}
          </span>
        </span>
        {firstAllergy ? (
          <span className={`${styles.kidBadge} ${styles.allergyBadge}`}>
            {getAllergyLabel(firstAllergy)}
          </span>
        ) : (
          <span className={styles.cardChevron}>
            <ChevronIcon />
          </span>
        )}
      </Link>
      {status === "archived" && (
        <ChildStatusForm childId={kid.id} currentStatus={kid.status} />
      )}
    </article>
  );
}

export default function KidsClientPage({
  userName,
  status,
  rooms,
  kids,
  queryError,
}: KidsClientPageProps) {
  const isArchived = status === "archived";
  const roomGroups = rooms
    .map((room) => ({
      room,
      kids: kids.filter((kid) => kid.room_id === room.id),
    }))
    .filter((group) => group.kids.length > 0);

  return (
    <div className={styles.page}>
      <KidsSidebar displayName={userName} />

      <main className={styles.main}>
        <div className={styles.listContent}>
          <header className={styles.listHeader}>
            <div>
              <div className={styles.eyebrow}>GESTIÓN</div>
              <h1 className={styles.listTitle}>Kids</h1>
              <p className={styles.listTotal}>
                {kids.length} {kids.length === 1 ? "niño" : "niños"} {isArchived ? "archivados" : "activos"}
              </p>
            </div>
            {!isArchived && (
              <Link className={styles.addButton} href="/kids/agregar">
                <PlusIcon />
                Agregar niño
              </Link>
            )}
          </header>

          <nav className={styles.statusFilters} aria-label="Filtrar niños por estado">
            <Link
              aria-current={!isArchived ? "page" : undefined}
              className={!isArchived ? styles.statusFilterActive : undefined}
              href="/kids"
            >
              Activos
            </Link>
            <Link
              aria-current={isArchived ? "page" : undefined}
              className={isArchived ? styles.statusFilterActive : undefined}
              href="/kids?status=archived"
            >
              Archivados
            </Link>
          </nav>

          <div className={styles.searchBox}>
            <SearchIcon />
            <input aria-label="Buscar niño" placeholder="Buscar niño…" />
          </div>

          {queryError ? (
            <p className={styles.storageWarning} role="alert">
              {queryError}
            </p>
          ) : rooms.length === 0 ? (
            <p className={styles.storageWarning} role="alert">
              No hay salas disponibles para mostrar los niños.
            </p>
          ) : kids.length === 0 ? (
            <p className={styles.emptyState} role="status">
              {isArchived
                ? "No hay niños archivados."
                : "Todavía no hay niños activos. Puedes agregar el primero."}
            </p>
          ) : (
            <div className={styles.roomGroups}>
              {roomGroups.map(({ room, kids: roomKids }) => (
                <section className={styles.roomSection} key={room.id}>
                  <div className={styles.roomHeading}>
                    <span>SALA {room.name.toLocaleUpperCase("es")}</span>
                    <span className={styles.kidCount}>
                      {roomKids.length} {roomKids.length === 1 ? "niño" : "niños"}
                    </span>
                    <span className={styles.roomRule} />
                  </div>
                  <div className={styles.kidsGrid}>
                    {roomKids.map((kid, index) => (
                      <KidCard
                        key={kid.id}
                        kid={kid}
                        index={index}
                        status={status}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
