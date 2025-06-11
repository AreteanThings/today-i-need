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
          endDate: data.endDate || undefined, // Convert empty string to undefined
        });
        toast({
          title: "Task Updated",
          description: "Your task has been updated successfully.",
        });
      } else {
        // Create the task data with all required fields
        const taskData = {
          category: data.category,
          title: data.title,
          subtitle: data.subtitle || "",
          startDate: data.startDate,
          endDate: data.endDate || undefined, // Convert empty string to undefined
          repeatValue: data.repeatValue,
          isShared: data.isShared,
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
        <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">
            {editingTask ? "Edit Task" : "Task Entry"}
          </h1>
        </div>

        {/* Form */}
        <div className="p-4 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
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
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Enter task title"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea
                id="subtitle"
                {...register("subtitle")}
                placeholder="Enter subtitle (optional)"
                rows={2}
              />
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
                className={errors.startDate ? "border-destructive" : ""}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate.message}</p>
              )}
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                {...register("endDate")}
                placeholder="Leave blank for indefinite"
              />
            </div>

            {/* Repeat Value */}
            <div className="space-y-2">
              <Label htmlFor="repeatValue">Repeat *</Label>
              <Select
                value={watch("repeatValue")}
                onValueChange={(value) => setValue("repeatValue", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Share */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isShared"
                checked={watch("isShared")}
                onCheckedChange={(checked) => setValue("isShared", !!checked)}
              />
              <Label htmlFor="isShared">Share this task</Label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save Task
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskEntry;
