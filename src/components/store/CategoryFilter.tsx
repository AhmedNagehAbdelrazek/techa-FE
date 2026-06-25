"use client";

interface FlatCategory {
  id: string;
  name: string;
  depth: number;
}

interface CategoryFilterProps {
  categories: FlatCategory[];
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
}

export function CategoryFilter({ categories, selectedCategories, onCategoryToggle }: CategoryFilterProps) {
  if (categories.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Category</h3>
      <div className="space-y-2">
        {categories.map((cat) => {
          const isChecked = selectedCategories.includes(cat.id);
          return (
            <label
              key={cat.id}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onCategoryToggle(cat.id)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span style={{ paddingLeft: cat.depth * 12 }}>{cat.name}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
