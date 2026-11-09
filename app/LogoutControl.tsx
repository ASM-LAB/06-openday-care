"use client";

import { useActionState, type ReactNode } from "react";
import { signOut } from "./logout-actions";

type LogoutControlProps = {
  buttonClassName: string;
  errorClassName: string;
  formClassName: string;
  children: ReactNode;
};

export function LogoutControl({
  buttonClassName,
  errorClassName,
  formClassName,
  children,
}: LogoutControlProps) {
  const [state, formAction, pending] = useActionState(signOut, null);

  return (
    <form className={formClassName} action={formAction}>
      <button
        className={buttonClassName}
        type="submit"
        aria-label={pending ? "Cerrando sesión" : "Cerrar sesión"}
        title={pending ? "Cerrando sesión" : "Cerrar sesión"}
        aria-busy={pending}
        disabled={pending}
      >
        {children}
      </button>
      {state?.error && (
        <p className={errorClassName} role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
