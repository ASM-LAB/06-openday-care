"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  isSessionKid,
  SESSION_KIDS_KEY,
  type SessionKid,
} from "../session-kids";
import styles from "./agregar.module.css";

type FormValues = {
  name: string;
  birthDate: string;
  room: "Soles";
  allergies: string;
  medicalNotes: string;
};

type FormErrors = Partial<Record<"name" | "birthDate" | "room", string>>;

const initialValues: FormValues = {
  name: "",
  birthDate: "",
  room: "Soles",
  allergies: "",
  medicalNotes: "",
};

function isRealDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const daysInMonth = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1];
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function isFutureDate(value: string): boolean {
  const today = new Date();
  const todayString = [
    today.getFullYear().toString().padStart(4, "0"),
    (today.getMonth() + 1).toString().padStart(2, "0"),
    today.getDate().toString().padStart(2, "0"),
  ].join("-");

  return value > todayString;
}

export default function AddKidPage() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [storageError, setStorageError] = useState<string | null>(null);

  function updateField<Field extends keyof FormValues>(
    field: Field,
    value: FormValues[Field],
  ) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setStorageError(null);
    setErrors((currentErrors) => {
      if (!(field in currentErrors)) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field as keyof FormErrors];
      return nextErrors;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStorageError(null);

    const nextErrors: FormErrors = {};
    if (!values.name.trim()) {
      nextErrors.name = "Escribe el nombre del niño.";
    }

    if (!values.birthDate) {
      nextErrors.birthDate = "Selecciona una fecha de nacimiento.";
    } else if (!isRealDate(values.birthDate)) {
      nextErrors.birthDate = "Escribe una fecha de nacimiento válida.";
    } else if (isFutureDate(values.birthDate)) {
      nextErrors.birthDate = "La fecha de nacimiento no puede ser futura.";
    }

    if (values.room !== "Soles") {
      nextErrors.room = "Selecciona la sala Soles.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      const storedKids = window.sessionStorage.getItem(SESSION_KIDS_KEY);
      let existingKids: SessionKid[] = [];

      if (storedKids !== null) {
        const parsedKids: unknown = JSON.parse(storedKids);
        if (!Array.isArray(parsedKids) || !parsedKids.every(isSessionKid)) {
          throw new Error("Stored kids have an invalid format.");
        }
        existingKids = parsedKids;
      }

      const newKid: SessionKid = {
        id: window.crypto.randomUUID(),
        name: values.name.trim(),
        birthDate: values.birthDate,
        room: "Soles",
        allergies: values.allergies
          .split(",")
          .map((allergy) => allergy.trim())
          .filter((allergy) => allergy.length > 0),
        medicalNotes: values.medicalNotes,
      };

      window.sessionStorage.setItem(
        SESSION_KIDS_KEY,
        JSON.stringify([...existingKids, newKid]),
      );
    } catch {
      setStorageError(
        "No se pudieron guardar los datos. Tus valores siguen en el formulario; inténtalo de nuevo.",
      );
      return;
    }

    router.push("/kids");
  }

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="add-kid-title">
        <header className={styles.header}>
          <Link className={styles.cancelLink} href="/kids">
            Cancelar
          </Link>
          <h1 className={styles.title} id="add-kid-title">
            Agregar niño
          </h1>
          <button
            className={styles.saveButton}
            type="submit"
            form="add-kid-form"
          >
            Guardar
          </button>
        </header>

        <form
          className={styles.form}
          id="add-kid-form"
          noValidate
          onSubmit={handleSubmit}
        >
          {storageError && (
            <p className={styles.storageError} role="alert">
              {storageError}
            </p>
          )}

          <p className={styles.privacyNotice}>
            Solo para pruebas: no ingreses datos reales de salud.
          </p>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="kid-name">
              Nombre completo <span className={styles.required}>Obligatorio</span>
            </label>
            <input
              aria-describedby={errors.name ? "kid-name-error" : undefined}
              aria-invalid={Boolean(errors.name)}
              autoComplete="off"
              className={styles.input}
              id="kid-name"
              name="name"
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Ej. Martina López"
              required
              type="text"
              value={values.name}
            />
            {errors.name && (
              <p className={styles.fieldError} id="kid-name-error" role="alert">
                {errors.name}
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
                  errors.birthDate ? "kid-birth-date-error" : undefined
                }
                aria-invalid={Boolean(errors.birthDate)}
                className={styles.input}
                id="kid-birth-date"
                name="birthDate"
                onChange={(event) =>
                  updateField("birthDate", event.target.value)
                }
                required
                type="date"
                value={values.birthDate}
              />
              {errors.birthDate && (
                <p
                  className={styles.fieldError}
                  id="kid-birth-date-error"
                  role="alert"
                >
                  {errors.birthDate}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="kid-room">
                Sala <span className={styles.required}>Obligatorio</span>
              </label>
              <select
                aria-describedby={errors.room ? "kid-room-error" : undefined}
                aria-invalid={Boolean(errors.room)}
                className={`${styles.input} ${styles.select}`}
                id="kid-room"
                name="room"
                onChange={(event) =>
                  updateField("room", event.target.value as "Soles")
                }
                required
                value={values.room}
              >
                <option value="Soles">Soles</option>
              </select>
              {errors.room && (
                <p className={styles.fieldError} id="kid-room-error" role="alert">
                  {errors.room}
                </p>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="kid-allergies">
              Alergias (etiquetas) <span className={styles.optional}>Opcional</span>
            </label>
            <input
              className={styles.input}
              id="kid-allergies"
              name="allergies"
              onChange={(event) => updateField("allergies", event.target.value)}
              placeholder="Ej. Maní, Lactosa"
              type="text"
              value={values.allergies}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="kid-medical-notes">
              Notas médicas <span className={styles.optional}>Opcional</span>
            </label>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              id="kid-medical-notes"
              name="medicalNotes"
              onChange={(event) =>
                updateField("medicalNotes", event.target.value)
              }
              placeholder="Indicaciones, medicación, contactos…"
              value={values.medicalNotes}
            />
          </div>
        </form>
      </section>
    </main>
  );
}
