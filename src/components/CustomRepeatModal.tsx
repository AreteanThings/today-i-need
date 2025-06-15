
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lazyLoadRRule } from "@/utils/bundleOptimization";
import CustomRepeatFrequencySelect from "./CustomRepeatFrequencySelect";
import CustomRepeatWeekdaySelector from "./CustomRepeatWeekdaySelector";
import CustomRepeatSetposInput from "./CustomRepeatSetposInput";

const WEEKDAY_CODES = [
  { label: "Monday", code: "MO" },
  { label: "Tuesday", code: "TU" },
  { label: "Wednesday", code: "WE" },
  { label: "Thursday", code: "TH" },
  { label: "Friday", code: "FR" },
  { label: "Saturday", code: "SA" },
  { label: "Sunday", code: "SU" },
];

type CustomRepeatModalProps = {
  open: boolean;
  onClose: () => void;
  onApply: (rruleString: string) => void;
  initialRRule?: string;
};

export default function CustomRepeatModal({ open, onClose, onApply, initialRRule }: CustomRepeatModalProps) {
  const [RRuleLib, setRRuleLib] = useState<any>(null);
  const [freq, setFreq] = useState<number>(1); // Default to DAILY
  const [interval, setInterval] = useState(1);
  const [byweekday, setByweekday] = useState<string[]>([]);
  const [bysetpos, setBysetpos] = useState<string>('');
  const [rruleString, setRRuleString] = useState<string>(initialRRule || '');

  // Lazy load RRule library
  useEffect(() => {
    if (open && !RRuleLib) {
      lazyLoadRRule().then(setRRuleLib);
    }
  }, [open, RRuleLib]);

  // Parse initialRRule when dialog opens
  useEffect(() => {
    if (open && initialRRule && RRuleLib) {
      try {
        const rruleObj = RRuleLib.rrulestr(initialRRule.startsWith('RRULE:') ? initialRRule : ('RRULE:' + initialRRule));
        setFreq(rruleObj.options.freq);
        setInterval(rruleObj.options.interval || 1);

        if (Array.isArray(rruleObj.options.byweekday)) {
          let bywd = rruleObj.options.byweekday.map((wd: any) =>
            typeof wd === "number" ? WEEKDAY_CODES[wd]?.code : wd?.toString().slice(0, 2)
          ).filter(Boolean);
          setByweekday(bywd);
        } else {
          setByweekday([]);
        }

        if (rruleObj.options.bysetpos) {
          setBysetpos(String(rruleObj.options.bysetpos));
        } else {
          setBysetpos("");
        }

        setRRuleString(initialRRule.startsWith("RRULE:") ? initialRRule : "RRULE:" + initialRRule);
      } catch {
        setFreq(1); // DAILY
        setInterval(1);
        setByweekday([]);
        setBysetpos('');
        setRRuleString(initialRRule);
      }
    }
  }, [open, initialRRule, RRuleLib]);

  // Update RRULE string when state changes
  useEffect(() => {
    if (!RRuleLib) return;

    const buildRRuleString = () => {
      // Map code to Weekday instance
      const codeToRRuleWeekday = (code: string) => {
        const weekdayMap: { [key: string]: any } = {
          "MO": RRuleLib.RRule.MO,
          "TU": RRuleLib.RRule.TU,
          "WE": RRuleLib.RRule.WE,
          "TH": RRuleLib.RRule.TH,
          "FR": RRuleLib.RRule.FR,
          "SA": RRuleLib.RRule.SA,
          "SU": RRuleLib.RRule.SU,
        };
        return weekdayMap[code];
      };

      let options: any = {
        freq,
        interval,
      };

      if (freq === RRuleLib.RRule.WEEKLY && byweekday.length > 0) {
        options.byweekday = byweekday.map(code => codeToRRuleWeekday(code));
      }
      if ((freq === RRuleLib.RRule.MONTHLY || freq === RRuleLib.RRule.YEARLY) && bysetpos && byweekday.length > 0) {
        options.byweekday = byweekday.map(code => codeToRRuleWeekday(code)?.nth(parseInt(bysetpos, 10)));
      }
      
      const rule = new RRuleLib.RRule(options);
      return rule.toString().startsWith("RRULE:") ? rule.toString() : "RRULE:" + rule.toString();
    };

    const ruleStr = buildRRuleString();
    setRRuleString(ruleStr);
  }, [freq, interval, byweekday, bysetpos, RRuleLib]);

  const handleFreqChange = (val: string) => {
    setFreq(Number(val));
    setByweekday([]);
    setBysetpos('');
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setInterval(isNaN(val) ? 1 : Math.max(1, val));
  };

  const handleWeekdayToggle = (code: string) => {
    setByweekday(prev =>
      prev.includes(code)
        ? prev.filter(x => x !== code)
        : [...prev, code]
    );
  };

  const handleSetposChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBysetpos(e.target.value);
  };

  const handleApply = () => {
    const repaired = rruleString && !rruleString.startsWith("RRULE:") ? "RRULE:" + rruleString : rruleString;
    onApply(repaired);
    onClose();
  };

  let preview = "";
  if (RRuleLib) {
    try {
      const r = RRuleLib.rrulestr(rruleString);
      preview = r.toText();
      if (preview && preview.length > 0) {
        preview = preview.charAt(0).toUpperCase() + preview.slice(1);
      }
    } catch {
      preview = "";
    }
  }

  if (!RRuleLib) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p>Loading recurrence options...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Custom Recurrence</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <CustomRepeatFrequencySelect freq={freq} onChange={handleFreqChange} />

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

          {(freq === RRuleLib.RRule.WEEKLY || freq === RRuleLib.RRule.MONTHLY || freq === RRuleLib.RRule.YEARLY) && (
            <CustomRepeatWeekdaySelector byweekday={byweekday} onWeekdayToggle={handleWeekdayToggle} />
          )}

          {(freq === RRuleLib.RRule.MONTHLY || freq === RRuleLib.RRule.YEARLY) && (
            <CustomRepeatSetposInput bysetpos={bysetpos} onSetposChange={handleSetposChange} />
          )}

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
