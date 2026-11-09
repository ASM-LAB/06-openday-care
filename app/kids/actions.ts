"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { requireKidsStaff } from "@/lib/supabase/require-auth";
import { ALLERGY_OPTIONS } from "@/lib/kids/types";
import type { AllergyTag, ChildStatus } from "@/lib/kids/types";

type KidField =
  | "fullName"
  | "birthDate"
  | "roomId"
  | "enrolledAt"
  | "allergyTags";

export type KidFormState = {
  message?: string;
  errors?: Partial<Record<KidField, string>>;
};

export type ChildStatusActionState = {
  message?: string;
};

type KidInput = {
  fullName: string;
  birthDate: string;
  roomId: string;
  enrolledAt: string;
  allergyTags: AllergyTag[];
  medicalNotes: string | null;
  photoConsent: boolean;
};

const allergyTagValues = new Set<string>(
  ALLERGY_OPTIONS.map(({ value }) => value),
);

function getString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function isRealDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1) {
    return false;
  }

  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    leapYear ? 29 : 28,
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

  return day <= daysInMonth[month - 1];
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function parseKidInput(formData: FormData): {
  input: KidInput | null;
  errors: KidFormState["errors"];
} {
  const fullName = getString(formData, "fullName").trim();
  const birthDate = getString(formData, "birthDate");
  const roomId = getString(formData, "roomId");
  const enrolledAt = getString(formData, "enrolledAt");
  const medicalNotes = getString(formData, "medicalNotes").trim();
  const selectedTags = formData.getAll("allergyTags");
  const errors: NonNullable<KidFormState["errors"]> = {};

  if (!fullName) {
    errors.fullName = "Escribe el nombre del niño.";
  }

  if (!birthDate) {
    errors.birthDate = "Selecciona una fecha de nacimiento.";
  } else if (!isRealDate(birthDate)) {
    errors.birthDate = "Escribe una fecha de nacimiento válida.";
  } else if (birthDate > new Date().toISOString().slice(0, 10)) {
    errors.birthDate = "La fecha de nacimiento no puede ser futura.";
  }

  if (!roomId || !isUuid(roomId)) {
    errors.roomId = "Selecciona una sala válida.";
  }

  if (!enrolledAt || !isRealDate(enrolledAt)) {
    errors.enrolledAt = "Selecciona una fecha de ingreso válida.";
  }

  const allergyTags: AllergyTag[] = [];
  for (const selectedTag of selectedTags) {
    if (typeof selectedTag !== "string" || !allergyTagValues.has(selectedTag)) {
      errors.allergyTags = "Selecciona solo las alergias disponibles.";
      break;
    }
    if (!allergyTags.includes(selectedTag as AllergyTag)) {
      allergyTags.push(selectedTag as AllergyTag);
    }
  }

  if (Object.keys(errors).length > 0) {
    return { input: null, errors };
  }

  return {
    input: {
      fullName,
      birthDate,
      roomId,
      enrolledAt,
      allergyTags,
      medicalNotes: medicalNotes || null,
      photoConsent: getString(formData, "photoConsent") === "true",
    },
    errors: undefined,
  };
}

async function validateRoom(
  input: KidInput,
  daycareId: string,
  supabase: Awaited<ReturnType<typeof requireKidsStaff>>["supabase"],
): Promise<KidFormState | null> {
  const { data: room, error } = await supabase
    .from("rooms")
    .select("id")
    .eq("id", input.roomId)
    .eq("daycare_id", daycareId)
    .maybeSingle();

  if (error) {
    return {
      message: "No se pudo verificar la sala. Tus valores siguen en el formulario; inténtalo de nuevo.",
    };
  }

  if (!room) {
    return { errors: { roomId: "Selecciona una sala válida." } };
  }

  return null;
}

export async function createKid(
  _previousState: KidFormState,
  formData: FormData,
): Promise<KidFormState> {
  const { supabase, daycareId } = await requireKidsStaff();
  const { input, errors } = parseKidInput(formData);
  if (!input) {
    return { errors };
  }

  const roomError = await validateRoom(input, daycareId, supabase);
  if (roomError) {
    return roomError;
  }

  const { error } = await supabase.from("children").insert({
    room_id: input.roomId,
    full_name: input.fullName,
    birth_date: input.birthDate,
    enrolled_at: input.enrolledAt,
    medical_notes: input.medicalNotes,
    allergy_tags: input.allergyTags,
    photo_consent: input.photoConsent,
  });

  if (error) {
    return {
      message: "No se pudo guardar el niño. Tus valores siguen en el formulario; inténtalo de nuevo.",
    };
  }

  revalidatePath("/kids");
  redirect("/kids");
}

export async function updateKid(
  _previousState: KidFormState,
  formData: FormData,
): Promise<KidFormState> {
  const { supabase, daycareId } = await requireKidsStaff();
  const id = getString(formData, "id");
  if (!isUuid(id)) {
    notFound();
  }

  const { input, errors } = parseKidInput(formData);
  if (!input) {
    return { errors };
  }

  const roomError = await validateRoom(input, daycareId, supabase);
  if (roomError) {
    return roomError;
  }

  const { data, error } = await supabase
    .from("children")
    .update({
      room_id: input.roomId,
      full_name: input.fullName,
      birth_date: input.birthDate,
      enrolled_at: input.enrolledAt,
      medical_notes: input.medicalNotes,
      allergy_tags: input.allergyTags,
      photo_consent: input.photoConsent,
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      message: "No se pudo actualizar el niño. Tus valores siguen en el formulario; inténtalo de nuevo.",
    };
  }

  revalidatePath("/kids");
  revalidatePath(`/kids/${id}`);
  revalidatePath(`/kids/${id}/editar`);
  redirect(`/kids/${id}`);
}

export async function setChildStatus(
  _previousState: ChildStatusActionState,
  formData: FormData,
): Promise<ChildStatusActionState> {
  const { supabase } = await requireKidsStaff();
  const id = getString(formData, "id");
  const status = getString(formData, "status");

  if (!isUuid(id) || (status !== "active" && status !== "archived")) {
    return { message: "No se pudo actualizar el estado del niño." };
  }

  const { data, error } = await supabase
    .from("children")
    .update({ status: status as ChildStatus })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { message: "No se pudo actualizar el estado del niño. Inténtalo de nuevo." };
  }

  revalidatePath("/kids");
  revalidatePath(`/kids/${id}`);
  revalidatePath(`/kids/${id}/editar`);
  redirect(status === "archived" ? "/kids" : "/kids?status=archived");
}
