
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface TaskEntryHeaderProps {
  onCancel: () => void;
  editingTask?: any;
}

export default function TaskEntryHeader({ onCancel, editingTask }: TaskEntryHeaderProps) {
  return (
    <div className="header-gradient text-white p-4 flex items-center gap-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="hover:bg-white/20 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h1 className="text-xl font-bold font-poppins">
        {editingTask ? "Edit Task" : "Task Entry"}
      </h1>
    </div>
  );
}
