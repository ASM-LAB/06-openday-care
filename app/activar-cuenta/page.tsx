import Link from "next/link";
import styles from "./activar-cuenta.module.css";

export default function ActivateAccountPage() {
  return (
    <main className={styles.activationPage}>
      <section className={styles.activationCard}>
        <div className={styles.brandMark} aria-hidden="true">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        </div>

        <h1 className={styles.title}>Bienvenida a OpenDayCare</h1>
        <p className={styles.intro}>
          Te invitaron a seguir el día de tu hijo. Creá tu contraseña para
          activar la cuenta.
        </p>

        <div className={styles.invitationCard}>
          <div className={styles.childAvatar}>M</div>
          <div>
            <div className={styles.invitationCaption}>Te invitaron a seguir a</div>
            <div className={styles.childName}>Mateo · Sala Soles</div>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="activation-invitation-code">
            Código de invitación
          </label>
          <input
            className={`${styles.input} ${styles.invitationCode}`}
            id="activation-invitation-code"
            name="invitationCode"
            type="text"
            defaultValue="7K4P9"
            autoComplete="off"
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="activation-email">
            Email
          </label>
          <input
            className={styles.input}
            id="activation-email"
            name="email"
            type="email"
            defaultValue="lucia.fernandez@gmail.com"
            autoComplete="email"
          />
        </div>

        <div className={styles.lastFieldGroup}>
          <label className={styles.fieldLabel} htmlFor="activation-password">
            Crear contraseña
          </label>
          <input
            className={`${styles.input} ${styles.passwordInput}`}
            id="activation-password"
            name="password"
            type="password"
            defaultValue="contraseña"
            autoComplete="new-password"
          />
        </div>

        <label className={styles.photoAuthorization}>
          <input
            className={styles.checkbox}
            type="checkbox"
            name="photoAuthorization"
            defaultChecked
          />
          <span>
            Autorizo a la guardería a tomar y compartir fotos de mi hijo dentro
            de la app.
          </span>
        </label>

        <Link className={styles.submitLink} href="/">
          Activar mi cuenta
        </Link>

        <p className={styles.loginPrompt}>
          ¿Ya tenés cuenta? <Link href="/login">Iniciar sesión</Link>
        </p>
      </section>
    </main>
  );
}
