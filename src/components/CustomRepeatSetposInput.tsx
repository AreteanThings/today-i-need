
import { Input } from "@/components/ui/input";

interface CustomRepeatSetposInputProps {
  bysetpos: string;
  onSetposChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CustomRepeatSetposInput({
  bysetpos,
  onSetposChange,
}: CustomRepeatSetposInputProps) {
  return (
    <div>
      <label className="font-poppins block mb-2">Which (optional)</label>
      <Input
        type="number"
        placeholder="e.g., 1 for first, 2 for second"
        value={bysetpos}
        onChange={onSetposChange}
        className="w-32"
      />
      <p className="text-xs text-muted-foreground">e.g. "2" and "Tuesday" for "Second Tuesday"</p>
    </div>
  );
}
