
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSharedContacts } from "@/hooks/useSharedContacts";

interface TaskShareContactsFieldProps {
  selectedEmails: string[];
  setSelectedEmails: (emails: string[]) => void;
}

const TaskShareContactsField = ({ selectedEmails, setSelectedEmails }: TaskShareContactsFieldProps) => {
  const { contacts, loading, getContacts, addContact } = useSharedContacts();
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getContacts();
    // eslint-disable-next-line
  }, []);

  const handleAddExistingContact = (email: string) => {
    if (!selectedEmails.includes(email)) {
      setSelectedEmails([...selectedEmails, email]);
    }
  };

  const handleRemoveEmail = (email: string) => {
    setSelectedEmails(selectedEmails.filter(e => e !== email));
  };

  const handleAddNewEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || selectedEmails.includes(newEmail)) return;
    setAdding(true);
    await addContact(newEmail);
    setSelectedEmails([...selectedEmails, newEmail]);
    setNewEmail("");
    setAdding(false);
  };

  return (
    <div className="border rounded-md p-3 mt-2 bg-muted/30">
      <Label className="block mb-2 font-poppins">Share With</Label>
      <div className="mb-2">
        {contacts.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {contacts.map(contact => (
              <Button
                key={contact.contact_email}
                size="sm"
                variant={selectedEmails.includes(contact.contact_email) ? "default" : "outline"}
                type="button"
                className="px-2 py-1"
                onClick={() => handleAddExistingContact(contact.contact_email)}
                disabled={selectedEmails.includes(contact.contact_email)}
              >
                {contact.contact_email}
              </Button>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">{loading ? "Loading contacts..." : "No contacts yet."}</span>
        )}
      </div>

      <form onSubmit={handleAddNewEmail} className="flex gap-2 items-center mb-2">
        <Input
          type="email"
          value={newEmail}
          onChange={e => setNewEmail(e.target.value)}
          placeholder="Add another email"
          className="flex-1"
          disabled={adding}
        />
        <Button
          size="sm"
          type="submit"
          disabled={!newEmail || adding}
        >
          Add
        </Button>
      </form>

      {selectedEmails.length > 0 && (
        <div className="mt-1">
          <div className="text-xs text-muted-foreground mb-1">Currently shared with:</div>
          <ul className="flex flex-wrap gap-2">
            {selectedEmails.map(email => (
              <li key={email}>
                <span className="inline-flex items-center rounded bg-accent px-2 py-1 text-xs font-mono">
                  {email}
                  <button
                    onClick={() => handleRemoveEmail(email)}
                    className="ml-1 text-destructive hover:underline"
                    type="button"
                    title="Remove"
                  >
                    &times;
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TaskShareContactsField;

