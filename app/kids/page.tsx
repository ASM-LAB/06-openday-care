"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import KidsSidebar from "./KidsSidebar";
import styles from "./kids.module.css";
import {
  isSessionKid,
  SESSION_KIDS_KEY,
  type SessionKid,
} from "./session-kids";

type Kid = {
  name: string;
  initial: string;
  details: string;
  avatarBackground: string;
  avatarColor: string;
  badge?: {
    label: string;
    tone: "allergy" | "link";
  };
};

const kids: Kid[] = [
  {
    name: "Mateo Fernández",
    initial: "M",
    details: "3 años · 2 padres vinculados",
    avatarBackground: "#A9D9E8",
    avatarColor: "#1F7A93",
    badge: { label: "MANÍ", tone: "allergy" },
  },
  {
    name: "Sofía Méndez",
    initial: "S",
    details: "2 años · 1 padre vinculado",
    avatarBackground: "#F4B8CC",
    avatarColor: "#C44A7A",
  },
  {
    name: "Benjamín Ruiz",
    initial: "B",
    details: "3 años · 2 padres vinculados",
    avatarBackground: "#B9DEC4",
    avatarColor: "#3E8B62",
  },
  {
    name: "Valentina Soto",
    initial: "V",
    details: "2 años · sin padres vinculados",
    avatarBackground: "#F4DC8E",
    avatarColor: "#9A7B1E",
    badge: { label: "VINCULAR", tone: "link" },
  },
  {
    name: "Tomás Díaz",
    initial: "T",
    details: "3 años · 1 padre vinculado",
    avatarBackground: "#C9B6E8",
    avatarColor: "#7B5FC0",
    badge: { label: "LACTOSA", tone: "allergy" },
  },
  {
    name: "Emma Castro",
    initial: "E",
    details: "2 años · 1 padre vinculado",
    avatarBackground: "#F4B8CC",
    avatarColor: "#C44A7A",
  },
  {
    name: "Lucas Romero",
    initial: "L",
    details: "3 años · 1 padre vinculado",
    avatarBackground: "#A9D9E8",
    avatarColor: "#1F7A93",
  },
  {
    name: "Olivia Vega",
    initial: "O",
    details: "2 años · 1 padre vinculado",
    avatarBackground: "#B9DEC4",
    avatarColor: "#3E8B62",
  },
];

const sessionKidAvatarColors = [
  { background: "#B9DEC4", color: "#3E8B62" },
  { background: "#A9D9E8", color: "#1F7A93" },
  { background: "#F4B8CC", color: "#C44A7A" },
  { background: "#C9B6E8", color: "#7B5FC0" },
];

const STORAGE_READ_ERROR = "\u0000session-storage-unavailable";

function subscribeToSessionKids(onStoreChange: () => void) {
  function handleStorageChange(event: StorageEvent) {
    if (event.key === null || event.key === SESSION_KIDS_KEY) {
      onStoreChange();
    }
  }

  window.addEventListener("storage", handleStorageChange);
  return () => window.removeEventListener("storage", handleStorageChange);
}

function getSessionKidsSnapshot(): string | null {
  try {
    return window.sessionStorage.getItem(SESSION_KIDS_KEY);
  } catch {
    return STORAGE_READ_ERROR;
  }
}

function getServerSessionKidsSnapshot(): string | null {
  return null;
}

function parseSessionKidsSnapshot(snapshot: string | null): {
  kids: SessionKid[];
  warning: boolean;
} {
  if (snapshot === null) {
    return { kids: [], warning: false };
  }

  if (snapshot === STORAGE_READ_ERROR) {
    return { kids: [], warning: true };
  }

  try {
    const parsedKids: unknown = JSON.parse(snapshot);
    if (!Array.isArray(parsedKids) || !parsedKids.every(isSessionKid)) {
      return { kids: [], warning: true };
    }

    return { kids: parsedKids, warning: false };
  } catch {
    return { kids: [], warning: true };
  }
}

function getAge(birthDate: string): string {
  const [year, month, day] = birthDate.split("-").map(Number);
  const today = new Date();
  let months =
    (today.getFullYear() - year) * 12 + today.getMonth() + 1 - month;

  if (today.getDate() < day) {
    months -= 1;
  }

  if (months < 12) {
    return `${months} ${months === 1 ? "mes" : "meses"}`;
  }

  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? "año" : "años"}`;
}

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

export default function KidsPage() {
  const storageSnapshot = useSyncExternalStore(
    subscribeToSessionKids,
    getSessionKidsSnapshot,
    getServerSessionKidsSnapshot,
  );
  const { kids: sessionKids, warning: storageWarning } =
    parseSessionKidsSnapshot(storageSnapshot);

  return (
    <div className={styles.page}>
      <KidsSidebar />

      <main className={styles.main}>
        <div className={styles.listContent}>
          <header className={styles.listHeader}>
            <div>
              <div className={styles.eyebrow}>GESTIÓN</div>
              <h1 className={styles.listTitle}>Kids</h1>
            </div>
            <Link className={styles.addButton} href="/kids/agregar">
              <PlusIcon />
              Agregar niño
            </Link>
          </header>

          <div className={styles.searchBox}>
            <SearchIcon />
            <input aria-label="Buscar niño" placeholder="Buscar niño…" />
          </div>

          <div className={styles.roomHeading}>
            <span>SALA SOLES</span>
            <span className={styles.kidCount}>
              {kids.length + sessionKids.length} niños
            </span>
            <span className={styles.roomRule} />
          </div>

          {storageWarning && (
            <p className={styles.storageWarning} role="alert">
              No se pudieron leer los niños guardados. Se muestran los ocho
              perfiles fijos.
            </p>
          )}

          <div className={styles.kidsGrid}>
            {kids.map((kid) => (
              <Link
                className={styles.kidCard}
                href="/kids/mateo-fernandez"
                key={kid.name}
              >
                <span
                  className={styles.kidListAvatar}
                  style={{
                    backgroundColor: kid.avatarBackground,
                    color: kid.avatarColor,
                  }}
                >
                  {kid.initial}
                </span>
                <span className={styles.kidDetails}>
                  <span className={styles.kidName}>{kid.name}</span>
                  <span className={styles.kidSubtext}>{kid.details}</span>
                </span>
                {kid.badge ? (
                  <span
                    className={`${styles.kidBadge} ${
                      kid.badge.tone === "allergy"
                        ? styles.allergyBadge
                        : styles.linkBadge
                    }`}
                  >
                    {kid.badge.label}
                  </span>
                ) : (
                  <span className={styles.cardChevron}>
                    <ChevronIcon />
                  </span>
                )}
              </Link>
            ))}
            {sessionKids.map((kid, index) => {
              const avatarColors =
                sessionKidAvatarColors[index % sessionKidAvatarColors.length];
              const firstAllergy = kid.allergies[0];

              return (
                <div
                  className={`${styles.kidCard} ${styles.sessionKidCard}`}
                  key={kid.id}
                >
                  <span
                    className={styles.kidListAvatar}
                    style={{
                      backgroundColor: avatarColors.background,
                      color: avatarColors.color,
                    }}
                  >
                    {kid.name.charAt(0).toLocaleUpperCase("es")}
                  </span>
                  <span className={styles.kidDetails}>
                    <span className={styles.kidName}>{kid.name}</span>
                    <span className={styles.kidSubtext}>
                      {getAge(kid.birthDate)} · sin padres vinculados
                    </span>
                  </span>
                  {firstAllergy && (
                    <span className={`${styles.kidBadge} ${styles.allergyBadge}`}>
                      {firstAllergy.toLocaleUpperCase("es")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
