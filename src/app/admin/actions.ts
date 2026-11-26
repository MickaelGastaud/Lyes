"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function markLeadHandled(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (id) await db.lead.update({ where: { id }, data: { handled: true } });
  revalidatePath("/admin");
}
