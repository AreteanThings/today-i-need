import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import RRule, { rrulestr, Weekday } from "rrule";

// Map string codes to RRule weekday instances
const WEEKDAY_CODES = [
  { label: "Monday", code: "MO" },
  { label: "Tuesday", code: "TU" },
  { label: "Wednesday", code: "WE" },
  { label: "Thursday", code: "TH" },
  { label: "Friday", code: "FR" },
  { label: "Saturday", code: "SA" },
  { label: "Sunday", code: "SU" },
];

const codeToRRuleWeekday = (code: string) => {
  switch (code) {
    case "MO": return RRule.MO;
    case "TU": return RRule.TU;
    case "WE": return RRule.WE;
    case "TH": return RRule.TH;
    case "FR": return RRule.FR;
    case "SA": return RRule.SA;
    case "SU": return RRule.SU;
    default: return undefined;
  }
};

type CustomRepeatModalProps = {
  open: boolean;
  onClose: () => void;
  onApply: (rruleString: string) => void;
  initialRRule?: string;
};

export default function CustomRepeatModal({ open, onClose, onApply, initialRRule }: CustomRepeatModalProps) {
  const [freq, setFreq] = useState<RRule.Frequency>(RRule.DAILY);
  const [interval, setInterval] = useState(1);
  // Use weekday code strings like "MO", "TU", etc.
  const [byweekday, setByweekday] = useState<string[]>([]);
  const [bysetpos, setBysetpos] = useState<string>('');
  const [rruleString, setRRuleString] = useState<string>(initialRRule || '');

  // Parse initial rule if provided
  useEffect(() => {
    if (initialRRule) setRRuleString(initialRRule);
  }, [initialRRule]);

  // build the RRULE string
  const buildRRuleString = () => {
    let options: Partial<RRule.Options> = {
      freq,
      interval,
    };

    if (freq === RRule.WEEKLY && byweekday.length > 0) {
      options.byweekday = byweekday.map(code => codeToRRuleWeekday(code));
    }

    if ((freq === RRule.MONTHLY || freq === RRule.YEARLY) && bysetpos && byweekday.length > 0) {
      // e.g., 2nd Tuesday = bysetpos: 2, byweekday: TU.nth(2)
      options.byweekday = byweekday.map(code => codeToRRuleWeekday(code)?.nth(parseInt(bysetpos, 10)));
    }

    const rule = new RRule(options);
    return rule.toString();
  };

  // Whenever options change, update RRULE preview
  function updatePreview() {
    const ruleStr = buildRRuleString();
    setRRuleString(ruleStr);
  }

  // Handlers
  const handleFreqChange = (val: string) => {
    setFreq(Number(val));
    setByweekday([]);
    setBysetpos('');
    setTimeout(updatePreview, 0);
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setInterval(isNaN(val) ? 1 : Math.max(1, val));
    setTimeout(updatePreview, 0);
  };

  const handleWeekdayToggle = (code: string) => {
    setByweekday(prev => {
      const next = prev.includes(code) ? prev.filter(x => x !== code) : [...prev, code];
      setTimeout(updatePreview, 0);
      return next;
    });
  };

  const handleSetposChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBysetpos(e.target.value);
    setTimeout(updatePreview, 0);
  };

  const handleApply = () => {
    onApply(rruleString);
    onClose();
  };

  // Live preview text
  let preview = "";
  try {
    const r = rrulestr(rruleString);
    preview = r.toText();
  } catch {
    preview = "";
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Custom Recurrence</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Frequency */}
          <div>
            <label className="font-poppins block mb-2">Repeat</label>
            <Select value={freq.toString()} onValueChange={handleFreqChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={RRule.DAILY.toString()}>Daily</SelectItem>
                <SelectItem value={RRule.WEEKLY.toString()}>Weekly</SelectItem>
                <SelectItem value={RRule.MONTHLY.toString()}>Monthly</SelectItem>
                <SelectItem value={RRule.YEARLY.toString()}>Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Interval */}
          <div>
            <label className="font-poppins block mb-2">Every</label>
            <Input type="number" min={1} value={interval} onChange={handleIntervalChange} className="w-20 inline-block mr-2" />
            <span className="text-muted-foreground">
              {freq === RRule.DAILY && "day(s)"}
              {freq === RRule.WEEKLY && "week(s)"}
              {freq === RRule.MONTHLY && "month(s)"}
              {freq === RRule.YEARLY && "year(s)"}
            </span>
          </div>
          {/* Weekdays, if Weekly or Monthly/Yearly (for nth-weekday) */}
          {(freq === RRule.WEEKLY || freq === RRule.MONTHLY || freq === RRule.YEARLY) && (
            <div>
              <label className="font-poppins block mb-2">On</label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAY_CODES.map(wd => (
                  <Button
                    key={wd.code}
                    type="button"
                    variant={byweekday.includes(wd.code) ? "default" : "outline"}
                    className="font-poppins"
                    onClick={() => handleWeekdayToggle(wd.code)}
                  >
                    {wd.label.slice(0, 2)}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {/* nth 'setpos' for Monthly/Yearly */}
          {(freq === RRule.MONTHLY || freq === RRule.YEARLY) && (
            <div>
              <label className="font-poppins block mb-2">Which (optional)</label>
              <Input
                type="number"
                placeholder="e.g., 1 for first, 2 for second"
                value={bysetpos}
                onChange={handleSetposChange}
                className="w-32"
              />
              <p className="text-xs text-muted-foreground">e.g. "2" and "Tuesday" for "Second Tuesday"</p>
            </div>
          )}
          {/* Preview */}
          <div className="mt-4 bg-accent/20 p-3 rounded font-poppins">
            <div className="text-muted-foreground text-sm mb-1">Preview:</div>
            <span>{preview || rruleString}</span>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button onClick={handleApply}>Apply</Button>
          <DialogClose asChild>
            <Button variant="outline" type="button">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
