
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Task } from "@/types/task";
import TitleField from "./TitleField";
import CategoryField from "./CategoryField";
import NotesField from "./NotesField";
import DateFields from "./DateFields";
import RepeatField from "./RepeatField";
import ShareField from "./ShareField";

interface TaskFormFieldsProps {
  form: UseFormReturn<any>;
  categories: string[];
  editingTask?: Task;
}

const TaskFormFields = ({ form, categories, editingTask }: TaskFormFieldsProps) => {
  return (
    <div className="space-y-6">
      <TitleField form={form} />
      <CategoryField form={form} categories={categories} />
      <NotesField form={form} />
      <DateFields form={form} />
      <RepeatField form={form} />
      <ShareField form={form} editingTask={editingTask} />
    </div>
  );
};

export default TaskFormFields;
