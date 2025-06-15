
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
  watch?: (name: string) => any;
}

const DateFields = ({ register, errors, setValue, watch }: DateFieldsProps) => {
  // Use watch and setValue props to get and set field values
  // Fallback values (should not hit in actual app but prevents undefined)
  let startDateValue: string | null = "";
  let endDateValue: string | null = "";

  if (watch) {
    startDateValue = watch("startDate");
    endDateValue = watch("endDate");
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label htmlFor="startDate" className="font-poppins">
          Start Date *
        </Label>
        <StartDatePickerField
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
        <EndDatePickerField
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

// Start Date: always a normal date button, never "No End Date"
function StartDatePickerField({
  name,
  label,
  required,
  error,
  value,
  onChange,
}: {
  name: string;
  label: string;
  required: boolean;
  error: any;
  value: string | null | undefined;
  onChange: (date: string | undefined) => void;
}) {
  let dateValue: Date | undefined = undefined;
  if (value && value.length > 0) {
    dateValue = parseISO(value);
  } else {
    // Default to today if not set
    dateValue = new Date();
  }

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
              "w-full pl-3 pr-3 justify-start text-left font-normal" +
              (error ? " border-destructive" : "")
            }
            aria-label={label}
          >
            <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
            <span>
              {dateValue ? format(dateValue, "PPP") : ""}
            </span>
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
              }
            }}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// End Date: shows "No End Date" when none is present, in italic and muted style
function EndDatePickerField({
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
  let dateValue: Date | undefined = undefined;
  if (value && value.length > 0) {
    // Accept ISO only
    dateValue = parseISO(value);
  }

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
              "w-full pl-3 pr-3 justify-start text-left font-normal" +
              (!dateValue
                ? " text-muted-foreground bg-muted italic"
                : "") +
              (error ? " border-destructive" : "")
            }
            aria-label={label}
          >
            <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
            {dateValue ? (
              <span>{format(dateValue, "PPP")}</span>
            ) : (
              <span>No End Date</span>
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
                onChange(""); // Remove end date
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
