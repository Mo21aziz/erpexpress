import { Plus } from "lucide-react";

interface AddCategoryButtonProps {
  onClick: () => void;
}

export function AddCategoryButton({ onClick }: AddCategoryButtonProps) {
  return (
    <div
      onClick={onClick}
      className="w-full h-32 border-2 border-dashed border-green-300 hover:border-green-400 hover:bg-green-50 transition-all duration-200 bg-transparent text-green-600 hover:text-green-700 cursor-pointer flex items-center justify-center rounded-lg"
    >
      <div className="flex flex-col items-center space-y-2">
        <Plus className="h-8 w-8" />
        <span className="font-medium">Ajouter une catégorie</span>
        <span className="text-sm text-gray-500">Légumes, fruits, etc.</span>
      </div>
    </div>
  );
}
