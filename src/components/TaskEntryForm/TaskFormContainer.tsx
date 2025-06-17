
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { useTasks } from "@/hooks/useTasks";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/types/task";
import TaskFormFields from "./TaskFormFields";
import FormActions from "./FormActions";
import CustomRepeatModal from "../CustomRepeatModal";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  subtitle: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  repeatValue: z.enum(["daily", "weekly", "monthly", "yearly", "custom"]),
  isShared: z.boolean().default(false),
  customRrule: z.string().optional(),
  customRruleText: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormContainerProps {
  editingTask?: Task;
  onCancel: () => void;
  onSuccess?: () => void;
}

const TaskFormContainer = ({ editingTask, onCancel, onSuccess }: TaskFormContainerProps) => {
  const { addTask, updateTask, categories } = useTasks();
  const { toast } = useToast();
  const [isCustomRepeatOpen, setIsCustomRepeatOpen] = useState(false);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: editingTask?.title || "",
      category: editingTask?.category || "",
      subtitle: editingTask?.subtitle || "",
      startDate: editingTask?.startDate || new Date().toISOString().split('T')[0],
      endDate: editingTask?.endDate || "",
      repeatValue: editingTask?.repeatValue || "daily",
      isShared: editingTask?.isShared || false,
      customRrule: editingTask?.customRrule || "",
      customRruleText: editingTask?.customRruleText || "",
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    try {
      // Ensure all required fields are present for TaskBaseInput
      const taskData = {
        title: data.title,
        category: data.category,
        subtitle: data.subtitle || "",
        startDate: data.startDate,
        endDate: data.endDate || "",
        repeatValue: data.repeatValue,
        isShared: data.isShared,
        customRrule: data.customRrule || "",
        customRruleText: data.customRruleText || "",
      };

      if (editingTask) {
        await updateTask(editingTask.id, taskData);
      } else {
        await addTask(taskData);
      }
      onSuccess?.();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleCustomRepeatSave = (rrule: string, description: string) => {
    form.setValue("customRrule", rrule);
    form.setValue("customRruleText", description);
    form.setValue("repeatValue", "custom");
    setIsCustomRepeatOpen(false);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <TaskFormFields 
            form={form} 
            categories={categories} 
            editingTask={editingTask} 
          />
          <FormActions 
            onCancel={onCancel}
            isEditing={!!editingTask}
            onCustomRepeat={() => setIsCustomRepeatOpen(true)}
            repeatValue={form.watch("repeatValue")}
          />
        </form>
      </Form>

      <CustomRepeatModal
        open={isCustomRepeatOpen}
        onClose={() => setIsCustomRepeatOpen(false)}
        onApply={handleCustomRepeatSave}
        initialRRule={form.getValues("customRrule")}
      />
    </>
  );
};

export default TaskFormContainer;
