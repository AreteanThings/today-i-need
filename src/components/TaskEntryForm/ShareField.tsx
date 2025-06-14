
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ShareFieldProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const ShareField = ({ checked, onCheckedChange }: ShareFieldProps) => (
  <div className="flex items-center space-x-2">
    <Checkbox
      id="isShared"
      checked={checked}
      onCheckedChange={onCheckedChange}
    />
    <Label htmlFor="isShared" className="font-poppins">Share this task</Label>
  </div>
);

export default ShareField;
