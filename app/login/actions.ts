"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type LoginActionState = {
  fieldErrors?: {
    email?: string;
    password?: string;
  };
  message?: string;
} | null;

const INVALID_CREDENTIALS_MESSAGE = "El email o la contraseña son incorrectos.";
const OPERATIONAL_ERROR_MESSAGE =
  "No pudimos conectar con el servicio de inicio de sesión. Intentá nuevamente.";

function getSafeRedirectPath(value: FormDataEntryValue | null) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/";
  }

  try {
    const baseUrl = "https://opendaycare.invalid";
    const destination = new URL(value, baseUrl);
    const isProtectedPath =
      destination.pathname === "/" ||
      destination.pathname === "/kids" ||
      destination.pathname.startsWith("/kids/");

    if (destination.origin !== baseUrl || !isProtectedPath) {
      return "/";
    }

    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return "/";
  }
}

function isConfigurationError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.startsWith("Supabase is not configured.")
  );
}

function isCredentialRejection(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 400
  );
}

export async function signIn(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");
  const email = typeof rawEmail === "string" ? rawEmail.trim() : "";
  const password = typeof rawPassword === "string" ? rawPassword : "";

  const fieldErrors: NonNullable<LoginActionState>["fieldErrors"] = {};

  if (!email) {
    fieldErrors.email = "Ingresá tu email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Ingresá una dirección de email válida.";
  }

  if (!password) {
    fieldErrors.password = "Ingresá tu contraseña.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return {
        message: isCredentialRejection(error)
          ? INVALID_CREDENTIALS_MESSAGE
          : OPERATIONAL_ERROR_MESSAGE,
      };
    }
  } catch (error) {
    return {
      message: isConfigurationError(error)
        ? "El inicio de sesión no está configurado. Contactá a soporte."
        : OPERATIONAL_ERROR_MESSAGE,
    };
  }

  redirect(getSafeRedirectPath(formData.get("next")));
}
