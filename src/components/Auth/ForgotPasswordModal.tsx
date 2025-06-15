
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const ForgotPasswordModal = ({ open, onClose }: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSubmitted(false);

    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setSending(false);

    if (error) {
      toast({
        title: "Error sending reset email",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSubmitted(true);
    }
  };

  if (!open) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-sm p-6 relative">
        <button
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-xl font-medium mb-2">Reset your password</h2>
        <form onSubmit={handleSend} className="space-y-3" autoComplete="new-password">
          {/* Hidden dummy input */}
          <input type="password" style={{ display: 'none' }} />
          
          <Label htmlFor="fp-email">Email address</Label>
          <Input
            id="fp-email"
            name="fp-email-unique"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={sending}
            autoComplete="new-password"
            data-lpignore="true"
            data-1p-ignore="true"
          />
          <Button
            type="submit"
            className="w-full"
            disabled={sending || !email}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Send reset email
          </Button>
        </form>
        {submitted && (
          <div className="text-green-600 text-sm mt-3">
            If there's an account with that email, a reset link has been sent.
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
