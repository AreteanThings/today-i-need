
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TitleFieldProps {
  register: any;
  error?: string;
}

const TitleField = ({ register, error }: TitleFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor="title" className="font-poppins">Title *</Label>
    <Input
      id="title"
      {...register("title")}
      placeholder="Enter task title"
      className={error ? "border-destructive" : ""}
    />
    {error && (
      <p className="text-sm text-destructive font-poppins">{error}</p>
    )}
  </div>
);

export default TitleField;
