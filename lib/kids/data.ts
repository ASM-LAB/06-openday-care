import "server-only";

import { requireKidsStaff } from "@/lib/supabase/require-auth";
import type { ChildStatus } from "./types";

export type {
  AllergyTag,
  ChildListRecord,
  ChildRecord,
  ChildStatus,
  ChildWithRoom,
  RoomName,
  RoomRecord,
} from "./types";

export async function getRoomsForStaff() {
  const { supabase, daycareId } = await requireKidsStaff();

  return supabase
    .from("rooms")
    .select("id, name")
    .eq("daycare_id", daycareId)
    .order("name");
}

export async function getChildrenForStaff(status?: ChildStatus) {
  const { supabase } = await requireKidsStaff();

  let query = supabase
    .from("children")
    .select(
      "id, room_id, full_name, birth_date, allergy_tags, status, room:rooms!children_room_id_fkey(id, name)",
    )
    .order("full_name");

  if (status) {
    query = query.eq("status", status);
  }

  return query;
}

export async function getKidsPageData(status: ChildStatus) {
  const staff = await requireKidsStaff();
  const [roomsResult, childrenResult] = await Promise.all([
    staff.supabase
      .from("rooms")
      .select("id, name")
      .eq("daycare_id", staff.daycareId)
      .order("name"),
    staff.supabase
      .from("children")
      .select(
        "id, room_id, full_name, birth_date, allergy_tags, status, room:rooms!children_room_id_fkey(id, name)",
      )
      .eq("status", status)
      .order("full_name"),
  ]);

  return {
    user: staff,
    rooms: roomsResult,
    children: childrenResult,
  };
}

export async function getChildPageData(id: string) {
  const staff = await requireKidsStaff();
  const child = await staff.supabase
    .from("children")
    .select(
      "id, room_id, full_name, birth_date, enrolled_at, medical_notes, allergy_tags, photo_consent, status, created_at, updated_at, room:rooms!children_room_id_fkey(id, name)",
    )
    .eq("id", id)
    .maybeSingle();

  return { user: staff, child };
}

export async function getChildForStaff(id: string) {
  const { supabase } = await requireKidsStaff();

  return supabase
    .from("children")
    .select(
      "id, room_id, full_name, birth_date, enrolled_at, medical_notes, allergy_tags, photo_consent, status, created_at, updated_at, room:rooms!children_room_id_fkey(id, name)",
    )
    .eq("id", id)
    .maybeSingle();
}
