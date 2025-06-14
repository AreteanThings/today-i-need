
import { rrulestr } from "rrule";

/**
 * Converts a RRULE string (e.g., "RRULE:FREQ=WEEKLY;INTERVAL=2") into plain English using rrule's toText()
 * Returns undefined if the string is invalid.
 */
export function getRRuleText(rruleString?: string): string | undefined {
  if (!rruleString) return undefined;
  try {
    // Normalize: Always ensure "RRULE:" prefix for parsing
    let rule: ReturnType<typeof rrulestr>;
    try {
      rule = rrulestr(rruleString.startsWith("RRULE:") ? rruleString : "RRULE:" + rruleString);
      return rule.toText();
    } catch {
      // Fallback: try parsing as-is just in case
      rule = rrulestr(rruleString);
      return rule.toText();
    }
  } catch {
    return undefined;
  }
}
