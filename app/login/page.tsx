import Link from "next/link";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <main className={styles.loginPage}>
      <section className={styles.brandPanel} aria-label="OpenDayCare">
        <div className={styles.decorativeCircleTop} />
        <div className={styles.decorativeCircleBottom} />

        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            <svg
              width="26"
              height="26"
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
          </span>
          <span className={styles.brandName}>OpenDayCare</span>
        </div>

        <div className={styles.brandMessage}>
          <h1>
            El día de cada niño,
            <br />
            compartido con su familia.
          </h1>
          <p>
            Publicá momentos, gestioná las salas y mantené a las familias
            cerca, desde un solo lugar.
          </p>
        </div>

        <div className={styles.roomName}>🌞 Guardería Sala Soles</div>
      </section>

      <section className={styles.formPanel}>
        <div className={styles.loginForm}>
          <h2>Iniciar sesión</h2>
          <p className={styles.intro}>Ingresá para ver el día de hoy.</p>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="login-email">
              Email
            </label>
            <input
              className={styles.input}
              id="login-email"
              name="email"
              type="email"
              defaultValue="caro@opendaycare.com"
              autoComplete="email"
            />
          </div>

          <div className={styles.passwordGroup}>
            <label className={styles.fieldLabel} htmlFor="login-password">
              Contraseña
            </label>
            <input
              className={styles.input}
              id="login-password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <div className={styles.forgotPassword}>
            ¿Olvidaste tu contraseña?
          </div>

          <Link className={styles.submitLink} href="/">
            Iniciar sesión
          </Link>

          <p className={styles.invitation}>
            ¿Te invitó la guardería?{" "}
            <Link href="/activar-cuenta">Activá tu cuenta</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
