
import { supabase } from "@/integrations/supabase/client";

// Fetch all shared contacts for the current user (owner)
export async function fetchSharedContacts(ownerId: string) {
  const { data, error } = await supabase
    .from("shared_contacts")
    .select("*")
    .eq("owner_id", ownerId)
    .order("last_shared_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Add a shared contact (adds or updates if already exists)
export async function addSharedContact(ownerId: string, contactEmail: string) {
  const { data, error } = await supabase
    .from("shared_contacts")
    .upsert({
      owner_id: ownerId,
      contact_email: contactEmail,
      last_shared_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
