
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { fetchSharedContacts, addSharedContact } from "@/lib/sharedContacts";

export interface SharedContact {
  id: string;
  owner_id: string;
  contact_email: string;
  last_shared_at: string | null;
}

export function useSharedContacts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<SharedContact[]>([]);
  const [loading, setLoading] = useState(false);

  // View shared contacts
  const getContacts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchSharedContacts(user.id);
      setContacts(data);
    } catch (err: any) {
      toast({
        title: "Failed to load shared contacts",
        description: err.message || "An error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a new shared contact
  const addContact = async (contactEmail: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await addSharedContact(user.id, contactEmail);
      toast({
        title: "Contact added!",
        description: `Shared contact ${result.contact_email} was added.`,
      });
      await getContacts(); // Refresh
    } catch (err: any) {
      toast({
        title: "Failed to add contact",
        description: err.message || "An error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    contacts,
    loading,
    getContacts,
    addContact,
  };
}
