
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

interface FormActionsProps {
  onCancel: () => void;
  isSubmitting?: boolean;
}

const FormActions = ({ onCancel, isSubmitting }: FormActionsProps) => (
  <div className="flex gap-3 pt-4">
    <Button
      type="submit"
      className="flex-1 font-poppins bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0"
      disabled={isSubmitting}
    >
      <Save className="h-4 w-4 mr-2" />
      Save Task
    </Button>
    <Button
      type="button"
      variant="outline"
      onClick={onCancel}
      className="font-poppins hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 hover:text-white hover:border-blue-700 transition-all hover:bg-none"
    >
      <X className="h-4 w-4 mr-2" />
      Cancel
    </Button>
  </div>
);

export default FormActions;
