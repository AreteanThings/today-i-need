
import { supabase } from "@/integrations/supabase/client";

// Fetch emails a task is shared with
export async function getTaskShares(taskId: string) {
  const { data, error } = await supabase
    .from("task_shares")
    .select("contact_email")
    .eq("task_id", taskId);
  if (error) throw error;
  return data.map((row: { contact_email: string }) => row.contact_email);
}

// Add (or replace) shared emails for a task
export async function setTaskShares(taskId: string, ownerId: string, emails: string[]) {
  // Fetch current
  const { data: existing, error: getErr } = await supabase
    .from("task_shares")
    .select("contact_email")
    .eq("task_id", taskId)
    .eq("owner_id", ownerId);

  if (getErr) throw getErr;
  const existingEmails = existing?.map((row: { contact_email: string }) => row.contact_email) ?? [];

  // Delete removed
  const toDelete = existingEmails.filter(email => !emails.includes(email));
  if (toDelete.length > 0) {
    const { error: delErr } = await supabase
      .from("task_shares")
      .delete()
      .eq("task_id", taskId)
      .eq("owner_id", ownerId)
      .in("contact_email", toDelete);
    if (delErr) throw delErr;
  }

  // Add new
  const toAdd = emails.filter(email => !existingEmails.includes(email));
  if (toAdd.length > 0) {
    const inserts = toAdd.map(email => ({
      task_id: taskId,
      owner_id: ownerId,
      contact_email: email,
    }));
    const { error: addErr } = await supabase.from("task_shares").insert(inserts);
    if (addErr) throw addErr;
  }
}
