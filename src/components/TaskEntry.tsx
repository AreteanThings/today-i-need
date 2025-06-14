import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTasks } from "@/hooks/useTasks";
import CustomRepeatModal from "./CustomRepeatModal";
import { getRRuleText } from "@/utils/getRRuleText";

const taskSchema = z.object({
  category: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  repeatValue: z.enum(["daily", "weekly", "monthly", "yearly", "custom"]),
  isShared: z.boolean().default(false),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskEntryProps {
  onClose: () => void;
  editingTask?: any;
}

const TaskEntry = ({ onClose, editingTask }: TaskEntryProps) => {
  const { toast } = useToast();
  const { addTask, updateTask, tasks, categories } = useTasks();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      category: "",
      title: "",
      subtitle: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      repeatValue: "daily" as const,
      isShared: false,
    },
  });

  // New state for custom repeat modal and rrule
  const [customRepeatOpen, setCustomRepeatOpen] = useState(false);
  const [customRrule, setCustomRrule] = useState<string | undefined>(editingTask?.customRrule);

  // When switching to "custom", open the modal.
  useEffect(() => {
    if (watch("repeatValue") === "custom") {
      setCustomRepeatOpen(true);
    }
  }, [watch("repeatValue")]);

  // When user applies custom rule, close the modal and save to state
  const handleApplyCustomRepeat = (rruleString: string) => {
    setCustomRrule(rruleString);
    setCustomRepeatOpen(false);
  };

  useEffect(() => {
    if (editingTask) {
      reset({
        category: editingTask.category,
        title: editingTask.title,
        subtitle: editingTask.subtitle || "",
        startDate: editingTask.startDate,
        endDate: editingTask.endDate || "",
        repeatValue: editingTask.repeatValue,
        isShared: editingTask.isShared,
      });
      setCustomRrule(editingTask.customRrule || '');
    }
  }, [editingTask, reset]);

  const onSubmit = (data: TaskFormData) => {
    // Check for duplicate title (excluding current task if editing)
    const existingTask = tasks.find(
      (task) => 
        task.title === data.title && 
        task.isActive && 
        (!editingTask || task.id !== editingTask.id)
    );

    if (existingTask) {
      toast({
        title: "Duplicate Task",
        description: "You already have an active task with that title. Please choose a different title.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingTask) {
        updateTask(editingTask.id, {
          ...data,
          customRrule: data.repeatValue === "custom" ? customRrule : undefined,
          endDate: data.endDate || undefined
        });
        toast({
          title: "Task Updated",
          description: "Your task has been updated successfully.",
        });
      } else {
        const taskData = {
          category: data.category,
          title: data.title,
          subtitle: data.subtitle || "",
          startDate: data.startDate,
          endDate: data.endDate || undefined,
          repeatValue: data.repeatValue,
          isShared: data.isShared,
          customRrule: data.repeatValue === "custom" ? customRrule : undefined,
        };
        addTask(taskData);
        toast({
          title: "Task Created",
          description: "Your task has been created successfully.",
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem saving your task.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="header-gradient text-white p-4 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCancel}
            className="hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold font-poppins">
            {editingTask ? "Edit Task" : "Task Entry"}
          </h1>
        </div>

        {/* Form */}
        <div className="p-4 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="font-poppins">Category *</Label>
              <Input
                id="category"
                {...register("category")}
                placeholder="Enter category"
                list="categories"
                className={errors.category ? "border-destructive" : ""}
              />
              <datalist id="categories">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
              {errors.category && (
                <p className="text-sm text-destructive font-poppins">{errors.category.message}</p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="font-poppins">Title *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Enter task title"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive font-poppins">{errors.title.message}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="subtitle" className="font-poppins">Notes</Label>
              <Textarea
                id="subtitle"
                {...register("subtitle")}
                placeholder="Enter notes (optional)"
                rows={2}
              />
            </div>

            {/* Start Date and End Date on the same line */}
            <div className="grid grid-cols-2 gap-3">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate" className="font-poppins">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  className={errors.startDate ? "border-destructive" : ""}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive font-poppins">{errors.startDate.message}</p>
                )}
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="endDate" className="font-poppins">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  placeholder="Leave blank for indefinite"
                />
              </div>
            </div>

            {/* Repeat Value */}
            <div className="space-y-2">
              <Label htmlFor="repeatValue" className="font-poppins">Repeat *</Label>
              <Select
                value={watch("repeatValue")}
                onValueChange={(value) => setValue("repeatValue", value as any)}
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
              {/* Show preview if custom */}
              {watch("repeatValue") === "custom" && customRrule && (
                <div className="mt-2 bg-accent/20 p-2 rounded font-poppins text-xs">
                  {getRRuleText(customRrule) 
                    ? <>Custom: <span className="font-semibold">{getRRuleText(customRrule)}</span></> 
                    : <>Custom: <span className="font-mono">{customRrule}</span></>
                  }
                </div>
              )}
            </div>

            {/* Share */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isShared"
                checked={watch("isShared")}
                onCheckedChange={(checked) => setValue("isShared", !!checked)}
              />
              <Label htmlFor="isShared" className="font-poppins">Share this task</Label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1 font-poppins bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Task
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel} 
                className="font-poppins hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 hover:text-white hover:border-blue-700 transition-all hover:bg-none"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
      {/* Custom Repeat Modal (show if needed) */}
      <CustomRepeatModal
        open={customRepeatOpen}
        onClose={() => setCustomRepeatOpen(false)}
        onApply={handleApplyCustomRepeat}
        initialRRule={customRrule}
      />
    </div>
  );
};

export default TaskEntry;
