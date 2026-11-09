export const ALLERGY_OPTIONS = [
  { value: "peanut", label: "Maní" },
  { value: "lactose", label: "Lactosa" },
  { value: "gluten", label: "Gluten" },
] as const;

export type AllergyTag = (typeof ALLERGY_OPTIONS)[number]["value"];
export type RoomName = "Soles" | "Nubes" | "Prados";
export type ChildStatus = "active" | "archived";

export type RoomRecord = {
  id: string;
  daycare_id: string;
  name: RoomName;
  created_at: string;
};

export type ChildRecord = {
  id: string;
  room_id: string;
  full_name: string;
  birth_date: string;
  enrolled_at: string;
  medical_notes: string | null;
  allergy_tags: AllergyTag[];
  photo_consent: boolean;
  status: ChildStatus;
  created_at: string;
  updated_at: string;
};

export type ChildWithRoom = ChildRecord & {
  room: Pick<RoomRecord, "id" | "name">;
};

export type ChildListRecord = Pick<
  ChildRecord,
  "id" | "room_id" | "full_name" | "birth_date" | "allergy_tags" | "status"
> & {
  room: Pick<RoomRecord, "id" | "name">;
};
