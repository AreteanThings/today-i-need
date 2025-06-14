
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CategoryFieldProps {
  register: any;
  categories: string[];
  error?: string;
}

const CategoryField = ({ register, categories, error }: CategoryFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor="category" className="font-poppins">Category *</Label>
    <Input
      id="category"
      {...register("category")}
      placeholder="Enter category"
      list="categories"
      className={error ? "border-destructive" : ""}
    />
    <datalist id="categories">
      {categories.map((category) => (
        <option key={category} value={category} />
      ))}
    </datalist>
    {error && (
      <p className="text-sm text-destructive font-poppins">{error}</p>
    )}
  </div>
);

export default CategoryField;
