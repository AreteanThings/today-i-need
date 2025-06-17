
import React from "react";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onCancel: () => void;
  isEditing: boolean;
  onCustomRepeat: () => void;
  repeatValue: string;
}

const FormActions = ({ onCancel, isEditing, onCustomRepeat, repeatValue }: FormActionsProps) => {
  return (
    <div className="flex gap-3 pt-4">
      <Button
        type="submit"
        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0"
      >
        {isEditing ? "Update Task" : "Create Task"}
      </Button>
      
      {repeatValue === "custom" && (
        <Button
          type="button"
          variant="outline"
          onClick={onCustomRepeat}
          className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 hover:text-white hover:border-blue-700"
        >
          Custom Repeat
        </Button>
      )}
      
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 hover:text-white hover:border-blue-700"
      >
        Cancel
      </Button>
    </div>
  );
};

export default FormActions;
