
import { getRRuleText } from "./getRRuleText";

/**
 * Normalize/repair broken customRrule values for display and storage.
 * Always returns a "RRULE:..." string if repairable, else the original.
 */
export function repairCustomRrule(rrule?: string): string | undefined {
  if (!rrule) return undefined;
  let fixed = rrule.trim();
  // Try both with and without prefix to fix common mistakes
  for (const candidate of [fixed, fixed.startsWith("RRULE:") ? fixed : "RRULE:" + fixed]) {
    try {
      // Use getRRuleText to check if it's parsable
      if (getRRuleText(candidate)) return candidate.startsWith("RRULE:") ? candidate : "RRULE:" + fixed;
    } catch {
      // continue
    }
  }
  // Not repairable, return as-is
  return fixed;
}
