"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./link-parent-modal.module.css";

type Relationship = "Mamá" | "Papá" | "Tutor/a";

const relationships: Relationship[] = ["Mamá", "Papá", "Tutor/a"];

export default function LinkParentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSimulationNotice, setShowSimulationNotice] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState<Relationship>("Mamá");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setName("");
    setEmail("");
    setRelationship("Mamá");
    setErrors({});
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    nameInputRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal, isOpen]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: { name?: string; email?: string } = {};
    if (!name.trim()) nextErrors.name = "Ingresá el nombre de la persona invitada.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Ingresá un correo electrónico válido.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setShowSimulationNotice(true);
    closeModal();
  }

  return (
    <>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(true)}
        ref={triggerRef}
        type="button"
      >
        <span className={styles.triggerIcon} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
        <span>Vincular otro padre</span>
      </button>

      {showSimulationNotice && (
        <p className={styles.simulationNotice} role="status" aria-live="polite">
          Invitación simulada: no se envió ningún correo ni se guardaron datos.
        </p>
      )}

      {isOpen && (
        <div
          className={styles.backdrop}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            aria-labelledby="link-parent-title"
            aria-modal="true"
            className={styles.dialog}
            ref={dialogRef}
            role="dialog"
            tabIndex={-1}
          >
            <header className={styles.header}>
              <div>
                <h2 className={styles.title} id="link-parent-title">
                  Vincular padre
                </h2>
                <p className={styles.subtitle}>a Mateo Fernández</p>
              </div>
              <button
                aria-label="Cerrar ventana"
                className={styles.closeButton}
                onClick={closeModal}
                type="button"
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="m18 6-12 12M6 6l12 12" />
                </svg>
              </button>
            </header>

            <form className={styles.form} noValidate onSubmit={handleSubmit}>
              <div className={styles.infoNotice}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <p>
                  Esta invitación es una simulación: no enviaremos ningún
                  correo. Si fuera real, la persona solo vería el feed de
                  Mateo.
                </p>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="invite-name">
                  Nombre del padre/madre
                </label>
                <input
                  aria-describedby={errors.name ? "invite-name-error" : undefined}
                  aria-invalid={Boolean(errors.name)}
                  autoComplete="name"
                  className={styles.input}
                  id="invite-name"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ej. Diego Fernández"
                  ref={nameInputRef}
                  value={name}
                />
                {errors.name && (
                  <p className={styles.error} id="invite-name-error">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="invite-email">
                  Email
                </label>
                <input
                  aria-describedby={errors.email ? "invite-email-error" : undefined}
                  aria-invalid={Boolean(errors.email)}
                  autoComplete="email"
                  className={styles.input}
                  id="invite-email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="correo@ejemplo.com"
                  type="email"
                  value={email}
                />
                {errors.email && (
                  <p className={styles.error} id="invite-email-error">
                    {errors.email}
                  </p>
                )}
              </div>

              <fieldset className={styles.relationshipField}>
                <legend className={styles.label}>Parentesco</legend>
                <div className={styles.relationshipOptions}>
                  {relationships.map((option) => (
                    <button
                      aria-pressed={relationship === option}
                      className={`${styles.relationshipOption} ${
                        relationship === option ? styles.selectedOption : ""
                      }`}
                      key={option}
                      onClick={() => setRelationship(option)}
                      type="button"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </fieldset>

              <section className={styles.codeCard} aria-label="Código ilustrativo">
                <h3 className={styles.codeLabel}>Código de invitación</h3>
                <p className={styles.code}>7K4P9</p>
                <p className={styles.expiration}>Vence en 7 días</p>
                <p className={styles.codeDisclaimer}>
                  Código de ejemplo; no sirve para activar una cuenta real.
                </p>
              </section>

              <button className={styles.submitButton} type="submit">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="m22 2-7 20-4-9-9-4zM22 2 11 13" />
                </svg>
                Enviar invitación
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
