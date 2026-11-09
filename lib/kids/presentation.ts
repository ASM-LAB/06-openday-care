import { ALLERGY_OPTIONS } from "./types";
import type { AllergyTag } from "./types";

const allergyLabels = new Map<AllergyTag, string>(
  ALLERGY_OPTIONS.map(({ value, label }) => [value, label]),
);

export function getAllergyLabel(tag: string): string {
  return allergyLabels.get(tag as AllergyTag) ?? tag;
}

export function getChildAge(birthDate: string, today = new Date()): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!match) {
    return "Edad no disponible";
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  let months =
    (today.getFullYear() - year) * 12 + today.getMonth() + 1 - month;

  if (today.getDate() < day) {
    months -= 1;
  }
  if (months < 0) {
    return "Edad no disponible";
  }

  if (months < 12) {
    return `${months} ${months === 1 ? "mes" : "meses"}`;
  }

  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? "año" : "años"}`;
}

export function formatChildDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return value;
  }

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return new Intl.DateTimeFormat("es", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(date);
}
