
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import * as RRuleLib from "rrule";

interface CustomRepeatFrequencySelectProps {
  freq: number;
  onChange: (val: string) => void;
}

export default function CustomRepeatFrequencySelect({ freq, onChange }: CustomRepeatFrequencySelectProps) {
  return (
    <div>
      <label className="font-poppins block mb-2">Repeat</label>
      <Select value={freq.toString()} onValueChange={onChange}>
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
  );
}
