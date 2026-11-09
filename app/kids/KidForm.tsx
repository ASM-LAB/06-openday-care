"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ALLERGY_OPTIONS } from "@/lib/kids/types";
import type { AllergyTag, RoomRecord } from "@/lib/kids/types";
import { createKid, updateKid } from "./actions";
import type { KidFormState } from "./actions";
import styles from "./agregar/agregar.module.css";

export type KidFormValues = {
  fullName: string;
  birthDate: string;
  roomId: string;
  enrolledAt: string;
  allergyTags: AllergyTag[];
  medicalNotes: string;
  photoConsent: boolean;
};

type KidFormProps = {
  mode: "create" | "edit";
  rooms: Pick<RoomRecord, "id" | "name">[];
  today: string;
  initialValues?: KidFormValues;
  childId?: string;
  initialLoadError?: string;
};

const emptyState: KidFormState = {};

export default function KidForm({
  mode,
  rooms,
  today,
  initialValues,
  childId,
  initialLoadError,
}: KidFormProps) {
  const action = mode === "create" ? createKid : updateKid;
  const [state, formAction, pending] = useActionState(action, emptyState);
  const [values, setValues] = useState<KidFormValues>(() =>
    initialValues ?? {
      fullName: "",
      birthDate: "",
      roomId: "",
      enrolledAt: today,
      allergyTags: [],
      medicalNotes: "",
      photoConsent: true,
    },
  );

  const title = mode === "create" ? "Agregar niño" : "Editar niño";
  const canSave = rooms.length > 0 && !initialLoadError;

  function setField<Field extends keyof KidFormValues>(
    field: Field,
    value: KidFormValues[Field],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function toggleAllergy(tag: AllergyTag, checked: boolean) {
    setValues((current) => ({
      ...current,
      allergyTags: checked
        ? [...current.allergyTags, tag]
        : current.allergyTags.filter((currentTag) => currentTag !== tag),
    }));
  }

  function fieldError(field: keyof NonNullable<KidFormState["errors"]>) {
    return state.errors?.[field];
  }

  const fullNameError = fieldError("fullName");
  const birthDateError = fieldError("birthDate");
  const roomError = fieldError("roomId");
  const enrolledAtError = fieldError("enrolledAt");
  const allergyError = fieldError("allergyTags");

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="kid-form-title">
        <header className={styles.header}>
          <Link className={styles.cancelLink} href="/kids">
            Cancelar
          </Link>
          <h1 className={styles.title} id="kid-form-title">
            {title}
          </h1>
          <button
            className={styles.saveButton}
            disabled={!canSave || pending}
            form="kid-form"
            type="submit"
          >
            {pending ? "Guardando…" : "Guardar"}
          </button>
        </header>

        <form className={styles.form} id="kid-form" action={formAction}>
          {mode === "edit" && childId && (
            <input type="hidden" name="id" value={childId} />
          )}

          {(initialLoadError || state.message || rooms.length === 0) && (
            <p className={styles.formError} role="alert" aria-live="polite">
              {initialLoadError ??
                state.message ??
                "No hay salas disponibles para asignar al niño."}
            </p>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="kid-name">
              Nombre completo <span className={styles.required}>Obligatorio</span>
            </label>
            <input
              aria-describedby={fullNameError ? "kid-name-error" : undefined}
              aria-invalid={Boolean(fullNameError)}
              autoComplete="off"
              className={styles.input}
              id="kid-name"
              name="fullName"
              onChange={(event) => setField("fullName", event.target.value)}
              placeholder="Ej. Martina López"
              required
              type="text"
              value={values.fullName}
            />
            {fullNameError && (
              <p className={styles.fieldError} id="kid-name-error" role="alert">
                {fullNameError}
              </p>
            )}
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="kid-birth-date">
                Fecha de nacimiento{" "}
                <span className={styles.required}>Obligatorio</span>
              </label>
              <input
                aria-describedby={
                  birthDateError ? "kid-birth-date-error" : undefined
                }
                aria-invalid={Boolean(birthDateError)}
                className={styles.input}
                id="kid-birth-date"
                max={today}
                name="birthDate"
                onChange={(event) => setField("birthDate", event.target.value)}
                required
                type="date"
                value={values.birthDate}
              />
              {birthDateError && (
                <p
                  className={styles.fieldError}
                  id="kid-birth-date-error"
                  role="alert"
                >
                  {birthDateError}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="kid-room">
                Sala <span className={styles.required}>Obligatorio</span>
              </label>
              <select
                aria-describedby={roomError ? "kid-room-error" : undefined}
                aria-invalid={Boolean(roomError)}
                className={`${styles.input} ${styles.select}`}
                id="kid-room"
                name="roomId"
                onChange={(event) => setField("roomId", event.target.value)}
                required
                value={values.roomId}
              >
                <option value="">Selecciona una sala</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
              {roomError && (
                <p className={styles.fieldError} id="kid-room-error" role="alert">
                  {roomError}
                </p>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="kid-enrolled-at">
              Fecha de ingreso <span className={styles.required}>Obligatorio</span>
            </label>
            <input
              aria-describedby={
                enrolledAtError ? "kid-enrolled-at-error" : undefined
              }
              aria-invalid={Boolean(enrolledAtError)}
              className={styles.input}
              id="kid-enrolled-at"
              name="enrolledAt"
              onChange={(event) => setField("enrolledAt", event.target.value)}
              required
              type="date"
              value={values.enrolledAt}
            />
            {enrolledAtError && (
              <p
                className={styles.fieldError}
                id="kid-enrolled-at-error"
                role="alert"
              >
                {enrolledAtError}
              </p>
            )}
          </div>

          <fieldset className={styles.fieldset}>
            <legend className={styles.label}>
              Alergias <span className={styles.optional}>Opcional</span>
            </legend>
            <div className={styles.checkboxList}>
              {ALLERGY_OPTIONS.map(({ value, label }) => (
                <label className={styles.checkboxOption} key={value}>
                  <input
                    checked={values.allergyTags.includes(value)}
                    name="allergyTags"
                    onChange={(event) =>
                      toggleAllergy(value, event.target.checked)
                    }
                    type="checkbox"
                    value={value}
                  />
                  {label}
                </label>
              ))}
            </div>
            {allergyError && (
              <p className={styles.fieldError} role="alert">
                {allergyError}
              </p>
            )}
          </fieldset>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="kid-medical-notes">
              Notas médicas <span className={styles.optional}>Opcional</span>
            </label>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              id="kid-medical-notes"
              name="medicalNotes"
              onChange={(event) => setField("medicalNotes", event.target.value)}
              placeholder="Indicaciones, medicación, contactos…"
              value={values.medicalNotes}
            />
          </div>

          <label className={styles.consentOption}>
            <input
              checked={values.photoConsent}
              name="photoConsent"
              onChange={(event) =>
                setField("photoConsent", event.target.checked)
              }
              type="checkbox"
              value="true"
            />
            <span>Cuenta con consentimiento para fotos</span>
          </label>
        </form>
      </section>
    </main>
  );
}
