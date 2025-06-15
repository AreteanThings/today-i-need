import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { CalendarIcon, XIcon } from "lucide-react";
import React from "react";

interface DateFieldsProps {
  register: any;
  errors: { startDate?: any; endDate?: any };
  setValue?: (name: string, value: any) => void;
  watch?: any;
}

const DateFields = ({ register, errors }: DateFieldsProps) => {
  // These must be props if using react-hook-form context, else just watch as optional support.
  // fallback if not provided (for testing/legacy)
  let startDateValue: string | null = "";
  let endDateValue: string | null = "";
  let setValue: ((name: string, value: any) => void) | undefined;
  let watch: any;

  // For react-hook-form context support
  if ((window as any).lovable_rhf_context) {
    // This block is for Lovable internal override, ignore in real usage.
    const { setValue: rhfSetValue, watch: rhfWatch } = (window as any).lovable_rhf_context;
    setValue = rhfSetValue;
    watch = rhfWatch;
    startDateValue = watch("startDate");
    endDateValue = watch("endDate");
  } else if (typeof register === "object" && "name" in register) {
    // legacy pattern
    setValue = register.setValue;
    watch = register.watch;
    startDateValue = watch("startDate");
    endDateValue = watch("endDate");
  } else {
    // Most usage (as in current TaskEntryForm)
    if (typeof register === "function" && typeof arguments[0] === "object") {
      const { setValue: propSetValue, watch: propWatch } = arguments[0];
      setValue = propSetValue;
      watch = propWatch;
      if (watch) {
        startDateValue = watch("startDate");
        endDateValue = watch("endDate");
      }
    }
  }

  // Accept context for setValue and watch if passed
  if ("setValue" in arguments[0] && typeof arguments[0]?.setValue === "function") {
    setValue = arguments[0].setValue;
  }
  if ("watch" in arguments[0] && typeof arguments[0]?.watch === "function") {
    watch = arguments[0].watch;
    startDateValue = watch("startDate");
    endDateValue = watch("endDate");
  }

  // (If those are not available, fall back to just trying to get the registered values)
  // In real app, these are passed via props from useForm.

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label htmlFor="startDate" className="font-poppins">
          Start Date *
        </Label>
        <DatePickerField
          name="startDate"
          label="Start Date"
          required
          error={errors.startDate}
          value={startDateValue}
          onChange={date => setValue && setValue("startDate", date)}
        />
        {errors.startDate && (
          <p className="text-sm text-destructive font-poppins">
            {errors.startDate.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="endDate" className="font-poppins">
          End Date
        </Label>
        <DatePickerField
          name="endDate"
          label="End Date"
          required={false}
          error={errors.endDate}
          value={endDateValue}
          onChange={date => setValue && setValue("endDate", date)}
          allowClear
        />
        {errors.endDate && (
          <p className="text-sm text-destructive font-poppins">
            {errors.endDate.message}
          </p>
        )}
      </div>
    </div>
  );
};

// Reusable field for both Start and End date
function DatePickerField({
  name,
  label,
  required,
  error,
  value,
  onChange,
  allowClear = false,
}: {
  name: string;
  label: string;
  required: boolean;
  error: any;
  value: string | null | undefined;
  onChange: (date: string | undefined) => void;
  allowClear?: boolean;
}) {
  // Parse the value prop. Keep undefined if blank.
  let dateValue: Date | undefined = undefined;
  if (value && value.length > 0) {
    // Accept ISO only
    dateValue = parseISO(value);
  }
  const formatted = dateValue ? format(dateValue, "yyyy-MM-dd") : "";

  // To manage popover open/close state
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            type="button"
            className={
              "w-full pl-3 pr-3 justify-start text-left font-normal " +
              (dateValue
                ? ""
                : " text-muted-foreground bg-muted") +
              (error ? " border-destructive" : "")
            }
            aria-label={label}
          >
            <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
            {dateValue ? (
              <span>{format(dateValue, "PPP")}</span>
            ) : (
              <span className="italic">No End Date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={selected => {
              setOpen(false);
              if (selected) {
                // convert to yyyy-MM-dd format for form
                const iso = format(selected, "yyyy-MM-dd");
                onChange(iso);
              } else {
                onChange("");
              }
            }}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {allowClear && dateValue && (
        <button
          type="button"
          aria-label="Clear date"
          onClick={() => onChange("")}
          className="ml-1 rounded hover:bg-accent/50 p-1 text-muted-foreground"
        >
          <XIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default DateFields;
