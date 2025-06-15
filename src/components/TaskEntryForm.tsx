import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Task } from "@/types/task";
import { useTasks } from "@/hooks/useTasks";
import { useToast } from "@/hooks/use-toast";
import { useLoading } from "@/contexts/LoadingContext";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import CategoryField from "./TaskEntryForm/CategoryField";
import TitleField from "./TaskEntryForm/TitleField";
import NotesField from "./TaskEntryForm/NotesField";
import DateFields from "./TaskEntryForm/DateFields";
import RepeatField from "./TaskEntryForm/RepeatField";
import ShareField from "./TaskEntryForm/ShareField";
import FormActions from "./TaskEntryForm/FormActions";
import TaskShareContactsField from "./TaskEntryForm/TaskShareContactsField";
import { useAuth } from "@/hooks/useAuth";
import { getTaskShares, setTaskShares } from "@/lib/taskShares";

const taskSchema = z.object({
  category: z.string().min(1, "Category is required").max(50, "Category must be less than 50 characters"),
  title: z.string().min(2, "Title must be at least 2 characters").max(100, "Title must be less than 100 characters"),
  subtitle: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  repeatValue: z.enum(["daily", "weekly", "monthly", "yearly", "custom"]),
  isShared: z.boolean().default(false),
}).refine((data) => {
  if (data.endDate && data.startDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskEntryFormProps {
  onClose: () => void;
  editingTask?: Task;
}

export default function TaskEntryForm({ onClose, editingTask }: TaskEntryFormProps) {
  const { toast } = useToast();
  const { addTask, updateTask, tasks, categories } = useTasks();
  const { isLoading } = useLoading();
  const { user } = useAuth();

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
      category: editingTask?.category || "",
      title: editingTask?.title || "",
      subtitle: editingTask?.subtitle || "",
      startDate: editingTask?.startDate || new Date().toISOString().split("T")[0],
      endDate: editingTask?.endDate || "",
      repeatValue: editingTask?.repeatValue || "daily",
      isShared: editingTask?.isShared || false,
    },
  });

  const [customRepeatOpen, setCustomRepeatOpen] = useState(false);
  const [customRrule, setCustomRrule] = useState<string | undefined>(editingTask?.customRrule || "");
  const [customRruleText, setCustomRruleText] = useState<string | undefined>(editingTask?.customRruleText || "");

  // Use state for shared emails
  const [shareEmails, setShareEmails] = useState<string[]>([]);
  const isFormLoading = isSubmitting || isLoading('addTask') || isLoading(`updateTask-${editingTask?.id}`);

  // On edit: fetch shareEmails from DB
  useEffect(() => {
    let cancelled = false;
    async function fetchShares() {
      if (editingTask?.id && user) {
        try {
          const emails = await getTaskShares(editingTask.id);
          if (!cancelled) setShareEmails(emails);
        } catch (err) {
          // Could toast error here if desired
          setShareEmails([]);
        }
      } else {
        setShareEmails([]);
      }
    }
    fetchShares();
    return () => { cancelled = true; };
    // eslint-disable-next-line
  }, [editingTask, user]);

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
      setCustomRrule(editingTask.customRrule || "");
      setCustomRruleText(editingTask.customRruleText || "");
      if (editingTask.repeatValue === "custom") {
        setValue("repeatValue", "custom");
      }
      // shareEmails is now fetched from DB above
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingTask, reset, setValue]);

  const onSubmit = async (data: TaskFormData) => {
    const existingTask = tasks.find(
      (task: Task) =>
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
      let taskId: string | undefined;
      if (editingTask) {
        await updateTask(editingTask.id, {
          ...data,
          customRrule: data.repeatValue === "custom" ? customRrule : undefined,
          customRruleText: data.repeatValue === "custom" ? customRruleText : undefined,
          endDate: data.endDate || undefined
        });
        taskId = editingTask.id;
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
          customRruleText: data.repeatValue === "custom" ? customRruleText : undefined,
        };
        // addTask returns nothing, so fetch the most recent task after adding
        await addTask(taskData);
        // refetch tasks to get the latest added task (assumes it's last in array)
        await new Promise(r => setTimeout(r, 100)); // tiny delay for consistency
        const latestTasks = tasks.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        taskId = latestTasks[0]?.id;
      }
      // Save shared emails if shared
      if (data.isShared && taskId && user) {
        await setTaskShares(taskId, user.id, shareEmails);
      }
      onClose();
    } catch (error) {
      // Error handling is now done in the hook with toasts
      console.error('Form submission error:', error);
    }
  };

  const handleCancel = () => {
    if (!isFormLoading) {
      reset();
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <CategoryField register={register} categories={categories} error={errors.category?.message} />
      <TitleField register={register} error={errors.title?.message} />
      <NotesField register={register} />
      <DateFields register={register} errors={errors} />
      <RepeatField
        repeatValue={watch("repeatValue")} // This will now be correct for edit OR create
        setRepeatValue={(v) => setValue("repeatValue", v as any)}
        customRepeatOpen={customRepeatOpen}
        setCustomRepeatOpen={setCustomRepeatOpen}
        customRrule={customRrule}
        setCustomRrule={setCustomRrule}
        customRruleText={customRruleText}
        setCustomRruleText={setCustomRruleText}
      />
      <ShareField
        checked={watch("isShared")}
        onCheckedChange={checked => setValue("isShared", !!checked)}
      />
      {watch("isShared") && (
        <TaskShareContactsField
          selectedEmails={shareEmails}
          setSelectedEmails={setShareEmails}
        />
      )}
      {isFormLoading && (
        <div className="flex justify-center py-4">
          <LoadingSpinner text="Saving task..." />
        </div>
      )}

      <FormActions 
        onCancel={handleCancel} 
        isSubmitting={isFormLoading}
      />
    </form>
  );
}
