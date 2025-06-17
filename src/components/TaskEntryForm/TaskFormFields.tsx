
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Task } from "@/types/task";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DateFields from "./DateFields";

interface TaskFormFieldsProps {
  form: UseFormReturn<any>;
  categories: string[];
  editingTask?: Task;
}

const TaskFormFields = ({ form, categories, editingTask }: TaskFormFieldsProps) => {
  return (
    <div className="space-y-6">
      {/* Title Field */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-poppins">Title *</FormLabel>
            <FormControl>
              <Input placeholder="Enter task title" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Category Field */}
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-poppins">Category *</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter category" 
                list="categories"
                {...field} 
              />
            </FormControl>
            <datalist id="categories">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Notes Field */}
      <FormField
        control={form.control}
        name="subtitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-poppins">Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter notes (optional)"
                rows={2}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Date Fields */}
      <DateFields 
        register={form.register}
        errors={form.formState.errors}
        setValue={form.setValue}
        watch={form.watch}
      />

      {/* Repeat Field */}
      <FormField
        control={form.control}
        name="repeatValue"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-poppins">Repeat *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="font-poppins">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="daily" className="font-poppins">Daily</SelectItem>
                <SelectItem value="weekly" className="font-poppins">Weekly</SelectItem>
                <SelectItem value="monthly" className="font-poppins">Monthly</SelectItem>
                <SelectItem value="yearly" className="font-poppins">Yearly</SelectItem>
                <SelectItem value="custom" className="font-poppins">Custom</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Share Field */}
      <FormField
        control={form.control}
        name="isShared"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="font-poppins">
                Share this task
              </FormLabel>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};

export default TaskFormFields;
