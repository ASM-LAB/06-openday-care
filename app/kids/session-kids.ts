export const SESSION_KIDS_KEY = "opendaycare:kids:v1";

export type SessionKid = {
  id: string;
  name: string;
  birthDate: string;
  room: "Soles";
  allergies: string[];
  medicalNotes: string;
};

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function isValidBirthDate(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
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

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth[month - 1]
  ) {
    return false;
  }

  const today = new Date();
  const todayString = [
    today.getFullYear().toString().padStart(4, "0"),
    (today.getMonth() + 1).toString().padStart(2, "0"),
    today.getDate().toString().padStart(2, "0"),
  ].join("-");

  return value <= todayString;
}

export function isSessionKid(value: unknown): value is SessionKid {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const kid = value as Record<string, unknown>;
  return (
    typeof kid.id === "string" &&
    kid.id.length > 0 &&
    typeof kid.name === "string" &&
    kid.name.length > 0 &&
    kid.name.trim() === kid.name &&
    isValidBirthDate(kid.birthDate) &&
    kid.room === "Soles" &&
    Array.isArray(kid.allergies) &&
    kid.allergies.every(
      (allergy) => typeof allergy === "string" && allergy.trim().length > 0,
    ) &&
    typeof kid.medicalNotes === "string"
  );
}
