import Link from "next/link";
import KidsSidebar from "./KidsSidebar";
import styles from "./kids.module.css";

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
            <div className={styles.addButton} aria-disabled="true">
              <PlusIcon />
              Agregar niño
            </div>
          </header>

          <div className={styles.searchBox}>
            <SearchIcon />
            <input aria-label="Buscar niño" placeholder="Buscar niño…" />
          </div>

          <div className={styles.roomHeading}>
            <span>SALA SOLES</span>
            <span className={styles.kidCount}>8 niños</span>
            <span className={styles.roomRule} />
          </div>

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
          </div>
        </div>
      </main>
    </div>
  );
}
