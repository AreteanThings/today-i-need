
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { useTasks } from "@/hooks/useTasks";
import { useToast } from "@/hooks/use-toast";
import { useTaskSharing } from "@/hooks/useTaskSharing";
import { Task } from "@/types/task";
import { TaskSharingData } from "@/types/sharing";
import TaskFormFields from "./TaskFormFields";
import TaskFormActions from "./TaskFormActions";
import TaskSharingModal from "../TaskSharing/TaskSharingModal";
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
  const { shareTask } = useTaskSharing();
  const { toast } = useToast();
  const [isCustomRepeatOpen, setIsCustomRepeatOpen] = useState(false);
  const [isSharingModalOpen, setIsSharingModalOpen] = useState(false);
  const [pendingSharingData, setPendingSharingData] = useState<TaskSharingData | null>(null);
  const [createdTask, setCreatedTask] = useState<Task | null>(null);

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
        
        // If there's pending sharing data, share the task
        if (pendingSharingData) {
          await shareTask(editingTask.id, pendingSharingData);
          setPendingSharingData(null);
        }
        
        onSuccess?.();
      } else {
        const newTask = await addTask(taskData);
        
        // If we have a new task and pending sharing data, share it immediately
        if (newTask && pendingSharingData) {
          await shareTask(newTask.id, pendingSharingData);
          setPendingSharingData(null);
        }
        
        onSuccess?.();
      }
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

  const handleOpenSharingModal = () => {
    setIsSharingModalOpen(true);
  };

  const handleShare = async (sharingData: TaskSharingData) => {
    // If we're editing an existing task, share it immediately
    if (editingTask) {
      await shareTask(editingTask.id, sharingData);
      setIsSharingModalOpen(false);
    } else {
      // For new tasks, store the sharing data and submit the form
      setPendingSharingData(sharingData);
      setIsSharingModalOpen(false);
      
      // Trigger form submission
      form.handleSubmit(onSubmit)();
    }
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
          <TaskFormActions 
            onCancel={onCancel}
            onShare={handleOpenSharingModal}
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

      <TaskSharingModal
        open={isSharingModalOpen}
        onClose={() => setIsSharingModalOpen(false)}
        onShare={handleShare}
        taskTitle={form.watch("title") || "New Task"}
      />
    </>
  );
};

export default TaskFormContainer;
