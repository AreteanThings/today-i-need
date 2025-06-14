
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface NotesFieldProps {
  register: any;
}

const NotesField = ({ register }: NotesFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor="subtitle" className="font-poppins">Notes</Label>
    <Textarea
      id="subtitle"
      {...register("subtitle")}
      placeholder="Enter notes (optional)"
      rows={2}
    />
  </div>
);

export default NotesField;
