
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import CustomRepeatModal from "../CustomRepeatModal";
import { getRRuleText } from "@/utils/getRRuleText";
import { useEffect } from "react";
import { repairCustomRrule } from "@/utils/repairCustomRrule";

interface RepeatFieldProps {
  repeatValue: string;
  setRepeatValue: (val: string) => void;
  customRepeatOpen: boolean;
  setCustomRepeatOpen: (open: boolean) => void;
  customRrule?: string;
  setCustomRrule: (r: string) => void;
}

const RepeatField = ({
  repeatValue,
  setRepeatValue,
  customRepeatOpen,
  setCustomRepeatOpen,
  customRrule,
  setCustomRrule,
}: RepeatFieldProps) => {
  // Only auto-open custom modal if user selects "custom" from dropdown, not on initial mount/edit
  const prevRepeatValue = React.useRef<string>(repeatValue);
  const didMount = React.useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      prevRepeatValue.current = repeatValue;
      return;
    }
    if (repeatValue === "custom" && prevRepeatValue.current !== "custom") {
      setCustomRepeatOpen(true);
    }
    prevRepeatValue.current = repeatValue;
  }, [repeatValue, setCustomRepeatOpen]);

  const handleApplyCustomRepeat = (rruleString: string) => {
    setCustomRrule(rruleString);
    setCustomRepeatOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="repeatValue" className="font-poppins">Repeat *</Label>
      <Select
        value={repeatValue}
        onValueChange={val => setRepeatValue(val)}
      >
        <SelectTrigger className="font-poppins">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily" className="font-poppins">Daily</SelectItem>
          <SelectItem value="weekly" className="font-poppins">Weekly</SelectItem>
          <SelectItem value="monthly" className="font-poppins">Monthly</SelectItem>
          <SelectItem value="yearly" className="font-poppins">Yearly</SelectItem>
          <SelectItem value="custom" className="font-poppins">Custom</SelectItem>
        </SelectContent>
      </Select>
      {repeatValue === "custom" && customRrule && (
        <div className="mt-2 bg-accent/20 p-2 rounded font-poppins text-xs">
          {/* Ensure we use repaired, and capitalize */}
          {(() => {
            const repaired = repairCustomRrule(customRrule);
            let text = getRRuleText(repaired);
            if (text && text.length > 0) {
              text = text.charAt(0).toUpperCase() + text.slice(1);
            }
            return text
              ? <>Custom: <span className="font-semibold">{text}</span></>
              : <>Custom: <span className="font-mono">{customRrule}</span></>;
          })()}
        </div>
      )}
      <CustomRepeatModal
        open={customRepeatOpen}
        onClose={() => setCustomRepeatOpen(false)}
        onApply={handleApplyCustomRepeat}
        initialRRule={customRrule}
      />
    </div>
  );
};

export default RepeatField;
