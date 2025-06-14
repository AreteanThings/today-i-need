
import { Button } from "@/components/ui/button";

const WEEKDAY_CODES = [
  { label: "Monday", code: "MO" },
  { label: "Tuesday", code: "TU" },
  { label: "Wednesday", code: "WE" },
  { label: "Thursday", code: "TH" },
  { label: "Friday", code: "FR" },
  { label: "Saturday", code: "SA" },
  { label: "Sunday", code: "SU" },
];

interface CustomRepeatWeekdaySelectorProps {
  byweekday: string[];
  onWeekdayToggle: (code: string) => void;
}

export default function CustomRepeatWeekdaySelector({
  byweekday,
  onWeekdayToggle,
}: CustomRepeatWeekdaySelectorProps) {
  return (
    <div>
      <label className="font-poppins block mb-2">On</label>
      <div className="flex flex-wrap gap-2">
        {WEEKDAY_CODES.map((wd) => (
          <Button
            key={wd.code}
            type="button"
            variant={byweekday.includes(wd.code) ? "default" : "outline"}
            className="font-poppins"
            onClick={() => onWeekdayToggle(wd.code)}
          >
            {wd.label.slice(0, 2)}
          </Button>
        ))}
      </div>
    </div>
  );
}
