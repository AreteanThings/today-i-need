
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

// Supabase includes access_token in the URL hash when user clicks the reset link from their email,
// so user will arrive at /reset-password. Show enter new password form.
const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const [complete, setComplete] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });

    setSubmitting(false);

    if (error) {
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setComplete(true);
      toast({
        title: "Password updated",
        description: "You can now log in with your new password.",
      });
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
  };

  // If the user clicks the link but has already used it, Supabase may return "Invalid or expired link."
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set a new password</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input
              id="new-password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={submitting || complete}
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              disabled={submitting || complete}
            >
              {submitting ? "Saving..." : "Set New Password"}
            </Button>
          </CardFooter>
        </form>
        {complete && (
          <div className="text-green-700 text-center mt-3 text-sm">
            Password updated! Redirecting to sign in...
          </div>
        )}
      </Card>
    </div>
  );
};

export default ResetPassword;
