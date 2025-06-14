
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

// Fix: Use import * as RRuleLib for universal access to static/class members
import * as RRuleLib from "rrule";

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

// Map code to Weekday instance
const codeToRRuleWeekday = (code: string): RRuleLib.Weekday | undefined => {
  switch (code) {
    case "MO": return RRuleLib.RRule.MO;
    case "TU": return RRuleLib.RRule.TU;
    case "WE": return RRuleLib.RRule.WE;
    case "TH": return RRuleLib.RRule.TH;
    case "FR": return RRuleLib.RRule.FR;
    case "SA": return RRuleLib.RRule.SA;
    case "SU": return RRuleLib.RRule.SU;
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
  const [freq, setFreq] = useState<number>(RRuleLib.RRule.DAILY);
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
    let options: Partial<RRuleLib.RRule.Options> = {
      freq,
      interval,
    };

    if (freq === RRuleLib.RRule.WEEKLY && byweekday.length > 0) {
      options.byweekday = byweekday.map(code => codeToRRuleWeekday(code));
    }

    if ((freq === RRuleLib.RRule.MONTHLY || freq === RRuleLib.RRule.YEARLY) && bysetpos && byweekday.length > 0) {
      // e.g., 2nd Tuesday = bysetpos: 2, byweekday: TU.nth(2)
      options.byweekday = byweekday.map(code => codeToRRuleWeekday(code)?.nth(parseInt(bysetpos, 10)));
    }

    // Create rule via RRuleLib.RRule
    const rule = new RRuleLib.RRule(options);
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
    const r = RRuleLib.rrulestr(rruleString);
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
                <SelectItem value={RRuleLib.RRule.DAILY.toString()}>Daily</SelectItem>
                <SelectItem value={RRuleLib.RRule.WEEKLY.toString()}>Weekly</SelectItem>
                <SelectItem value={RRuleLib.RRule.MONTHLY.toString()}>Monthly</SelectItem>
                <SelectItem value={RRuleLib.RRule.YEARLY.toString()}>Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Interval */}
          <div>
            <label className="font-poppins block mb-2">Every</label>
            <Input type="number" min={1} value={interval} onChange={handleIntervalChange} className="w-20 inline-block mr-2" />
            <span className="text-muted-foreground">
              {freq === RRuleLib.RRule.DAILY && "day(s)"}
              {freq === RRuleLib.RRule.WEEKLY && "week(s)"}
              {freq === RRuleLib.RRule.MONTHLY && "month(s)"}
              {freq === RRuleLib.RRule.YEARLY && "year(s)"}
            </span>
          </div>
          {/* Weekdays, if Weekly or Monthly/Yearly (for nth-weekday) */}
          {(freq === RRuleLib.RRule.WEEKLY || freq === RRuleLib.RRule.MONTHLY || freq === RRuleLib.RRule.YEARLY) && (
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
          {(freq === RRuleLib.RRule.MONTHLY || freq === RRuleLib.RRule.YEARLY) && (
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

// ... done!

