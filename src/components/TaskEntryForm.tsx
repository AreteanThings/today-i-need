import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTasks } from "@/hooks/useTasks";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import CategoryField from "./TaskEntryForm/CategoryField";
import TitleField from "./TaskEntryForm/TitleField";
import NotesField from "./TaskEntryForm/NotesField";
import DateFields from "./TaskEntryForm/DateFields";
import RepeatField from "./TaskEntryForm/RepeatField";
import ShareField from "./TaskEntryForm/ShareField";
import FormActions from "./TaskEntryForm/FormActions";

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

interface TaskEntryFormProps {
  onClose: () => void;
  editingTask?: any;
}

export default function TaskEntryForm({ onClose, editingTask }: TaskEntryFormProps) {
  const { toast } = useToast();
  const { addTask, updateTask, tasks, categories } = useTasks();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
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

  const [customRepeatOpen, setCustomRepeatOpen] = useState(false);
  const [customRrule, setCustomRrule] = useState<string | undefined>(editingTask?.customRrule);

  // Edit mode: reset form with existing task
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

  const onSubmit = async (data: TaskFormData) => {
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
        await updateTask(editingTask.id, {
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
        await addTask(taskData);
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <CategoryField register={register} categories={categories} error={errors.category?.message} />
      <TitleField register={register} error={errors.title?.message} />
      <NotesField register={register} />
      <DateFields register={register} errors={errors} />
      <RepeatField
        repeatValue={watch("repeatValue")}
        setRepeatValue={(v) => setValue("repeatValue", v as any)}
        customRepeatOpen={customRepeatOpen}
        setCustomRepeatOpen={setCustomRepeatOpen}
        customRrule={customRrule}
        setCustomRrule={setCustomRrule}
      />
      <ShareField
        checked={watch("isShared")}
        onCheckedChange={checked => setValue("isShared", !!checked)}
      />
      <FormActions onCancel={handleCancel} isSubmitting={isSubmitting} />
    </form>
  );
}
