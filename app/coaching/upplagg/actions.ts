"use server";

import { revalidatePath } from "next/cache";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createPackage(name: string): Promise<{ ok: boolean; error?: string }> {
  await requireCoach();

  const trimmed = name.trim();
  if (!trimmed) {
    return { ok: false, error: "Namn krävs." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("client_packages").insert({ customer_name: trimmed });

  if (error) {
    console.error("createPackage — kunde inte spara:", error);
    return { ok: false, error: "Kunde inte skapa upplägget." };
  }

  revalidatePath("/coaching/upplagg");
  return { ok: true };
}

export type PackagePatch = {
  customer_name?: string;
  sessions_used?: number;
  sessions_purchased?: number;
  note_1?: string;
  note_2?: string;
};

export async function updatePackage(
  id: string,
  patch: PackagePatch,
): Promise<{ ok: boolean; error?: string }> {
  await requireCoach();

  const admin = createAdminClient();
  const { error } = await admin.from("client_packages").update(patch).eq("id", id);

  if (error) {
    console.error("updatePackage — kunde inte spara:", error);
    return { ok: false, error: "Kunde inte spara ändringen." };
  }

  revalidatePath("/coaching/upplagg");
  return { ok: true };
}

export async function setPackageStatus(id: string, status: "active" | "inactive" | "completed") {
  await requireCoach();

  const admin = createAdminClient();
  const { error } = await admin.from("client_packages").update({ status }).eq("id", id);
  if (error) {
    console.error("setPackageStatus — kunde inte uppdatera:", error);
  }

  revalidatePath("/coaching/upplagg");
}

export async function deletePackage(id: string) {
  await requireCoach();

  const admin = createAdminClient();
  const { error } = await admin.from("client_packages").delete().eq("id", id);
  if (error) {
    console.error("deletePackage — kunde inte ta bort:", error);
  }

  revalidatePath("/coaching/upplagg");
}
