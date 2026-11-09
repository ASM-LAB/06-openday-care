"use client";

import { useActionState } from "react";
import { setChildStatus } from "./actions";
import type { ChildStatusActionState } from "./actions";
import styles from "./kids.module.css";

type ChildStatusFormProps = {
  childId: string;
  currentStatus: "active" | "archived";
};

const emptyState: ChildStatusActionState = {};

export default function ChildStatusForm({
  childId,
  currentStatus,
}: ChildStatusFormProps) {
  const [state, formAction, pending] = useActionState(
    setChildStatus,
    emptyState,
  );
  const nextStatus = currentStatus === "active" ? "archived" : "active";

  return (
    <div className={styles.statusAction}>
      <form action={formAction}>
        <input type="hidden" name="id" value={childId} />
        <input type="hidden" name="status" value={nextStatus} />
        <button
          className={styles.statusActionButton}
          disabled={pending}
          type="submit"
        >
          {pending
            ? "Guardando…"
            : nextStatus === "archived"
              ? "Archivar"
              : "Reactivar"}
        </button>
      </form>
      {state.message && (
        <p className={styles.statusActionError} role="alert" aria-live="polite">
          {state.message}
        </p>
      )}
    </div>
  );
}
