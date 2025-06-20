
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateFieldsProps {
  register: any;
  errors: { startDate?: any; };
}

const DateFields = ({ register, errors }: DateFieldsProps) => (
  <div className="grid grid-cols-2 gap-3">
    <div className="space-y-2">
      <Label htmlFor="startDate" className="font-poppins">Start Date *</Label>
      <Input
        id="startDate"
        type="date"
        {...register("startDate")}
        className={errors.startDate ? "border-destructive" : ""}
      />
      {errors.startDate && (
        <p className="text-sm text-destructive font-poppins">
          {errors.startDate.message}
        </p>
      )}
    </div>
    <div className="space-y-2">
      <Label htmlFor="endDate" className="font-poppins">End Date</Label>
      <Input
        id="endDate"
        type="date"
        {...register("endDate")}
        placeholder="Leave blank for indefinite"
      />
    </div>
  </div>
);

export default DateFields;
