"use client";

import { useActionState } from "react";
import { signIn } from "./actions";
import styles from "./login.module.css";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(signIn, null);

  return (
    <form
      className={styles.loginForm}
      action={formAction}
      aria-busy={pending}
    >
      <h2>Iniciar sesión</h2>
      <p className={styles.intro}>Ingresá para ver el día de hoy.</p>

      <input type="hidden" name="next" value={redirectTo} />

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel} htmlFor="login-email">
          Email
        </label>
        <input
          className={styles.input}
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          required
          aria-invalid={Boolean(state?.fieldErrors?.email)}
          aria-describedby={
            state?.fieldErrors?.email ? "login-email-error" : undefined
          }
        />
        {state?.fieldErrors?.email && (
          <p className={styles.fieldError} id="login-email-error" role="alert">
            {state.fieldErrors.email}
          </p>
        )}
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
          required
          aria-invalid={Boolean(state?.fieldErrors?.password)}
          aria-describedby={
            state?.fieldErrors?.password ? "login-password-error" : undefined
          }
        />
        {state?.fieldErrors?.password && (
          <p
            className={styles.fieldError}
            id="login-password-error"
            role="alert"
          >
            {state.fieldErrors.password}
          </p>
        )}
      </div>

      <div className={styles.forgotPassword}>¿Olvidaste tu contraseña?</div>

      {state?.message && (
        <p className={styles.formError} role="alert" aria-live="assertive">
          {state.message}
        </p>
      )}

      {pending && (
        <p className={styles.submitStatus} role="status" aria-live="polite">
          Iniciando sesión…
        </p>
      )}

      <button
        className={styles.submitButton}
        type="submit"
        disabled={pending}
      >
        {pending ? "Ingresando…" : "Iniciar sesión"}
      </button>
    </form>
  );
}
