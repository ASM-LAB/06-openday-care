import Link from "next/link";
import { LogoutControl } from "../LogoutControl";
import styles from "./kids.module.css";

type IconName = "bell" | "children" | "home" | "logout" | "plus" | "sun" | "user";

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
      {name === "bell" && (
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
      )}
      {name === "children" && (
        <>
          <circle cx="9" cy="7" r="3" />
          <circle cx="17" cy="9" r="2.4" />
          <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 20a5 5 0 0 1 5.5-4.9" />
        </>
      )}
      {name === "home" && (
        <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
      )}
      {name === "logout" && (
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
      )}
      {name === "plus" && <path d="M12 5v14M5 12h14" />}
      {name === "sun" && (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
      )}
      {name === "user" && (
        <>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </>
      )}
    </svg>
  );
}

export default function KidsSidebar({ displayName }: { displayName: string }) {
  return (
    <aside className={styles.sidebar}>
      <Link href="/" className={styles.brand}>
        <span className={styles.brandMark}>
          <Icon name="sun" size={21} />
        </span>
        <span className={styles.brandText}>
          <span className={styles.brandName}>OpenDayCare</span>
          <span className={styles.roomName}>Sala Soles</span>
        </span>
      </Link>

      <div className={styles.createButton} aria-disabled="true">
        <Icon name="plus" size={17} />
        Nueva publicación
      </div>

      <nav className={styles.navigation} aria-label="Navegación principal">
        <Link href="/" className={styles.navigationItem}>
          <Icon name="home" size={19} />
          Feed
        </Link>
        <Link
          href="/kids"
          className={`${styles.navigationItem} ${styles.navigationItemActive}`}
          aria-current="page"
        >
          <Icon name="children" size={19} />
          Kids
        </Link>
        <div className={styles.navigationItem} aria-disabled="true">
          <Icon name="bell" size={19} />
          Avisos
        </div>
        <div className={styles.navigationItem} aria-disabled="true">
          <Icon name="user" size={19} />
          Mi cuenta
        </div>
      </nav>

      <div className={styles.profile}>
        <div className={styles.profileRow}>
          <div className={styles.profileAvatar}>
            {displayName.charAt(0).toLocaleUpperCase("es")}
          </div>
          <div className={styles.profileDetails}>
            <div className={styles.profileName}>{displayName}</div>
            <div className={styles.profileRole}>Usuario</div>
          </div>
          <LogoutControl
            formClassName={styles.logoutForm}
            buttonClassName={styles.logoutControl}
            errorClassName={styles.logoutError}
          >
            <Icon name="logout" size={16} />
          </LogoutControl>
        </div>
      </div>
    </aside>
  );
}
