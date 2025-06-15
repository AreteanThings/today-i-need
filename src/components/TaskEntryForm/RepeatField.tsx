
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import CustomRepeatModal from "../CustomRepeatModal";

interface RepeatFieldProps {
  repeatValue: string;
  setRepeatValue: (val: string) => void;
  customRepeatOpen: boolean;
  setCustomRepeatOpen: (open: boolean) => void;
  customRrule?: string;
  setCustomRrule: (r: string) => void;
  customRruleText?: string;
  setCustomRruleText: (text: string) => void;
}

const RepeatField = ({
  repeatValue,
  setRepeatValue,
  customRepeatOpen,
  setCustomRepeatOpen,
  customRrule,
  setCustomRrule,
  customRruleText,
  setCustomRruleText,
}: RepeatFieldProps) => {
  // Removed auto-open logic for custom modal (was previously using useEffect and prevRepeatValue)

  const handleApplyCustomRepeat = (rruleString: string, previewText: string) => {
    setCustomRrule(rruleString);
    setCustomRruleText(previewText);
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
      {repeatValue === "custom" && (customRruleText || customRrule) && (
        <div className="mt-2 bg-accent/20 p-2 rounded font-poppins text-xs flex items-center gap-2">
          {customRruleText ? (
            <>Custom: <span className="font-semibold">{customRruleText}</span></>
          ) : (
            <>Custom: <span className="font-mono">{customRrule}</span></>
          )}
          <button
            type="button"
            onClick={() => setCustomRepeatOpen(true)}
            className="ml-2 px-2 py-1 text-foreground bg-accent rounded hover:bg-accent/50 border border-border text-xs"
          >
            Edit
          </button>
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
