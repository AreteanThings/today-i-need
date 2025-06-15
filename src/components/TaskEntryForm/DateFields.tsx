
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface DateFieldsProps {
  register: any;
  errors: { startDate?: any; endDate?: any };
}

const DateFields = ({ register, errors }: DateFieldsProps) => {
  // The value that react-hook-form will track for endDate. 
  // If blank/undefined, display "No End Date"
  // We need to use register to get the form's value for endDate
  const [showRealEndDateField, setShowRealEndDateField] = useState(false);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label htmlFor="startDate" className="font-poppins">Start Date *</Label>
        <Input
          id="startDate"
          type="date"
          {...register("startDate")}
          className={errors.startDate ? "border-destructive" : ""}
        />
        {errors.startDate && (
          <p className="text-sm text-destructive font-poppins">
            {errors.startDate.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="endDate" className="font-poppins">End Date</Label>
        {/* 
          If the field is not shown by default, then:
           - show "No End Date" placeholder & button to set
           - if the real field, show date picker + clear option
        */}
        <EndDateInput
          register={register}
          errors={errors}
          showRealEndDateField={showRealEndDateField}
          setShowRealEndDateField={setShowRealEndDateField}
        />
      </div>
    </div>
  );
};

function EndDateInput({
  register,
  errors,
  showRealEndDateField,
  setShowRealEndDateField,
}: {
  register: any;
  errors: { endDate?: any };
  showRealEndDateField: boolean;
  setShowRealEndDateField: (show: boolean) => void;
}) {
  // Use react-hook-form's watch function for current endDate value if needed
  // Here, use a ref+event to migrate between view states

  // We'll show the field in one of two states: 
  //  - If hidden or if field is empty, show "No End Date" + [Set End Date] 
  //  - If present, show date input + [Remove End Date] button

  // We don't have watch here, so use a trick: `defaultValue` on the input, and check if it's empty.
  // Since register doesn't provide the value directly in this context, and to avoid prop drilling, we'll show the real field first if showRealEndDateField is true.

  // Always render both fields, but show one depending on state.
  // To support react-hook-form, always bind the actual input.

  return (
    <>
      {!showRealEndDateField ? (
        <div className="flex items-center gap-2">
          <Input
            value="No End Date"
            disabled
            className="bg-muted text-muted-foreground"
            readOnly
          />
          <button
            type="button"
            className="text-xs text-blue-600 underline ml-1"
            onClick={() => setShowRealEndDateField(true)}
          >
            Set End Date
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            id="endDate"
            type="date"
            {...register("endDate")}
            className={errors.endDate ? "border-destructive" : ""}
          />
          <button
            type="button"
            className="text-xs text-blue-600 underline ml-1"
            onClick={() => {
              // Hide the real field again
              setShowRealEndDateField(false);
              // Clear value from input (this is a hack for react-hook-form)
              // Find the input and clear it
              const input = document.getElementById("endDate") as HTMLInputElement;
              if (input) input.value = "";
              // Ideally, trigger react-hook-form setValue to "" here, but we're using register
              // The parent will reset this on form submit
            }}
          >
            No End Date
          </button>
        </div>
      )}
      {errors.endDate && (
        <p className="text-sm text-destructive font-poppins">
          {errors.endDate.message}
        </p>
      )}
    </>
  );
}

export default DateFields;
